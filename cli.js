#!/usr/bin/env node

const fs = require("fs");
const util = require("util");
const junk = require("junk");
const dateFormat = require("dateformat");
const wordwrap = require("word-wrap");
const { ignored } = require("./ignored.json");
const readlineSync = require("readline-sync");
const { execSync } = require("child_process");
const fsUtils = require("nodejs-fs-utils");
const columnify = require("columnify");

const currentFile = require("./scripts/currentFile");
const getDescription = require("./scripts/getDescription");
const help = require("./scripts/help");
const { formatSizeUnits, compareFiles } = require("./scripts/helpers");

var data = [];
const CURRENT = process.cwd();
let FILELISTNAME = "file-listing.txt";
// Args
// const [, , ...args] = process.argv;
const force = process.argv.indexOf("-f") > -1 ? true : false;
const useCurrent = process.argv.indexOf("-u") > -1 ? true : false;
const emptyComment = process.argv.indexOf("-e") > -1 ? true : false;
const helpFlag = process.argv.indexOf("-help") > -1 ? true : false;
const apple = process.argv.indexOf("-a") > -1 ? true : false;
const dirsize = process.argv.indexOf("-d") > -1 ? true : false;

const nameIndex = process.argv.indexOf("-n");

if (nameIndex > -1) {
  FILELISTNAME = process.argv[nameIndex + 1] + ".txt";
}

if (!helpFlag) {
  console.log("\x1b[32m%s\x1b[0m", `Generating file list for ${process.cwd()}`);

  function genLine(file, description) {
    return {
      name: file.name,
      date: file.date,
      size: file.size,
      description
    };
  }

  let header = [];
  headerTop =
    "*****************************************************************\n";

  let currentFileData = [];
  if (fs.existsSync(`${CURRENT}/${FILELISTNAME}`)) {
    currentFileData = currentFile(`${CURRENT}/${FILELISTNAME}`);
    var fileExists = readlineSync.question(
      `\x1b[31mWARING: ${FILELISTNAME} already exists, continue? (y/n) \x1b[0m`
    );
  }
  let fileCount = 0;
  if (
    typeof fileExists === "undefined" ||
    (typeof fileExists !== "undefined" &&
      (fileExists.toLowerCase() === "y" || fileExists.toLowerCase() === "yes"))
  ) {
    let parentComment = "";
    if (apple) {
      parentComment = execSync(
        `mdls -name kMDItemFinderComment -raw "${CURRENT}"`
      ).toString();
      if (!parentComment.length || parentComment === "(null)") {
        parentComment = execSync(
          `sh ${__dirname}/applescript/get_comment.sh "${CURRENT}"`
        ).toString();
      }
    }
    if (!parentComment.length || parentComment === "(null)") {
      parentComment = getDescription(`${CURRENT}/${FILELISTNAME}`);
    }
    overWriteMain = false;
    if (parentComment.length && parentComment !== "(null)" && !useCurrent) {
      var overWriteMainQ = readlineSync.question(
        `\x1b[31mWARING: Directory comment already exists, would you like to overwite? (y/n) \x1b[0m`
      );
      if (
        overWriteMainQ.toLowerCase() === "y" ||
        overWriteMainQ.toLowerCase() === "yes"
      ) {
        overWriteMain = true;
      }
    }
    if (!parentComment.length || parentComment === "(null)" || overWriteMain) {
      parentComment = readlineSync.question(
        `\x1b[33mPlease add a description for this directory: \x1b[0m`
      );
    } else {
      console.log(
        "\x1b[32mCurrent directory details:\x1b[34m",
        parentComment,
        "\x1b[0m"
      );
    }

    //parentComment = parentComment.replace(/[\\$'"]/g, "\\$&");
    parentComment = "DESCRIPTION:\n" + parentComment;
    headerContent = wordwrap(parentComment, {
      width: 50,
      indent: "",
      newline: "\n"
    });

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
      let termComment = execSync(
        `mdls -name kMDItemFinderComment -raw "${file.path}"`
      ).toString();
      if ((!termComment.length || termComment === "(null)") && apple) {
        termComment = execSync(
          `sh ${__dirname}/applescript/get_comment.sh "${file.path}"`
        ).toString();
      }
      if (currentFileData[file.name] && currentFileData[file.name] != "") {
        termComment = currentFileData[file.name];
      }
      let overWrite = false;
      console.log("\x1b[34mFilename: \x1b[4m\x1b[37m", file.name, "\x1b[0m");
      if (
        termComment.length &&
        termComment !== "(null)" &&
        !force &&
        !emptyComment
      ) {
        console.log("\x1b[32mCurrent details:\x1b[34m", termComment, "\x1b[0m");
        if (!useCurrent) {
          var overWriteQ = readlineSync.question(
            `\x1b[31mWARING: Comment already exists, would you like to overwite? (y/n) \x1b[0m`
          );
          if (
            overWriteQ.toLowerCase() === "y" ||
            overWriteQ.toLowerCase() === "yes"
          ) {
            overWrite = true;
          }
        }
      } else {
        overWrite = true;
      }
      if (overWrite && !emptyComment) {
        termComment = readlineSync.question(
          `\x1b[33mPlease comment this ${
            file.isDir ? `directory` : `file`
          }: \x1b[0m`
        );
      }
      if (emptyComment) {
        termComment = "";
      }
      if (apple) {
        execSync(
          `xattr -w com.apple.metadata:kMDItemFinderComment "${termComment}" "${
            file.path
          }"`
        );
        execSync(
          `sh ${__dirname}/applescript/update_finder.sh "${
            file.path
          }" "${termComment}"`
        );
      }
      data.push(genLine(file, termComment));
      if (overWrite && !emptyComment) {
        console.log("\x1b[32m✔ New File details are: ", termComment, "\x1b[0m");
      }
      fileCount++;
    });
    if (data) {
      headerContent = headerContent.split("\n");
      headerContent.unshift(" ");
      headerContent.unshift(`FULL PATH: ${CURRENT}`);
      headerContent.unshift(" ");
      headerContent.unshift(`TOTAL SIZE: ${formatSizeUnits(totalSize)}`);
      headerContent.unshift(" ");
      headerContent.unshift(
        "FILE CREATED: " + dateFormat(new Date(), "yyyy-mm-dd H:MM:ss")
      );
      headerContent.unshift(" ");
      headerContent.push(" ");
      headerContent = headerContent.join("\n");
      headerContent = wordwrap(headerContent, {
        width: 50,
        indent: "",
        newline: "\n",
        cut: true
      });
      headerContent = headerContent.split("\n");
      headerContent = headerContent.map(line => {
        line = "*      " + line;
        return line.padEnd(64, " ") + "*";
      });
      headerContent = headerContent.join("\n");
      header = headerTop + headerContent + "\n" + headerTop;
      var columns = columnify(data, {
        columnSplitter: "  |  ",
        config: {
          description: { maxWidth: 50 }
          // name: { maxWidth: 50 }
        }
      });
      var text = header + "\n" + columns;
      fs.writeFileSync(FILELISTNAME, text);
      console.log(`${fileCount} files succefully written to ${FILELISTNAME}`);
    }
  }
} else {
  help();
}
