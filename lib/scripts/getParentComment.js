"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var readline_sync_1 = __importDefault(require("readline-sync"));
var getDescription_1 = __importDefault(require("./getDescription"));
var helpers_1 = require("./helpers");
var getParentComment = function (CURRENT, FILELISTNAME, useCurrent, apple) {
    var parentComment = "";
    if (apple) {
        parentComment = child_process_1.execSync("mdls -name kMDItemFinderComment -raw \"" + CURRENT + "\"").toString();
        if (!parentComment.length || parentComment === "(null)") {
            parentComment = child_process_1.execSync("sh " + __dirname + "/applescript/get_comment.sh \"" + CURRENT + "\"").toString();
        }
    }
    if (!parentComment.length || parentComment === "(null)") {
        parentComment = getDescription_1.default(CURRENT + "/" + FILELISTNAME);
    }
    var overWriteMain = false;
    if (parentComment.length && parentComment !== "(null)" && !useCurrent) {
        var overWriteMainQ = readline_sync_1.default.question(helpers_1.styleText("WARING: Directory comment already exists, would you like to overwite? (y/n)", "red"));
        if (overWriteMainQ.toLowerCase() === "y" ||
            overWriteMainQ.toLowerCase() === "yes") {
            overWriteMain = true;
        }
    }
    if (!parentComment.length || parentComment === "(null)" || overWriteMain) {
        parentComment = readline_sync_1.default.question(helpers_1.styleText("Please add a description for this directory: ", "yellow"));
    }
    else {
        console.log(helpers_1.styleText("Current directory details:", "green"), helpers_1.styleText(parentComment, "blue"));
    }
    return parentComment;
};
exports.default = getParentComment;
