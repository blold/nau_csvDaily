const fs = require("fs"),
  queue = require("async/queue"),
  // EventEmitter = require("events").EventEmitter,
  // fastCSV = require("fast-csv"),
  csv = require("csv");

import DB from "../dbModule";
import { EventEmitter } from "events";

// const emitter: any = new EventEmitter();

/**
 * This class is to read the CSV file and save the valid data into the DB
 * including: singleFile(), multipleFiles();
 */
export class CSVToDB {
  private path?: string;
  private paths?: any;
  private database?: any;
  private table: string;
  private eventEmitter: EventEmitter;

  /**
   *
   * @param {the path of file: String} path
   * @param {the path of files: String} paths
   * @param {mysql database: String} database
   * @param {db table: String} table
   * @param {NO NEED} currentDB
   */
  constructor(
    path?: string,
    paths?: any,
    database: string = "userDb",
    table: string = "acct_entry_hist"
  ) {
    this.path = path;
    this.paths = paths;
    this.database = new DB(database, table);
    this.table = table;
    this.eventEmitter = new EventEmitter();
  }

  /**
   * Run the programe and use the parser and transfrom to read CSV
   */
  singleFile(path: string | undefined = this.path, table: string = this.table) {
    if (!path || path === undefined)
      throw new Error("{ result: true , message: the path not found}");
    let task = {
      path: path,
      parser: parser(),
      db: this.database,
      table: table, 
      emitter: this.eventEmitter
    };
    q.push(task, function() {
      console.log("finished processing CSV");
    });
  }

  /**
   * Read a path list and push the data into the writing queue
   * @param list
   */
  multipleFiles(
    paths: any = this.paths,
    table: string = this.table
  ) {
    if (!paths || paths === undefined)
      throw new Error("{ result: true , message: the paths not found}");
    paths.forEach((d: any) => {
      let task = {
        path: d,
        parser: parser(),
        db: this.database,
        table: table,
        emitter: this.eventEmitter
      };
      q.push(task, function() {
        console.log("finished processing CSVs");
      });
    }); 
  }

  get getEventEmiiter() {
    return this.eventEmitter;
  }

  get getDB() {
    return this.database;
  }
}

/**
 * Set up the csv parse method, it is seperated by comma
 */
function parser() {
  return csv.parse({
    delimiter: ",",
    columns: true
  });
}

// Create a queue object with pipe stream
var q = queue(function(task: any, callback: any) {
  try {
    let array:any = [];
    fs.createReadStream(task.path)
      .pipe(task.parser)
      .on('data', function(data:any){
          try {
              let obj = data;
              obj.created_at = new Date();
              obj.updated_at = new Date();
              array.push(obj);
          }
          catch(err) {
              throw new Error(err);
          }
      })
      .on('end',function(){
          task.db.batchInsert(array, task.table).then((d:any) => {
            console.log(d);
            task.emitter.emit('insertData')
          }).catch((error:any) => {
            throw new Error(`{ result: false , tips: please check your data validation !, message: pipe error: ${error}}`);
          });
      });  
  } catch (error) {
    throw new Error(`{ result: false , tips: please check your data validation !, message: pipe error: ${error}}`);
  }
  callback();
}, 2);

// Assign a callback
q.drain = function() {
  console.log("all items have been processed");
};




// let arr = [
//   // "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20181011.csv",
//   // "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20181002.csv",
//   // "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20180606.csv",
//   // "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20180924.csv",
//   // "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20181007.csv",
//   // "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20180930.csv"
//   // "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20181006.csv",
//   // "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20181008.csv",
//   // "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20181005.csv"
//   // "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20181014.csv",
//   // "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20181009.csv",
//   // "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20181012.csv",
//   // "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20181004.csv",
//   // "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20181010.csv",
//   // "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20181003.csv",
//   // "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20181001.csv",
//   // "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20180926.csv",
//   // "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20180925.csv",
//   // "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20180928.csv",
//   // "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20181013.csv",
//   // "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20180927.csv",
//   "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20180929.csv"
// ]; 
// // let arr = ["./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_EMPTY.csv"];
// let csvDB = new CSVToDB();
// async function testF() {
//   await csvDB.multipleFiles(arr);
// }
// let i = 1;
// csvDB.getEventEmiiter.on("insertData", function() {
//   console.log("Inserted event: " + i); 
//   i++;
// });
// testF();
