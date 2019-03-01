"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var dbConfig = __importStar(require("../configs/dbConfig.json"));
var SQLDB = /** @class */ (function () {
    function SQLDB(database, table, host, user, password) {
        if (database === void 0) { database = dbConfig.database; }
        if (host === void 0) { host = dbConfig.host; }
        if (user === void 0) { user = dbConfig.user; }
        if (password === void 0) { password = dbConfig.password; }
        this.database = database;
        this.host = host;
        this.user = user;
        this.password = password;
        this.table = table;
        this.con = require("knex")({
            client: "mysql",
            connection: {
                host: this.host,
                user: this.user,
                password: this.password,
                database: this.database
            },
            pool: { min: 0, max: 30 }
        });
    }
    SQLDB.prototype.createConnection = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                _this.con = require("knex")({
                    client: "mysql",
                    connection: {
                        host: _this.host,
                        user: _this.user,
                        password: _this.password,
                        database: _this.database
                    },
                    pool: { min: 0, max: 10 }
                });
                resolve(_this.con);
            }
            catch (error) {
                reject(error);
            }
        });
    };
    SQLDB.prototype.getAllData = function (table) {
        var _this = this;
        if (table === void 0) { table = this.table; }
        return new Promise(function (resolve, reject) {
            _this.con
                .select()
                .from(table)
                .then(function (results) {
                resolve(results);
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    SQLDB.prototype.getOneData = function (id, table) {
        var _this = this;
        if (table === void 0) { table = this.table; }
        return new Promise(function (resolve, reject) {
            _this.con
                .select()
                .from(table)
                .where("id", id)
                .then(function (results) {
                resolve(results);
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    SQLDB.prototype.runCustomQuery = function () {
        return this.con;
    };
    SQLDB.prototype.insertData = function (object, table) {
        var _this = this;
        if (table === void 0) { table = this.table; }
        var objectFinal = object;
        objectFinal.created_at = new Date();
        objectFinal.updated_at = new Date();
        /* console.log */ objectFinal;
        return new Promise(function (resolve, reject) {
            _this.con(table)
                .insert(objectFinal)
                .then(function (results) {
                if (typeof results[0] === "number")
                    resolve(true);
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    SQLDB.prototype.transacting = function (object, table) {
        var _this = this;
        if (table === void 0) { table = this.table; }
        var objectFinal = object;
        objectFinal.created_at = new Date();
        objectFinal.updated_at = new Date();
        return new Promise(function (resolve, reject) {
            _this.con
                .transaction(function (trx) {
                _this.con(table)
                    .transacting(trx)
                    .insert(objectFinal)
                    .then(function (resp) {
                    return { id: resp[0], trx: trx };
                })
                    .then(trx.commit)
                    .catch(trx.rollback);
            })
                .then(function () {
                resolve(true);
            })
                .catch(function (e) {
                reject(e);
            });
        });
    };
    SQLDB.prototype.deleteOneData = function (id, table) {
        var _this = this;
        if (table === void 0) { table = this.table; }
        return new Promise(function (resolve, reject) {
            _this.con(table)
                .where("id", id)
                .del()
                .then(function (results) {
                if (typeof results === "number")
                    resolve(true);
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    SQLDB.prototype.createTable = function (object, tableName) {
        var _this = this;
        if (tableName === void 0) { tableName = this.table; }
        var obKeys = Object.keys(object);
        // let obValues = Object.values(object);
        var obValues = Object.values(object);
        return new Promise(function (resolve, reject) {
            _this.con.schema
                .createTable(tableName, function (table) {
                table.increments();
                obValues.map(function (d, index) {
                    if (typeof d === "number")
                        table.integer(obKeys[index]);
                    if (typeof d === "string")
                        table.string(obKeys[index]);
                });
                table.timestamps();
            })
                .then(function () { return resolve(true); })
                .catch(function (err) {
                reject(err);
            })
                .finally(function () {
                _this.con.destroy();
            });
        });
    };
    SQLDB.prototype.countData = function (table) {
        var _this = this;
        if (table === void 0) { table = this.table; }
        return new Promise(function (resolve, reject) {
            _this.con(table)
                .count("id", "active")
                .then(function (results) {
                resolve({ count: results[0]["count(`id`)"] });
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    SQLDB.prototype.checkDataExist = function (object, table) {
        var _this = this;
        if (table === void 0) { table = this.table; }
        return new Promise(function (resolve, reject) {
            _this.con(table)
                .where(object)
                .select("id")
                .then(function (results) {
                /* console.log */ results;
                if (results.length > 0) {
                    var id = results[0].id;
                    resolve({ result: true, id: id });
                }
                else {
                    resolve({ result: false });
                }
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    SQLDB.prototype.truncate = function (table) {
        var _this = this;
        if (table === void 0) { table = this.table; }
        return new Promise(function (resolve, reject) {
            _this.con(table)
                .truncate()
                .then(function (results) {
                var result = results[0].protocol41;
                if (result)
                    resolve({
                        result: true,
                        message: results
                    });
                else
                    reject({ result: false, message: results });
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    SQLDB.prototype.dropTable = function (tableName) {
        var _this = this;
        if (tableName === void 0) { tableName = this.table; }
        return new Promise(function (resolve, reject) {
            _this.con.schema
                .dropTable(tableName)
                .then(function (results) {
                // console.log(results);
                var result = results[0].protocol41;
                resolve({ result: result });
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    SQLDB.prototype.destoryConnect = function () {
        try {
            this.con.destroy();
            return { result: true };
        }
        catch (error) {
            console.log(error);
            return { result: false };
        }
    };
    return SQLDB;
}());
exports.default = SQLDB;
// let db = new SQLDB("userDb", "users");
// async function test() {
//   await db.createConnection();
//   let data = await db.getAllData();
//   console.log(data);
// }
// test();
