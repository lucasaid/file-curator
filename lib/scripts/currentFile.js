"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var currentFile = function (file) {
    var fileData = fs_1.default.readFileSync(file, "utf8");
    var fileLines = fileData.split("\n");
    var headerIndex = fileLines.findIndex(function (fileLine) {
        if (fileLine.match(/NAME/g) &&
            fileLine.match(/DATE/g) &&
            fileLine.match(/SIZE/g) &&
            fileLine.match(/DESCRIPTION/g)) {
            return true;
        }
        return false;
    });
    fileLines.splice(0, headerIndex + 1);
    var fileList = [];
    var previous = null;
    fileLines.map(function (fileLine) {
        var fileLineArray = fileLine.split("  |  ");
        var name = fileLineArray[0].trim();
        var description = fileLineArray[3].trim();
        if (name !== "") {
            previous = name;
            fileList[name] = description;
        }
        else {
            fileList[previous] = fileList[previous] + " " + description;
        }
    });
    return fileList;
};
exports.default = currentFile;
