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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Client = require("ssh2-sftp-client"), queue = require("async/queue"), EventEmitter = require("events").EventEmitter, fs = require("fs");
require("events").EventEmitter.prototype._maxListeners = 100;
var sftpConfig = __importStar(require("../../configs/sftpConfig.json"));
// const dir: string = "reports";
var emitter = new EventEmitter();
/**
 * This is the SFTP class, including findOutTargetCSV(), writeFile(), detectFile()
 */
var SFTP = /** @class */ (function () {
    /**
     *
     * @param {sftp host url: String} host
     * @param {sftp port: String} port
     * @param {username: String} username
     * @param {password: String} password
     */
    function SFTP(targetFile, dir, host, port, username, password) {
        if (targetFile === void 0) { targetFile = undefined; }
        if (dir === void 0) { dir = "reports"; }
        if (host === void 0) { host = sftpConfig.host; }
        if (port === void 0) { port = sftpConfig.port; }
        if (username === void 0) { username = sftpConfig.username; }
        if (password === void 0) { password = sftpConfig.password; }
        this.host = host;
        this.port = port;
        this.username = username;
        this.password = password;
        this.sftp = new Client();
        this.targetFile = targetFile;
        this.targetDir = dir;
    }
    SFTP.prototype.downloadTargetFile = function (targetFile, targetDir) {
        if (targetFile === void 0) { targetFile = this.targetFile; }
        if (targetDir === void 0) { targetDir = this.targetDir; }
        return __awaiter(this, void 0, void 0, function () {
            var getlistData, getTargetFile, task, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!checkLocalFileExist(targetDir, targetFile))
                            throw new Error("{result: false, message: File existed!}");
                        return [4 /*yield*/, this.sftp.list("/" + targetDir)];
                    case 1:
                        getlistData = _a.sent();
                        if (!checkTargetFileValid(getlistData, targetFile))
                            throw new Error("{result: false, message: targetFile or targetDirectory check failed!}");
                        return [4 /*yield*/, findOutTargetCSV(getlistData, targetFile)];
                    case 2:
                        getTargetFile = _a.sent();
                        task = {
                            targetDir: targetDir,
                            name: getTargetFile[0].name,
                            sftp: this.sftp
                        };
                        q.push(task, function (err) {
                            if (err)
                                throw new Error("{result: false, message: " + err + "}");
                            console.log("finished push task!");
                        });
                        if (getTargetFile[0].name)
                            return [2 /*return*/, {
                                    result: true,
                                    message: { path: "./" + targetDir + "/" + getTargetFile[0].name }
                                }];
                        else
                            return [2 /*return*/, { result: false, message: { path: getTargetFile[0] } }];
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        throw new Error(error_1);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SFTP.prototype.downloadFiles = function (startTime, endTime, targetDir) {
        if (targetDir === void 0) { targetDir = this.targetDir; }
        return __awaiter(this, void 0, void 0, function () {
            var finalListData, getAllListData, returnListData, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        finalListData = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, this.sftp.list("/" + targetDir)];
                    case 2:
                        getAllListData = _a.sent();
                        finalListData = getAllListData;
                        if (!checkTimeRangeValid(getAllListData, startTime, endTime))
                            throw new Error("{result: false, message: startTime or endTime check failed!}");
                        if (!(startTime != undefined && endTime != undefined)) return [3 /*break*/, 4];
                        return [4 /*yield*/, findOutTargetCSV(getAllListData, undefined, startTime, endTime)];
                    case 3:
                        finalListData = _a.sent();
                        _a.label = 4;
                    case 4:
                        finalListData.forEach(function (el) {
                            var task = { targetDir: targetDir, name: el.name, sftp: _this.sftp };
                            q.push(task, function () {
                                console.log("finished push task!");
                            });
                        });
                        returnListData = finalListData.map(function (d) { return "./" + targetDir + "/" + d.name; });
                        if (returnListData.length > 0)
                            return [2 /*return*/, { result: true, message: { paths: returnListData } }];
                        else
                            return [2 /*return*/, { result: false, message: { paths: returnListData } }];
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _a.sent();
                        throw new Error(error_2);
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a connecton to the sftp server
     */
    SFTP.prototype.createConnection = function () {
        var _this = this;
        return new Promise(function (res, rej) {
            try {
                var connect = _this.sftp.connect({
                    host: _this.host,
                    port: _this.port,
                    username: _this.username,
                    password: _this.password
                });
                res(connect);
            }
            catch (error) {
                console.log(error);
                rej(error);
            }
        });
    };
    SFTP.prototype.endConnection = function () {
        this.sftp.end();
    };
    Object.defineProperty(SFTP.prototype, "getEventEmiiter", {
        get: function () {
            return emitter;
        },
        enumerable: true,
        configurable: true
    });
    return SFTP;
}());
exports.SFTP = SFTP;
function checkTimeRangeValid(data, startTime, endTime) {
    var result;
    var timeRangeIndex = data.map(function (d, i) {
        if (d.modifyTime <= endTime && d.modifyTime >= startTime)
            return i;
    });
    timeRangeIndex.length > 0 ? (result = true) : (result = false);
    return result;
}
// create a queue object with concurrency 2
var q = queue(function (task, callback) {
    return __awaiter(this, void 0, void 0, function () {
        var targetPath, fileDataStream;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    targetPath = "/" + task.targetDir + "/" + task.name;
                    if (!checkLocalFileExist(task.targetDir, task.name)) return [3 /*break*/, 3];
                    return [4 /*yield*/, task.sftp.get(targetPath)];
                case 1:
                    fileDataStream = _a.sent();
                    return [4 /*yield*/, writeFile(task.targetDir, fileDataStream)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    console.log("File existed!");
                    _a.label = 4;
                case 4:
                    callback();
                    return [2 /*return*/];
            }
        });
    });
}, 3);
// assign a callback
q.drain = function () {
    console.log("all items have been processed");
    emitter.emit("actionListener");
};
/**
 * Find out the latest CSV file from the ListData
 * Default is to find out latest CSV in the SFTP server
 * @param {SFTP ListData} data
 */
function findOutTargetCSV(data, targetFiles, startTime, endTime) {
    return new Promise(function (res, rej) {
        var resultFiles = [];
        try {
            // Find out latest file`s index
            if (targetFiles === undefined &&
                startTime === undefined &&
                endTime === undefined) {
                // console.log("Latest");
                var maxTime_1 = Math.max.apply(Math, data.map(function (d) { return d.modifyTime; }));
                var maxData = data.filter(function (v) { return v.modifyTime == maxTime_1; });
                resultFiles.push(maxData[0]);
                res(resultFiles);
            }
            // Find out the files between the startTime and endTime
            if (targetFiles === undefined &&
                startTime != undefined &&
                endTime != undefined) {
                resultFiles = data.filter(function (d) {
                    if (d.modifyTime <= endTime && d.modifyTime >= startTime)
                        return d;
                });
                res(resultFiles);
            }
            // Get all the files
            else {
                resultFiles = data.filter(function (d) {
                    return d.name === targetFiles;
                });
                res(resultFiles);
            }
        }
        catch (error) {
            rej(error);
        }
    })
        .then(function (finalResult) {
        // console.log(d);
        return finalResult;
    })
        .catch(function (err) {
        console.log(err);
    });
}
function checkLocalFileExist(targetDir, targetFile) {
    var result;
    if (!fs.existsSync(targetDir + "/" + targetFile))
        result = true;
    else
        result = false;
    return result;
}
function checkTargetFileValid(data, targetFile) {
    var result;
    if (data != undefined && targetFile === undefined)
        result = true;
    else {
        result = data.some(function (d) {
            return d.name === targetFile;
        });
    }
    return result;
}
/**
 * Write the file into the target dirctory
 */
function writeFile(dir, dataStream) {
    return new Promise(function (res, rej) {
        try {
            if (!fs.existsSync("" + dir)) {
                console.log("Dir not exist yet");
                fs.mkdirSync("" + dir);
            }
            // console.log(dataStream.path);
            // res({ result: true, message: "Action Done" });
            res(dataStream.pipe(fs.createWriteStream(dir + "/" + dataStream.path.split("/")[2])));
        }
        catch (error) {
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
// console.log(downloadFiles);
// downloadFiles.forEach((element:any) => {
//   console.log(element);
// });
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
