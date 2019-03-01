"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Datastore = require("@google-cloud/datastore"), datastore = new Datastore({
    projectId: "nauticus-platform"
}), rp = require("request-promise"), async = require("async"), EventEmitter = require("events").EventEmitter;
var dbModule_1 = __importDefault(require("../dbModule"));
var dbConfig = __importStar(require("../../configs/dbConfig.json"));
var netVeirifyConfig = __importStar(require("../../configs/netVerifyConfig.json"));
var dataStoreRun = Symbol("dataStoreRun");
var netverifyRun = Symbol("netverifyRun");
var emitter = new EventEmitter();
var JumioMainSync = /** @class */ (function () {
    function JumioMainSync(table, database, namespace, kind) {
        if (table === void 0) { table = "users"; }
        if (database === void 0) { database = dbConfig.database; }
        if (namespace === void 0) { namespace = "verify"; }
        if (kind === void 0) { kind = "cases"; }
        this.query = datastore.createQuery(namespace, kind);
        this.initDb = new dbModule_1.default(database, table);
    }
    /**
     *  Main function to run the program defaultly
     */
    JumioMainSync.prototype.mainRun = function (limit) {
        var _this = this;
        // console.log(limit)
        if (typeof limit != "number" || !Number.isInteger(limit) || limit <= 0)
            throw new Error("Input Limit number error! The input limit should be a valid integer");
        this[dataStoreRun]()
            .then(function (d) {
            // console.log(d.length);
            if (limit > d.length)
                throw new Error("Input Limit number error! The input limit is exceed the Maximum data count of datastore!");
            _this[netverifyRun](d, limit);
        })
            .catch(function (e) {
            console.log(e);
        });
    };
    /**
     * private function to run the query of the datastore
     */
    JumioMainSync.prototype[dataStoreRun] = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                datastore.runQuery(_this.query).then(function (d) {
                    // console.log(d[0]);
                    resolve(d[0]);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    };
    /**
     *  To send the request the netverify and Retrieving scan details with the Jumio Reference
     */
    JumioMainSync.prototype[netverifyRun] = function (data, limit) {
        if (limit === void 0) { limit = data.length; }
        for (var i = 0; i < limit; i++) {
            console.log(data[i].jumioRef);
            if (!Object.is(data[i].jumioRef, "")) {
                var da = data[i];
                var task = {
                    db: this.initDb,
                    options: {
                        url: "https://netverify.com/api/netverify/v2/scans/" + da.jumioRef + "/data",
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
                insertDBTaskWithNetVerify.push(task, function (err) {
                    if (err)
                        throw new Error(err);
                    console.log("This data is finished processing!");
                });
            }
        }
    };
    Object.defineProperty(JumioMainSync.prototype, "getEventEmit", {
        get: function () {
            return emitter;
        },
        enumerable: true,
        configurable: true
    });
    return JumioMainSync;
}());
exports.JumioMainSync = JumioMainSync;
/**
 *  To set up the task queue and do the check user exist in the DB, and then insert the relavent user data into DB
 */
var insertDBTaskWithNetVerify = async.queue(function (task, callback) {
    rp(task.options)
        .then(function (result) {
        if (Object.is(result.document.status, "APPROVED_VERIFIED")) {
            var obj_1 = {
                fname: result.document.firstName,
                lname: result.document.lastName,
                dob: result.document.dob,
                rnumber: result.document.number
            };
            task.db.checkDataExist(obj_1).then(function (d) {
                if (d.result != true) {
                    // console.log(result.document.firstName);
                    task.db
                        .insertData(obj_1)
                        .then(function (d) {
                        if (d)
                            console.log("DB save successfully");
                        else
                            console.log("DB save failed");
                    })
                        .catch(function (e) { return console.log(e); });
                }
                else
                    console.log("Data existed");
            });
        }
        callback();
    })
        .catch(function (err) {
        console.log(err);
    });
}, 3);
insertDBTaskWithNetVerify.drain = function () {
    console.log("All data have been processed");
    emitter.emit("jumioAction");
};
// let jumio1 = new JumioMainSync();
// let jumioEventEmitter1 = jumio1.getEventEmit;
// jumio1.mainRun(0);
// jumioEventEmitter1.on("jumioAction", function() {
//   console.log("Jumio Action Done");
// });
