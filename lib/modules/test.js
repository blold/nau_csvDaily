"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dbModule_1 = __importDefault(require("./dbModule"));
var ddbb = new dbModule_1.default("userDb", "acct_entry_hist");
ddbb.getAllData().then(function (d) {
    console.log(d);
});
