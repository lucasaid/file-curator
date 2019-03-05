#!/usr/bin/env node

// NPM Imports
import * as fs from "fs";
import * as util from "util";
import junk from "junk";
import dateFormat from "dateformat";
import { ignored } from "./ignored.json";
import readlineSync from "readline-sync";
import fsUtils from "nodejs-fs-utils";

// Local Imports
import getParentComment from "./scripts/getParentComment";
import getFileComment from "./scripts/getFileComment";
import currentFile from "./scripts/currentFile";
import genText from "./scripts/genText";
import help from "./scripts/help";
import {
  formatSizeUnits,
  compareFiles,
  genLine,
  fileObj,
  fileLine,
  commentData,
  styleText
} from "./scripts/helpers";

// Alias for console.log
const log = console.log;

// Clear screen
process.stdout.write("\x1b[2J");
process.stdout.write("\x1b[0f");

let data: fileLine[] = [];
const CURRENT: string = process.cwd();
let FILELISTNAME: string = "file-listing.txt";

// Arguments
const force: boolean = process.argv.indexOf("-f") > -1 ? true : false;
const useCurrent: boolean = process.argv.indexOf("-u") > -1 ? true : false;
const emptyComment: boolean = process.argv.indexOf("-e") > -1 ? true : false;
const helpFlag: boolean =
  process.argv.indexOf("-help") > -1 || process.argv.indexOf("-h") > -1
    ? true
    : false;
const apple: boolean = process.argv.indexOf("-a") > -1 ? true : false;
const dirsize: boolean = process.argv.indexOf("-d") > -1 ? true : false;
const nameIndex: number = process.argv.indexOf("-n");

if (nameIndex > -1) {
  FILELISTNAME = process.argv[nameIndex + 1] + ".txt";
}

if (helpFlag) {
  help();
  process.exit();
}

log(styleText(`Generating file list for ${process.cwd()}`, "green"));

let currentFileData: string[] = [];
let fileExists;
if (fs.existsSync(`${CURRENT}/${FILELISTNAME}`)) {
  currentFileData = currentFile(`${CURRENT}/${FILELISTNAME}`);
  fileExists = readlineSync.question(
    styleText(`WARING: ${FILELISTNAME} already exists, continue? (y/n)`, "red")
  );
}

let fileCount: number = 0;
if (
  typeof fileExists === "undefined" ||
  (typeof fileExists !== "undefined" &&
    (fileExists.toLowerCase() === "y" || fileExists.toLowerCase() === "yes"))
) {
  let parentComment = getParentComment(
    CURRENT,
    FILELISTNAME,
    useCurrent,
    apple
  );
  parentComment = "DESCRIPTION:\n" + parentComment;

  let rawFiles: string[] = fs.readdirSync(CURRENT).filter((item: string) => {
    let junked = junk.not(item);
    if (!junked) {
      return false;
    }
    if (item === FILELISTNAME) {
      return false;
    }
    if (/(^|\/)\.[^\/\.]/g.test(item)) {
      return false;
    }
    if (ignored.includes(item)) {
      return false;
    }
    return true;
  });

  let totalSize: number = 0;
  let files: fileObj[] = rawFiles
    .map(
      (item: string): fileObj => {
        const path: string = `${CURRENT}/${item}`;
        const stats: fs.Stats = fs.lstatSync(path);
        const isDir: boolean = stats.isDirectory();

        // Get file date and format to YYYY-MM-DD
        let date: string = dateFormat(
          new Date(util.inspect(stats.mtime)),
          "yyyy-mm-dd H:MM:ss"
        );

        let size: number = stats.size;
        let formatedSize: string = formatSizeUnits(size);

        // If directory calculate total directory size if user sets flag
        if (isDir && dirsize) {
          size = fsUtils.fsizeSync(path);
          formatedSize = formatSizeUnits(size);
        }
        totalSize += size;

        return {
          name: isDir ? item + "/" : item,
          path,
          size: formatedSize,
          date,
          isDir
        };
      }
    )
    .sort(compareFiles);

  files.forEach(function(file: fileObj) {
    let commentData: commentData = getFileComment(
      file,
      currentFileData,
      force,
      emptyComment,
      useCurrent,
      apple
    );
    data.push(genLine(file, commentData.fileComment));
    if (commentData.overWrite && !emptyComment) {
      log(
        styleText(`✔ New File details are: ${commentData.fileComment}`, "green")
      );
    }
    fileCount++;
  });

  if (data) {
    const text = genText(data, parentComment, CURRENT, totalSize);
    fs.writeFileSync(FILELISTNAME, text);
    log(`${fileCount} files succefully written to ${FILELISTNAME}`);
  }
}
