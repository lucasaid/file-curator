"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const currentFile = (file) => {
    let fileData = fs_1.default.readFileSync(file, "utf8");
    let fileLines = fileData.split("\n");
    let headerIndex = fileLines.findIndex(fileLine => {
        return (fileLine.match(/NAME/g) !== null &&
            fileLine.match(/DATE/g) !== null &&
            fileLine.match(/SIZE/g) !== null &&
            fileLine.match(/DESCRIPTION/g) !== null);
    });
    if (headerIndex === -1) {
        return {};
    }
    fileLines.splice(0, headerIndex + 1);
    const fileList = {};
    let previous;
    fileLines.forEach(fileLine => {
        const fileLineArray = fileLine.split("  |  ", 4);
        if (fileLineArray.length < 4) {
            return;
        }
        const name = fileLineArray[0].trim();
        const description = fileLineArray[3].trim();
        if (name !== "") {
            previous = name;
            fileList[name] = description;
        }
        else if (previous !== undefined) {
            fileList[previous] = fileList[previous] + " " + description;
        }
    });
    return fileList;
};
exports.default = currentFile;
