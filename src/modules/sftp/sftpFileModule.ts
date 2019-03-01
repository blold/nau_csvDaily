const Client = require("ssh2-sftp-client"),
  queue = require("async/queue"),
  fs = require("fs");
require("events").EventEmitter.prototype._maxListeners = 100;

import * as sftpConfig from "../../configs/sftpConfig.json";
import { EventEmitter } from "events";

// const emitter: any = new EventEmitter();

/**
 * This is the SFTP class, including downloadTargetFile(), downloadFiles(), createConnection(), endConnection()
 * There are four main function about this module, including downloading all data, downloading the specific file, dowload the files based on the time range. download the latest file.
 */
export class SFTP {
  private host: string;
  private port: string;
  private username: string;
  private password: string;
  private sftp: any;
  private targetFile?: string | undefined;
  private targetDir?: string | undefined;
  private eventEmitter: EventEmitter;

  /**
   *
   * @param {the target file: string | undefined} targetFile
   * @param {the root directory: string} dir
   * @param {sftp host url: String} host
   * @param {sftp port: String} port
   * @param {username: String} username
   * @param {password: String} password
   */
  constructor(
    targetFile: string | undefined = undefined,
    dir: string = "reports",
    host: string = sftpConfig.host,
    port: string = sftpConfig.port,
    username: string = sftpConfig.username,
    password: string = sftpConfig.password
  ) {
    this.host = host;
    this.port = port;
    this.username = username;
    this.password = password;
    this.sftp = new Client();
    this.targetFile = targetFile;
    this.targetDir = dir;
    this.eventEmitter = new EventEmitter();
  }

