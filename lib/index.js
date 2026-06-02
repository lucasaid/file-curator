#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// NPM Imports
const fs = __importStar(require("fs"));
const util = __importStar(require("util"));
const junk_1 = __importDefault(require("junk"));
const dateformat_1 = __importDefault(require("dateformat"));
const ignored_json_1 = require("./ignored.json");
const readline_sync_1 = __importDefault(require("readline-sync"));
const nodejs_fs_utils_1 = __importDefault(require("nodejs-fs-utils"));
// Local Imports
const getParentComment_1 = __importDefault(require("./scripts/getParentComment"));
const getFileComment_1 = __importDefault(require("./scripts/getFileComment"));
const currentFile_1 = __importDefault(require("./scripts/currentFile"));
const genText_1 = __importDefault(require("./scripts/genText"));
const help_1 = __importDefault(require("./scripts/help"));
const helpers_1 = require("./scripts/helpers");
// Alias for console.log
const log = console.log;
// Clear screen
process.stdout.write("\x1b[2J");
process.stdout.write("\x1b[0f");
let data = [];
const CURRENT = process.cwd();
let FILELISTNAME = "file-listing.txt";
// Arguments
const force = process.argv.indexOf("-f") > -1 ? true : false;
const useCurrent = process.argv.indexOf("-u") > -1 ? true : false;
const emptyComment = process.argv.indexOf("-e") > -1 ? true : false;
const helpFlag = process.argv.indexOf("-help") > -1 || process.argv.indexOf("-h") > -1
    ? true
    : false;
const apple = process.argv.indexOf("-a") > -1 ? true : false;
const dirsize = process.argv.indexOf("-d") > -1 ? true : false;
const nameIndex = process.argv.indexOf("-n");
if (nameIndex > -1) {
    FILELISTNAME = process.argv[nameIndex + 1] + ".txt";
}
if (helpFlag) {
    (0, help_1.default)();
    process.exit();
}
log((0, helpers_1.styleText)(`Generating file list for ${process.cwd()}`, "green"));
// Read piped stdin as the directory description when -e is set
let pipedDescription;
if (emptyComment && !process.stdin.isTTY) {
    pipedDescription = fs.readFileSync(0, "utf8").trim();
}
let currentFileData = {};
let fileExists;
if (fs.existsSync(`${CURRENT}/${FILELISTNAME}`)) {
    currentFileData = (0, currentFile_1.default)(`${CURRENT}/${FILELISTNAME}`);
    fileExists = readline_sync_1.default.question((0, helpers_1.styleText)(`WARING: ${FILELISTNAME} already exists, continue? (y/n)`, "red"));
}
let fileCount = 0;
if (typeof fileExists === "undefined" ||
    (typeof fileExists !== "undefined" &&
        (fileExists.toLowerCase() === "y" || fileExists.toLowerCase() === "yes"))) {
    let parentComment = pipedDescription !== undefined
        ? pipedDescription
        : (0, getParentComment_1.default)(CURRENT, FILELISTNAME, useCurrent, apple);
    parentComment = "DESCRIPTION:\n" + parentComment;
    let rawFiles = fs.readdirSync(CURRENT).filter((item) => {
        let junked = junk_1.default.not(item);
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
    let totalSize = 0;
    let files = rawFiles
        .map((item) => {
        const path = `${CURRENT}/${item}`;
        const stats = fs.lstatSync(path);
        const isDir = stats.isDirectory();
        // Get file date and format to YYYY-MM-DD
        let date = (0, dateformat_1.default)(new Date(util.inspect(stats.mtime)), "yyyy-mm-dd H:MM:ss");
        let size = stats.size;
        let formatedSize = (0, helpers_1.formatSizeUnits)(size);
        // If directory calculate total directory size if user sets flag
        if (isDir && dirsize) {
            size = nodejs_fs_utils_1.default.fsizeSync(path);
            formatedSize = (0, helpers_1.formatSizeUnits)(size);
        }
        totalSize += size;
        return {
            name: isDir ? item + "/" : item,
            path,
            size: formatedSize,
            date,
            isDir
        };
    })
        .sort(helpers_1.compareFiles);
    files.forEach(function (file) {
        let commentData = (0, getFileComment_1.default)(file, currentFileData, force, emptyComment, useCurrent, apple);
        data.push((0, helpers_1.genLine)(file, commentData.fileComment));
        if (commentData.overWrite && !emptyComment) {
            log((0, helpers_1.styleText)(`✔ New File details are: ${commentData.fileComment}`, "green"));
        }
        fileCount++;
    });
    if (data) {
        const text = (0, genText_1.default)(data, parentComment, CURRENT, totalSize);
        fs.writeFileSync(FILELISTNAME, text);
        log(`${fileCount} files succefully written to ${FILELISTNAME}`);
    }
}
