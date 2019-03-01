"use strict";
// const Jumio = require("./Modules/Jumio/JumioMainModule");
Object.defineProperty(exports, "__esModule", { value: true });
var JumioMainModule_1 = require("./modules/Jumio/JumioMainModule");
/**
 * To run the programe, can set up limit parameter to do the insert function, default value is to insert all the data
 * parameter: valid integer number (default value: no passing parameter)
 * Default value: read all data
 * Current value is 10. It means that read top 10 data.
 *
 * There is eventemitter here is to tell the action is done or not.
 */
var jumio1 = new JumioMainModule_1.JumioMainSync();
var jumioEventEmitter1 = jumio1.getEventEmit;
jumio1.mainRun(10);
jumioEventEmitter1.on("jumioAction", function () {
    console.log("Jumio Action Done");
});
