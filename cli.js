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

var data = [];
const CURRENT = process.cwd();
let FILELISTNAME = "file-listing.txt";
// Args
// const [, , ...args] = process.argv;
const force = process.argv.indexOf("-f") > -1 ? true : false;
const useCurrent = process.argv.indexOf("-u") > -1 ? true : false;
const emptyComment = process.argv.indexOf("-e") > -1 ? true : false;
const help = process.argv.indexOf("-help") > -1 ? true : false;
const apple = process.argv.indexOf("-a") > -1 ? true : false;
const dirsize = process.argv.indexOf("-d") > -1 ? true : false;

const nameIndex = process.argv.indexOf("-n");

if (nameIndex > -1) {
  FILELISTNAME = process.argv[nameIndex + 1] + ".txt";
}

if (!help) {
  console.log("\x1b[32m%s\x1b[0m", `Generating file list for ${process.cwd()}`);

  function currentFile(file) {
    let fileData = fs.readFileSync(file, "utf8");
    let fileLines = fileData.split("\n");
    let headerIndex = fileLines.findIndex(function(fileLine) {
      return (
        fileLine.match(/NAME/g) &&
        fileLine.match(/DATE/g) &&
        fileLine.match(/SIZE/g) &&
        fileLine.match(/DESCRIPTION/g)
      );
    });
    fileLines.splice(0, headerIndex + 1);
    fileList = [];
    let previous = null;
    fileLines.map(function(fileLine) {
      let fileLineArray = fileLine.split("  |  ");
      let name = fileLineArray[0].trim();
      let description = fileLineArray[3].trim();
      if (name !== "") {
        previous = name;
        fileList[name] = description;
      } else {
        fileList[previous] = fileList[previous] + " " + description;
      }
    });
    return fileList;
  }
  function getDescription(file) {
    let fileData = fs.readFileSync(file, "utf8");
    let desc = fileData.match(/DESCRIPTION([\S\s]*?)\*\*\*/gi);
    if (desc && desc[0]) {
      let fileLineArray = desc[0].split(/\*\n/gi);
      fileLineArray.shift();
      fileLineArray.pop();
      let newDesc = fileLineArray.map(function(line) {
        line = line.replace(/\*/g, "");
        line = line.trim();
        return line;
      });
      newDesc = newDesc.join(" ");
      return newDesc;
    } else {
      return "";
    }
  }

  function compareFiles(a, b) {
    return b.isDir - a.isDir || a.name > b.name ? 1 : -1;
  }
  function genLine(file, description) {
    return {
      name: file.name,
      date: file.date,
      size: file.size,
      description
    };
  }
  function formatSizeUnits(bytes) {
    if (bytes >= 1073741824) {
      bytes = (bytes / 1073741824).toFixed(2) + " GB";
    } else if (bytes >= 1048576) {
      bytes = (bytes / 1048576).toFixed(2) + " MB";
    } else if (bytes >= 1024) {
      bytes = (bytes / 1024).toFixed(2) + " KB";
    } else if (bytes > 1) {
      bytes = bytes + " bytes";
    } else if (bytes == 1) {
      bytes = bytes + " byte";
    } else {
      bytes = "0 bytes";
    }
    return bytes;
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
  console.log("***** FILE CURATOR *****");
  console.log("");
  console.log(
    "File curator genertates a file-listing.txt file that will index and catalogue all files in the current directory, allowing you to have a master file that displays relevant information for each file. Sub-directories are also included."
  );
  console.log("");
  console.log("Usage: file-curator [options] [arguments]");
  console.log("");
  data = [
    {
      option: "-n [filename]",
      description: "Use custom named text file."
    },
    {
      option: "-f",
      description: "Force re-write for all files."
    },
    {
      option: "-u",
      description:
        "If there is description currently assigned to the file, skip asking to overwrite and use current."
    },
    {
      option: "-e",
      description: "Generates empty comment and just generates file list."
    },
    {
      option: "-a",
      description: "Sync with apple finder."
    },
    {
      option: "-d",
      description:
        "Calculate directory file size, can be slow depending on how big the directory is."
    },
    {
      option: "-help",
      description: "Brings up this help text."
    }
  ];
  var columns = columnify(data, {
    columnSplitter: "   ",
    config: {
      description: { maxWidth: 50 }
    }
  });
  console.log(columns);
}
