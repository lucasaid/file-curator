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
var path_1 = __importDefault(require("path"));
// Local Imports
var getParentComment_1 = __importDefault(require("./scripts/getParentComment"));
var getFileComment_1 = __importDefault(require("./scripts/getFileComment"));
var currentFile_1 = __importDefault(require("./scripts/currentFile"));
var genText_1 = __importDefault(require("./scripts/genText"));
var help_1 = __importDefault(require("./scripts/help"));
var getMovieData_1 = __importDefault(require("./scripts/getMovieData"));
var helpers_1 = require("./scripts/helpers");
// Alias for console.log
var log = console.log;
// Clear screen
process.stdout.write("\x1b[2J");
process.stdout.write("\x1b[0f");
var data = [];
var CURRENT = process.cwd();
var FILELISTNAME = "file-listing.txt";
// Arguments
var force = process.argv.indexOf("-f") > -1 ? true : false;
var useCurrent = process.argv.indexOf("-u") > -1 ? true : false;
var emptyComment = process.argv.indexOf("-e") > -1 ? true : false;
var helpFlag = process.argv.indexOf("-help") > -1 || process.argv.indexOf("-h") > -1
    ? true
    : false;
var apple = process.argv.indexOf("-a") > -1 ? true : false;
var dirsize = process.argv.indexOf("-d") > -1 ? true : false;
var movie = process.argv.indexOf("-m") > -1 ? true : false;
var nameIndex = process.argv.indexOf("-n");
var OMDB_API = "ea2df100";
if (nameIndex > -1) {
    FILELISTNAME = process.argv[nameIndex + 1] + ".txt";
}
if (helpFlag) {
    help_1.default();
    process.exit();
}
log(helpers_1.styleText("Generating file list for " + process.cwd(), "green"));
var currentFileData;
var fileExists;
if (fs.existsSync(CURRENT + "/" + FILELISTNAME)) {
    currentFileData = currentFile_1.default(CURRENT + "/" + FILELISTNAME);
    fileExists = readline_sync_1.default.question(helpers_1.styleText("WARING: " + FILELISTNAME + " already exists, continue? (y/n)", "red"));
}
var fileCount = 0;
if (typeof fileExists === "undefined" ||
    (typeof fileExists !== "undefined" &&
        (fileExists.toLowerCase() === "y" || fileExists.toLowerCase() === "yes"))) {
    var parentComment = getParentComment_1.default(CURRENT, FILELISTNAME, useCurrent, apple);
    parentComment = "DESCRIPTION:\n" + parentComment;
    var rawFiles = fs.readdirSync(CURRENT).filter(function (item) {
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
    var files = rawFiles
        .map(function (item) {
        var path = CURRENT + "/" + item;
        var stats = fs.lstatSync(path);
        var isDir = stats.isDirectory();
        // Get file date and format to YYYY-MM-DD
        var date = dateformat_1.default(new Date(util.inspect(stats.mtime)), "yyyy-mm-dd H:MM:ss");
        var size = stats.size;
        var formatedSize = helpers_1.formatSizeUnits(size);
        // If directory calculate total directory size if user sets flag
        if (isDir && dirsize) {
            size = nodejs_fs_utils_1.default.fsizeSync(path);
            formatedSize = helpers_1.formatSizeUnits(size);
        }
        totalSize_1 += size;
        return {
            name: isDir ? item + "/" : item,
            path: path,
            size: formatedSize,
            date: date,
            isDir: isDir
        };
    })
        .sort(helpers_1.compareFiles);
    files.forEach(function (file) {
        var movieData;
        var commentData;
        if (movie) {
            var videoArray = [".avi", ".mp4", ".mov"];
            var ext = path_1.default.extname(file.name);
            if (videoArray.includes(ext)) {
                movieData = getMovieData_1.default(file.name, OMDB_API);
                if (!movieData) {
                    console.log(helpers_1.styleText("Filename: " + file.name, "blue"));
                    var manualsearch = readline_sync_1.default.question(helpers_1.styleText("WARING: Movie not found, would you like to manual search? (y/n) ", "red"));
                    if (manualsearch.toLowerCase() === "y" ||
                        manualsearch.toLowerCase() === "yes") {
                        var movieTitle = readline_sync_1.default.question(helpers_1.styleText("Movie not found please enter movie title: ", "yellow"));
                        var movieYear = readline_sync_1.default.question(helpers_1.styleText("Movie not found please enter movie year: ", "yellow"));
                        movieData = getMovieData_1.default(movieTitle, OMDB_API, true, movieYear);
                    }
                }
            }
        }
        if (movieData && movieData.Plot) {
            commentData = movieData.Plot;
            data.push(helpers_1.genMovie(file, movieData.Plot, movieData));
        }
        else {
            commentData = getFileComment_1.default(file, currentFileData, force, emptyComment, useCurrent, apple);
            if (currentFileData[file.name].year &&
                currentFileData[file.name].rating) {
                data.push(helpers_1.genMovie(file, commentData.fileComment, currentFileData[file.name]));
            }
            else {
                data.push(helpers_1.genLine(file, commentData.fileComment));
            }
        }
        if (commentData.overWrite && !emptyComment) {
            log(helpers_1.styleText("\u2714 New File details are: " + commentData.fileComment, "green"));
        }
        fileCount++;
    });
    if (data) {
        var text = genText_1.default(data, parentComment, CURRENT, totalSize_1);
        fs.writeFileSync(FILELISTNAME, text);
        log(fileCount + " files succefully written to " + FILELISTNAME);
    }
}
