"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("./helpers");
var child_process_1 = require("child_process");
var readline_sync_1 = __importDefault(require("readline-sync"));
var getFileComment = function (file, currentFileData, force, emptyComment, useCurrent, apple) {
    var fileComment = child_process_1.execSync("mdls -name kMDItemFinderComment -raw \"" + file.path + "\"").toString();
    if ((!fileComment.length || fileComment === "(null)") && apple) {
        fileComment = child_process_1.execSync("sh " + __dirname + "/applescript/get_comment.sh \"" + file.path + "\"").toString();
    }
    if (currentFileData &&
        currentFileData[file.name] &&
        currentFileData[file.name].desc &&
        currentFileData[file.name].desc != "") {
        fileComment = currentFileData[file.name].desc;
    }
    var overWrite = false;
    console.log(helpers_1.styleText("Filename: ", "blue"), helpers_1.styleText(file.name, "white_underline"));
    if (fileComment.length &&
        fileComment !== "(null)" &&
        !force &&
        !emptyComment) {
        console.log(helpers_1.styleText("Current details: ", "green"), helpers_1.styleText(fileComment, "blue"));
        if (!useCurrent) {
            var overWriteQ = readline_sync_1.default.question(helpers_1.styleText("WARING: Comment already exists, would you like to overwite? (y/n) ", "red"));
            if (overWriteQ.toLowerCase() === "y" ||
                overWriteQ.toLowerCase() === "yes") {
                overWrite = true;
            }
        }
    }
    else {
        overWrite = true;
    }
    if (overWrite && !emptyComment) {
        fileComment = readline_sync_1.default.question(helpers_1.styleText("Please comment this " + (file.isDir ? "directory" : "file") + ": ", "yellow"));
    }
    if (emptyComment) {
        fileComment = "";
    }
    if (apple) {
        child_process_1.execSync("xattr -w com.apple.metadata:kMDItemFinderComment \"" + fileComment + "\" \"" + file.path + "\"");
        child_process_1.execSync("sh " + __dirname + "/applescript/update_finder.sh \"" + file.path + "\" \"" + fileComment + "\"");
    }
    return { fileComment: fileComment, overWrite: overWrite };
};
exports.default = getFileComment;