  /**
   * Download ont specific file
   * Default function is to download the latest file if no targetFile is passed
   * @param targetFile : specific file that wants to get from the server side
   * @param targetDir : specific directory that wants to get from the server side
   */
  async downloadTargetFile(
    targetFile: string | undefined = this.targetFile,
    targetDir: string | undefined = this.targetDir
  ) {
    try {
      if (!checkLocalFileExist(targetDir, targetFile))
        throw new Error(`{result: false, message: File existed!}`);
      let getlistData = await this.sftp.list(`/${targetDir}`);
      // console.log(getlistData)
      if (!checkTargetFileValid(getlistData, targetFile))
        throw new Error(
          `{result: false, message: targetFile or targetDirectory check failed!}`
        );
      // Get the target CSV file
      let getTargetFile: any = await findOutTargetCSV(getlistData, targetFile);
      let task = {
        targetDir,
        name: getTargetFile[0].name,
        sftp: this.sftp,
        eventNames: "writeData", 
        emitter: this.eventEmitter
      };
      q.push(task, function(err: any) {
        if (err) throw new Error(`{result: false, message: ${err}}`);
        console.log("finished push task!");
      });

      // Return the result
      if (getTargetFile[0].name)
        return {
          result: true,
          message: { paths: [`./${targetDir}/${getTargetFile[0].name}`] }
        };
      else return { result: false, message: { paths: getTargetFile[0] } };
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Download multiple files from the server
   * Function 1: default funcionn is to download all files based on the current directory
   * Function 2: get all files that are between the startTime and endTime based on the current directory
   * @param startTime
   * @param endTime
   * @param targetDir
   */
  async downloadFiles(
    startTime?: string,
    endTime?: string,
    targetDir: string | undefined = this.targetDir
  ) {
    let finalListData: any = [];
    try {
      let getAllListData = await this.sftp.list(`/${targetDir}`);
      finalListData = getAllListData;
      if (!checkTimeRangeValid(getAllListData, startTime, endTime))
        throw new Error(
          `{result: false, message: startTime or endTime check failed!}`
        );

      if (startTime != undefined && endTime != undefined) {
        finalListData = await findOutTargetCSV(
          getAllListData,
          undefined,
          startTime,
          endTime
        );
      }
      finalListData.forEach((el: any, index: any) => {
        let task = {
          targetDir,
          name: el.name,
          sftp: this.sftp,
          eventNames: "writeData" + index, 
          emitter: this.eventEmitter
        };
        q.push(task, function() {
          console.log("finished push task!");
        });
      });

      // Get the final return results
      let returnListData = finalListData.map(
        (d: any) => `./${targetDir}/${d.name}`
      );
      if (returnListData.length > 0)
        return { result: true, message: { paths: returnListData } };
      else return { result: false, message: { paths: returnListData } };
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Create a connecton to the sftp server
   */
  createConnection() {
    return new Promise((res, rej) => {
      try {
        let connect = this.sftp.connect({
          host: this.host,
          port: this.port,
          username: this.username,
          password: this.password
        });
        res(connect);
      } catch (error) {
        console.log(error);
        rej(error);
      }
    });
  }

  endConnection() {
    this.sftp.end();
  }

  get getEventEmiiter() {
    return this.eventEmitter;
  }
}

/**
 * check the validation in the time range
 */
function checkTimeRangeValid<T>(data: any, startTime: T, endTime: T): Boolean {
  let result: Boolean;
  let timeRangeIndex = data.map((d: any, i: any) => {
    if (d.modifyTime <= endTime && d.modifyTime >= startTime) return i;
  });
  timeRangeIndex.length > 0 ? (result = true) : (result = false);

  return result;
}

// create a queue object with concurrency 2
var q = queue(async function(task: any, callback: any) {
  let targetPath = `/${task.targetDir}/${task.name}`;
  if (checkLocalFileExist(task.targetDir, task.name)) {
    let fileDataStream = await task.sftp.get(targetPath);
    let resultWrite: any = await writeFile(task.targetDir, fileDataStream);
    // console.log(resultWrite);
    if (resultWrite.result) {
      task.emitter.emit(task.eventNames);
    }
  } else {
    console.log("File existed!");
  }
  callback();
}, 4);

// assign a callback
q.drain = function() {
  console.log("all items have been processed");
};

/**
 * Find out the latest CSV file from the ListData
 * Default is to find out latest CSV in the SFTP server
 * @param {SFTP ListData} data
 * @param {list of files} targetFiles
 * @param {timestamp} startTime
 * @param {timestamp} endTime
 */
function findOutTargetCSV<T>(
  data: any,
  targetFiles?: T,
  startTime?: T,
  endTime?: T
) {
  return new Promise((res, rej) => {
    let resultFiles: Array<T> = [];
    try {
      // Find out latest file`s index
      if (
        targetFiles === undefined &&
        startTime === undefined &&
        endTime === undefined
      ) {
        let maxTime = Math.max(...data.map((d: any) => d.modifyTime));
        let maxData = data.filter((v: any) => v.modifyTime == maxTime);
        resultFiles.push(maxData[0]);
        res(resultFiles);
      }
      // Find out the files between the startTime and endTime
      if (
        targetFiles === undefined &&
        startTime != undefined &&
        endTime != undefined
      ) {
        resultFiles = data.filter((d: any) => {
          if (d.modifyTime <= endTime && d.modifyTime >= startTime) return d;
        });
        res(resultFiles);
      }
      // Get all the files
      else {
        resultFiles = data.filter((d: any) => {
          return d.name === targetFiles;
        });
        res(resultFiles);
      }
    } catch (error) {
      rej(error);
    }
  })
    .then((finalResult: any) => {
      return finalResult;
    })
    .catch((err: any) => {
      console.log(err);
    });
}

/**
 * Check the local file exist or not
 * @param targetDir
 * @param targetFile
 */
function checkLocalFileExist(
  targetDir: string | undefined,
  targetFile: string | undefined
): Boolean {
  let result: Boolean;
  if (!fs.existsSync(`${targetDir}/${targetFile}`)) result = true;
  else result = false;
  return result;
}

/**
 * Check target file is valid in the list files from server
 * @param data
 * @param targetFile
 */
function checkTargetFileValid<T>(data: any, targetFile: T): Boolean {
  let result: Boolean;
  if (data != undefined && targetFile === undefined) result = true;
  else {
    result = data.some((d: any) => {
      return d.name === targetFile;
    });
  }
  return result;
}

/**
 * Write the file into the target dirctory
 */
function writeFile(dir: string, dataStream: any) {
  return new Promise((res, rej) => {
    try {
      if (!fs.existsSync(`${dir}`)) {
        console.log("Dir not exist yet");
        fs.mkdirSync(`${dir}`);
      }
      dataStream
        .pipe(fs.createWriteStream(`${dir}/` + dataStream.path.split("/")[2]))
        .on("finish", () => {
          // console.log("Done");
          res({ result: true });
        });
    } catch (error) {
      rej(error);
    }
  });
}

// let sftp = new SFTP(undefined);
// async function sftpAsync() {
//   await sftp.createConnection();
//   let downloadFiles: any = await sftp.downloadFiles(
//     "1537995547000",
//     "1538341146000"
//   );
//   console.log(downloadFiles);
//   // emitter.on(downloadFiles.message.paths.length);
//   let filesLength = downloadFiles.message.paths;
//   for (let i = 0; i < filesLength.length; i++) {
//     console.log(i);
//     sftp.getEventEmiiter.on("listData" + i, function() {
//       console.log("Final Done: " + i);
//     });
//   }
// }

// await sftp.downloadFiles();
// let a = await sftp.downloadTargetFile(
//   "NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20180930.csv"
// );
// console.log(a.message);

//   sftp.getEventEmiiter.on("actionListener", function() {
//     console.log("All actions done!");
//     sftp.endConnection();
//   });
// }
// sftpAsync();
