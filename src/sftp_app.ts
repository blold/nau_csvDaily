const schedule = require("node-schedule");
const EventEmitter = require("events").EventEmitter;
require("events").EventEmitter.defaultMaxListeners = Infinity;

import { SFTP } from "./modules/sftp/sftpFileModule";
import { CSVToDB } from "./modules/sftp/csvToDbModule";

const emitter = new EventEmitter();

/**
 * 1. Right now, the programe will be executed when the second is 30, more detail: https://github.com/node-schedule/node-schedule
 * 2. Run the sftp program to get the latest CSV file, then save the CSV data into the acct_entry_hist table.
 * 
 * Time schedule setting:
      *    *    *    *    *    * 
      ┬    ┬    ┬    ┬    ┬    ┬
      │    │    │    │    │    │
      │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
      │    │    │    │    └───── month (1 - 12)
      │    │    │    └────────── day of month (1 - 31)
      │    │    └─────────────── hour (0 - 23)
      │    └──────────────────── minute (0 - 59)
      └───────────────────────── second (0 - 59, OPTIONAL)
 */

// Keep tracting the lastest csv and save the data into the DB
schedule.scheduleJob("30 * * * * *", async function() {

  let sftp = new SFTP();
  let csvToDb = new CSVToDB();
  await sftp.createConnection();

  // The latest csv function
  let downloadFile = await sftp.downloadTargetFile();
  if (downloadFile.result) {
    sftp.getEventEmiiter.on("writeData", function() {
      console.log(`SFTP - file ${1} writing done!`);
      csvToDb.multipleFiles(downloadFile.message.paths);
    }); 
  }
});




// let downloadFiles: any;
// async function test1() {
//   let sftp = new SFTP();
//   await sftp.createConnection();

//   // The latest csv function
//   downloadFiles = await sftp.downloadTargetFile("NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20180929.csv", "reports");
//   downloadFiles = await sftp.downloadTargetFile();
//   if (downloadFiles.result) {
//     sftp.getEventEmiiter.on("writeData", function() {
//       console.log(`SFTP - file ${1} writing done!`);
//       emitter.emit("startToDB"); 
//     }); 
//   }

//   // Target file function
//   downloadFiles = await sftp.downloadTargetFile("NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20180929.csv", "reports");
//   if (downloadFiles.result) {
//     sftp.getEventEmiiter.on("writeData", function() {
//       console.log(`SFTP - file ${1} writing done!`);
//       emitter.emit("startToDB"); 
//     }); 
//   }

//   // Time range function
//   downloadFiles = await sftp.downloadFiles("1537995547000", "1538088927000");
//   if (downloadFiles.result) {
//     let filesLength = Object.keys(downloadFiles.message.paths).map(Number);
//     for (let index of filesLength) {
//       sftp.getEventEmiiter.on("writeData" + index, function() {
//         console.log(`SFTP - file ${index} writing done!`);
//         if (index === filesLength.length - 1) emitter.emit("startToDB");
//       });
//     }
//   }
 
//   // All data function
//   downloadFiles = await sftp.downloadFiles();
//   if (downloadFiles.result) {
//     let filesLength = Object.keys(downloadFiles.message.paths).map(Number);
//     for (let index of filesLength) {
//       sftp.getEventEmiiter.on("writeData" + index, function() {
//         console.log(`SFTP - file ${index} writing done!`);
//         if (index === filesLength.length - 1) emitter.emit("startToDB");
//       });
//     }
//   }
 
// }

// emitter.on("startToDB", () => {
//   console.log("start DB saving ~~~");
//   let csvToDb = new CSVToDB();
//   let arr = downloadFiles.message.paths;
//   console.log(arr);
//   csvToDb.multipleFiles(arr);
// });
