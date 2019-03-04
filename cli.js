#!/usr/bin/env node

const fs = require("fs");
const util = require("util");
const junk = require("junk");
const dateFormat = require("dateformat");
const { ignored } = require("./ignored.json");
const readlineSync = require("readline-sync");
const fsUtils = require("nodejs-fs-utils");

const getParentComment = require("./scripts/getParentComment");
const getFileComment = require("./scripts/getFileComment");
const currentFile = require("./scripts/currentFile");
const genText = require("./scripts/genText");
const help = require("./scripts/help");
const styleText = require("./scripts/styleText");
const { formatSizeUnits, compareFiles, genLine } = require("./scripts/helpers");

var data = [];
const CURRENT = process.cwd();
let FILELISTNAME = "file-listing.txt";

// Args
// const [, , ...args] = process.argv;
const force = process.argv.indexOf("-f") > -1 ? true : false;
const useCurrent = process.argv.indexOf("-u") > -1 ? true : false;
const emptyComment = process.argv.indexOf("-e") > -1 ? true : false;
const helpFlag =
  process.argv.indexOf("-help") > -1 || process.argv.indexOf("-h") > -1
    ? true
    : false;
const apple = process.argv.indexOf("-a") > -1 ? true : false;
const dirsize = process.argv.indexOf("-d") > -1 ? true : false;

const nameIndex = process.argv.indexOf("-n");
if (nameIndex > -1) {
  FILELISTNAME = process.argv[nameIndex + 1] + ".txt";
}

if (helpFlag) {
  help();
  return;
}

console.log(styleText(`Generating file list for ${process.cwd()}`, "green"));

let currentFileData = [];
if (fs.existsSync(`${CURRENT}/${FILELISTNAME}`)) {
  currentFileData = currentFile(`${CURRENT}/${FILELISTNAME}`);
  var fileExists = readlineSync.question(
    styleText(`WARING: ${FILELISTNAME} already exists, continue? (y/n)`, "red")
  );
}

let fileCount = 0;
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

  let files = fs.readdirSync(CURRENT);
  files = files.filter(function(item) {
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

  let totalSize = 0;
  files = files
    .map(item => {
      const path = `${CURRENT}/${item}`;
      const stats = fs.lstatSync(path);
      const isDir = stats.isDirectory();
      let date = new Date(util.inspect(stats.mtime));
      date = dateFormat(date, "yyyy-mm-dd H:MM:ss");
      let size = formatSizeUnits(stats.size);
      if (isDir && dirsize) {
        size = fsUtils.fsizeSync(path);
        totalSize += size;
        size = formatSizeUnits(size);
      } else {
        totalSize += stats.size;
      }
      if (size)
        return {
          name: isDir ? item + "/" : item,
          path,
          size,
          date,
          isDir
        };
    })
    .sort(compareFiles);

  files.forEach(function(file, index) {
    let commentData = getFileComment(
      file,
      currentFileData,
      force,
      emptyComment,
      useCurrent,
      apple
    );
    data.push(genLine(file, commentData.fileComment));
    if (commentData.overWrite && !emptyComment) {
      console.log(
        styleText(`✔ New File details are: ${commentData.fileComment}`, "green")
      );
    }
    fileCount++;
  });

  if (data) {
    const text = genText(data, parentComment, CURRENT, totalSize);
    fs.writeFileSync(FILELISTNAME, text);
    console.log(`${fileCount} files succefully written to ${FILELISTNAME}`);
  }
}
