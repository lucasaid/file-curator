"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var styleText_1 = __importDefault(require("./styleText"));
var child_process_1 = require("child_process");
var readline_sync_1 = __importDefault(require("readline-sync"));
var getFileComment = function (file, currentFileData, force, emptyComment, useCurrent, apple) {
    var fileComment = child_process_1.execSync("mdls -name kMDItemFinderComment -raw \"" + file.path + "\"").toString();
    if ((!fileComment.length || fileComment === "(null)") && apple) {
        fileComment = child_process_1.execSync("sh " + __dirname + "/applescript/get_comment.sh \"" + file.path + "\"").toString();
    }
    if (currentFileData[file.name] && currentFileData[file.name] != "") {
        fileComment = currentFileData[file.name];
    }
    var overWrite = false;
    console.log(styleText_1.default("Filename: ", "blue"), styleText_1.default(file.name, "white_underline"));
    if (fileComment.length &&
        fileComment !== "(null)" &&
        !force &&
        !emptyComment) {
        console.log(styleText_1.default("Current details: ", "green"), styleText_1.default(fileComment, "blue"));
        if (!useCurrent) {
            var overWriteQ = readline_sync_1.default.question(styleText_1.default("WARING: Comment already exists, would you like to overwite? (y/n) ", "red"));
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
        fileComment = readline_sync_1.default.question(styleText_1.default("Please comment this " + (file.isDir ? "directory" : "file") + ": ", "yellow"));
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
