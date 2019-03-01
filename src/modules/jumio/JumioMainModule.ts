const Datastore = require("@google-cloud/datastore"),
  datastore = new Datastore({
    projectId: "nauticus-platform"
  }),
  rp = require("request-promise"),
  async = require("async"),
  EventEmitter = require("events").EventEmitter;

import DB from "../dbModule";
import * as dbConfig from "../../configs/dbConfig.json";
import * as netVeirifyConfig from "../../configs/netVerifyConfig.json";
import { requestTaskOption } from "../../declaresInterfaces";

const dataStoreRun = Symbol("dataStoreRun");
const netverifyRun = Symbol("netverifyRun");
const emitter = new EventEmitter();


/**
 * This module is to read the user info and compare it with jumio, and then save the successful data into the DB
 * 
 */
export class JumioMainSync {
  private query: any;
  private initDb: any;

  constructor(
    table = "users",
    database = dbConfig.database,
    namespace = "verify",
    kind = "cases"
  ) {
    this.query = datastore.createQuery(namespace, kind);
    this.initDb = new DB(database, table);
  }

  /**
   *  Main function to run the program defaultly
   */
  mainRun(limit: number) {
    if (typeof limit != "number" || !Number.isInteger(limit) || limit <= 0)
      throw new Error(
        "Input Limit number error! The input limit should be a valid integer"
      );
    this[dataStoreRun]()
      .then((d: any) => {
        if (limit > d.length)
          throw new Error(
            "Input Limit number error! The input limit is exceed the Maximum data count of datastore!"
          );
        this[netverifyRun](d, limit);
      })
      .catch(e => {
        console.log(e);
      });
  }

  /**
   * private function to run the query of the datastore
   */
  [dataStoreRun]() {
    return new Promise((resolve, reject) => {
      try {
        datastore.runQuery(this.query).then((d: any) => {
          // console.log(d[0]);
          resolve(d[0]);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   *  To send the request the netverify and Retrieving scan details with the Jumio Reference
   */
  [netverifyRun](data: any, limit = data.length) {
    for (let i = 0; i < limit; i++) {
      console.log(data[i].jumioRef);
      if (!Object.is(data[i].jumioRef, "")) {
        let da = data[i];
        let task = {
          db: this.initDb,
          options: {
            url: `https://netverify.com/api/netverify/v2/scans/${
              da.jumioRef
            }/data`,
            headers: {
              "User-Agent": netVeirifyConfig.userAgent,
              Accept: "application/json"
            },
            auth: {
              user: netVeirifyConfig.user,
              pass: netVeirifyConfig.pass
            },
            json: true,
            Connection: "keep-alive"
          }
        };
        insertDBTaskWithNetVerify.push(task, function(err: any) {
          if (err) throw new Error(err);
          console.log("This data is finished processing!");
        });
      }
    }
  }

  get getEventEmit() {
    return emitter;
  }
}

/**
 *  To set up the task queue and do the check user exist in the DB, and then insert the relavent user data into DB
 */
var insertDBTaskWithNetVerify = async.queue(function(
  task: requestTaskOption,
  callback: any
) {
  rp(task.options)
    .then((result: any) => {
      if (Object.is(result.document.status, "APPROVED_VERIFIED")) {
        let obj = {
          fname: result.document.firstName,
          lname: result.document.lastName,
          dob: result.document.dob,
          rnumber: result.document.number
        };
        task.db.checkDataExist(obj).then((d: any) => {
          if (d.result != true) {
            task.db
              .insertData(obj)
              .then((d: any) => {
                if (d) console.log("DB save successfully");
                else console.log("DB save failed");
              })
              .catch((e: any) => console.log(e));
          } else console.log("Data existed");
        });
      }
      callback();
    })
    .catch((err: any) => {
      console.log(err);
    });
},
3);

/**
 * Emit the action when all data have been processed
 */
insertDBTaskWithNetVerify.drain = function() {
  console.log("All data have been processed");
  emitter.emit("jumioAction");
};



// let jumio1 = new JumioMainSync();
// let jumioEventEmitter1 = jumio1.getEventEmit;
// jumio1.mainRun(0);
// jumioEventEmitter1.on("jumioAction", function() {
//   console.log("Jumio Action Done");
// });
