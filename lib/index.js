#!/usr/bin/env node
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var util = __importStar(require("util"));
var junk_1 = __importDefault(require("junk"));
var dateformat_1 = __importDefault(require("dateformat"));
var ignored_json_1 = require("./ignored.json");
var readline_sync_1 = __importDefault(require("readline-sync"));
var nodejs_fs_utils_1 = __importDefault(require("nodejs-fs-utils"));
var getParentComment_1 = __importDefault(require("./scripts/getParentComment"));
var getFileComment_1 = __importDefault(require("./scripts/getFileComment"));
var currentFile_1 = __importDefault(require("./scripts/currentFile"));
var genText_1 = __importDefault(require("./scripts/genText"));
var help_1 = __importDefault(require("./scripts/help"));
var styleText_1 = __importDefault(require("./scripts/styleText"));
var helpers_1 = require("./scripts/helpers");
var data = [];
var CURRENT = process.cwd();
var FILELISTNAME = "file-listing.txt";
// Args
// const [, , ...args] = process.argv;
var force = process.argv.indexOf("-f") > -1 ? true : false;
var useCurrent = process.argv.indexOf("-u") > -1 ? true : false;
var emptyComment = process.argv.indexOf("-e") > -1 ? true : false;
var helpFlag = process.argv.indexOf("-help") > -1 || process.argv.indexOf("-h") > -1
    ? true
    : false;
var apple = process.argv.indexOf("-a") > -1 ? true : false;
var dirsize = process.argv.indexOf("-d") > -1 ? true : false;
var nameIndex = process.argv.indexOf("-n");
if (nameIndex > -1) {
    FILELISTNAME = process.argv[nameIndex + 1] + ".txt";
}
if (helpFlag) {
    help_1.default();
    process.exit();
}
console.log(styleText_1.default("Generating file list for " + process.cwd(), "green"));
var currentFileData = [];
var fileExists;
if (fs.existsSync(CURRENT + "/" + FILELISTNAME)) {
    currentFileData = currentFile_1.default(CURRENT + "/" + FILELISTNAME);
    fileExists = readline_sync_1.default.question(styleText_1.default("WARING: " + FILELISTNAME + " already exists, continue? (y/n)", "red"));
}
var fileCount = 0;
if (typeof fileExists === "undefined" ||
    (typeof fileExists !== "undefined" &&
        (fileExists.toLowerCase() === "y" || fileExists.toLowerCase() === "yes"))) {
    var parentComment = getParentComment_1.default(CURRENT, FILELISTNAME, useCurrent, apple);
    parentComment = "DESCRIPTION:\n" + parentComment;
    var files = fs.readdirSync(CURRENT);
    files = files.filter(function (item) {
        var junked = junk_1.default.not(item);
        if (!junked) {
            return false;
        }
        if (item === FILELISTNAME) {
            return false;
        }
        if (/(^|\/)\.[^\/\.]/g.test(item)) {
            return false;
        }
        if (ignored_json_1.ignored.includes(item)) {
            return false;
        }
        return true;
    });
    var totalSize_1 = 0;
    files = files
        .map(function (item) {
        var path = CURRENT + "/" + item;
        var stats = fs.lstatSync(path);
        var isDir = stats.isDirectory();
        var date = new Date(util.inspect(stats.mtime));
        date = dateformat_1.default(date, "yyyy-mm-dd H:MM:ss");
        var size = helpers_1.formatSizeUnits(stats.size);
        if (isDir && dirsize) {
            size = nodejs_fs_utils_1.default.fsizeSync(path);
            totalSize_1 += size;
            size = helpers_1.formatSizeUnits(size);
        }
        else {
            totalSize_1 += stats.size;
        }
        if (size)
            return {
                name: isDir ? item + "/" : item,
                path: path,
                size: size,
                date: date,
                isDir: isDir
            };
    })
        .sort(helpers_1.compareFiles);
    files.forEach(function (file, index) {
        var commentData = getFileComment_1.default(file, currentFileData, force, emptyComment, useCurrent, apple);
        data.push(helpers_1.genLine(file, commentData.fileComment));
        if (commentData.overWrite && !emptyComment) {
            console.log(styleText_1.default("\u2714 New File details are: " + commentData.fileComment, "green"));
        }
        fileCount++;
    });
    if (data) {
        var text = genText_1.default(data, parentComment, CURRENT, totalSize_1);
        fs.writeFileSync(FILELISTNAME, text);
        console.log(fileCount + " files succefully written to " + FILELISTNAME);
    }
}
