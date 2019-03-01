"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs"), queue = require("async/queue"), EventEmitter = require("events").EventEmitter, csv = require("csv");
var dbModule_1 = __importDefault(require("../dbModule"));
var emitter = new EventEmitter();
var CSVToDB = /** @class */ (function () {
    /**
     *
     * @param {the path of file: String} path
     * @param {mysql database: String} database
     * @param {db table: String} table
     * @param {no need passing} currentDB
     */
    function CSVToDB(path, paths, database, table, currentDB) {
        if (database === void 0) { database = "userDb"; }
        if (table === void 0) { table = "acct_entry_hist"; }
        if (currentDB === void 0) { currentDB = new dbModule_1.default(database, table); }
        this.path = path;
        this.paths = paths;
        /**
         * Set up the csv parse method, it is seperated by comma
         */
        this.parser = csv.parse({
            delimiter: ",",
            columns: true
        });
        /**
         * Set up the csv transform method and read the row, then put them into the acct_entry_hist DB`s table
         */
        this.transform = csv.transform(function (row) {
            var object = row;
            // console.log(object);
            if (checkObjectValid(object, table)) {
                insert_acct_entry_hist_DBAction(currentDB, object);
            }
            else {
                console.log("Check Object failed! It may be caused by a empty CSV, table not found or the error of data formate in CSV");
            }
        });
    }
    /**
     * Run the programe and use the parser and transfrom to read CSV
     */
    CSVToDB.prototype.singleFile = function (path) {
        if (path === void 0) { path = this.path; }
        if (!path || path === undefined)
            throw new Error("{ result: true , message: the path not found}");
        // this.main();
        var task = { path: path, parser: this.parser, transform: this.transform };
        q.push(task, function () {
            console.log("finished processing CSV");
        });
    };
    CSVToDB.prototype.multipleFiles = function (paths) {
        var _this = this;
        if (paths === void 0) { paths = this.paths; }
        if (!paths || paths === undefined)
            throw new Error("{ result: true , message: the paths not found}");
        paths.forEach(function (d) {
            // add some items to the queue
            // console.log(d);
            var task = { path: d, parser: _this.parser, transform: _this.transform };
            q.push(task, function () {
                console.log("finished processing CSV");
            });
        });
    };
    Object.defineProperty(CSVToDB.prototype, "getEventEmiiter", {
        get: function () {
            return emitter;
        },
        enumerable: true,
        configurable: true
    });
    return CSVToDB;
}());
exports.CSVToDB = CSVToDB;
/**
 *  Insert the data object into the table acct_entry_hist
 * @param {acct_entry_hist Data} object
 */
function insert_acct_entry_hist_DBAction(db, object) {
    return __awaiter(this, void 0, void 0, function () {
        var SystemRecordReference, checkResult, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    SystemRecordReference = object.SystemRecordReference;
                    return [4 /*yield*/, db.checkDataExist({ SystemRecordReference: SystemRecordReference })];
                case 1:
                    checkResult = _a.sent();
                    if (!!checkResult.result) return [3 /*break*/, 3];
                    console.log("Inserted!");
                    return [4 /*yield*/, db.transacting(object)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    console.log("Data Existed");
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.log(error_1);
                    throw new Error("{ result: false , message: " + error_1 + "}");
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * check the object readed is valid or not
 */
function checkObjectValid(object, table) {
    var result = false;
    switch (table) {
        case "acct_entry_hist":
            if (object && Number(object.SystemRecordReference))
                result = true;
            break;
        default:
            result = false;
    }
    return result;
}
// create a queue object with pipe stream
var q = queue(function (task, callback) {
    return __awaiter(this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!task.path || task.path === undefined)
                        throw new Error("{ result: true , message: the path not found}");
                    return [4 /*yield*/, fs
                            .createReadStream(task.path)
                            .pipe(task.parser)
                            .pipe(task.transform)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    throw new Error("{ result: true , message: pipe error: " + error_2 + "}");
                case 3:
                    callback();
                    return [2 /*return*/];
            }
        });
    });
}, 2);
// assign a callback
q.drain = function () {
    console.log("all items have been processed");
    emitter.emit("actionListener");
};
// let arrayPaths = [
//   "./reports/randomCSV.csv"
// "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20180927.csv",
// "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20180928.csv",
// "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20180929.csv"
// "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20180930.csv"
// ];
// let csvTest = new CSVToDB(
//   // "./reports/NAUTICA_ACCT_POSTING_ENTRY_HIST_DAILY_T20180929.csv"
//   undefined,
//   arrayPaths
// );
// csvTest.multipleFiles();
// let csvTest = new CSVToDB("./reports/randomCSV.csv");
// csvTest.singleFile();
// csvTest.getEventEmiiter.on("csvToDbActionListener", function() {
//   console.log("All action done!");
// });
