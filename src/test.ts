const assert = require("chai").assert;
const fs = require("fs");
const EventEmitter = require("events").EventEmitter;

import { JumioMainSync } from "./modules/jumio/JumioMainModule";
import { SFTP } from "./modules/sftp/sftpFileModule";
import { CSVToDB } from "./modules/sftp/csvToDbModule";
import SQLDB from "./modules/dbModule";

const emitter = new EventEmitter();

describe("Jumio Module Test", function() {
  it("It should push to the read the top 10 users info the find the relative result from the jumio", function(done) {
    this.timeout(0);
    let db = new SQLDB();
    db.truncate('users');
    let jumio1 = new JumioMainSync();
    let jumioEventEmitter1 = jumio1.getEventEmit;
      jumio1.mainRun(10);
      jumioEventEmitter1.on("jumioAction", function() {
      console.log("Jumio Action Done");
      done();
    });
  });

  after(async function() {
    // runs after all tests in this block
    let db = new SQLDB();
    await db.truncate('users')
  });
});

describe("SFTP Module Test", function() {
  it("It should read the lates file from the SFTP server", async function() {
    let sftp = new SFTP();
    this.timeout(0)
    await sftp.createConnection();
    let downloadFile = await sftp.downloadTargetFile();
    if (downloadFile.result) {
      sftp.getEventEmiiter.on("writeData", function() {
        console.log(`SFTP - file ${1} writing done!`);
        assert.equal(downloadFile.result, true);
      }); 
    }
  });

  it("It should read the data between 1537995547000 and 1538088927000 by using time range function of downloadFiles()", async function() {
    let sftp = new SFTP();
    this.timeout(0)
    await sftp.createConnection();
    let downloadFiles = await sftp.downloadFiles("1537995547000", "1538088927000");
    if (downloadFiles.result) {
      let filesLength = Object.keys(downloadFiles.message.paths).map(Number);
      assert.equal(filesLength.length, 2)
    }
  });

  it("It should download the target file in the target directory", async function() {
    let sftp = new SFTP();
    this.timeout(0)
    await sftp.createConnection();
    let downloadFiles = await sftp.downloadTargetFile("NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20180929.csv", "reports");
    sftp.getEventEmiiter.on("writeData", function() {
      console.log(`SFTP - file ${1} writing done!`);
      emitter.emit("sftpwrite"); 
    });
    assert.equal(downloadFiles.result, true);
  });

  it("It should download all the files in the specific directory", function(done) {
    let sftp = new SFTP();
    let self = this;
    emitter.on("sftpwrite", async function(){
      self.timeout(0) 
      await cleanDirectory();
      await sftp.createConnection();
      let downloadFiles = await sftp.downloadFiles();
      if (downloadFiles.result) {
        let filesLength = Object.keys(downloadFiles.message.paths).map(Number);
        for (let index of filesLength) {
          sftp.getEventEmiiter.on("writeData" + index, async function() {
            console.log(`SFTP - file ${index} writing done!`);
            if (index === filesLength.length - 1) {
              console.log('All files downloaded!!!');
              done()};
          });
        }
      }
    })
  });

});

describe('CSVToDb Module Test', function(){
  it("it should insert one target CSV file into the database", function(done){
    let db = new SQLDB("userDb", "acct_entry_hist");
    db.truncate();
    this.timeout(0)
    let arr = ["./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20180929.csv"];
    let csvDB = new CSVToDB(undefined, undefined, "userDb", "acct_entry_hist");
    csvDB.singleFile(arr[0]);
    csvDB.getEventEmiiter.on("insertData", function() {
      console.log("SingleFile -> Inserted event"); 
      done();
    });
  })
  
  it("it should insert multiple target CSV file into the database", function(done){
    this.timeout(0)
    let arr = [
      "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20180929.csv",
      "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20180926.csv"
    ];
    let db = new SQLDB("userDb", "acct_entry_hist");
    db.truncate();
    let csvDB2 = new CSVToDB(undefined, undefined, "userDb", "acct_entry_hist");
    csvDB2.multipleFiles(arr);
    let i = 0;
    csvDB2.getEventEmiiter.on("insertData", function() {
      console.log("MultipleFile -> Inserted event: " + i); 
      i++;
      if(i === 1) { done()};
    });
  })

  after( function(done) {
    this.timeout(0);
    // runs after all tests in this block
    let db = new SQLDB("userDb", "acct_entry_hist");
     cleanDirectory();
     db.truncate();
    done();
  });
})


async function cleanDirectory(dir: string = 'reports'){
  fs.readdir(dir, function<T>(err:any, files: Array<T>){
    if (err) throw err;
    console.log(files);
    for(let file of files){
      fs.unlink(`./${dir}/${file}`, (err: any) => {
        if(err) throw err;
      })
    }
  })
}
