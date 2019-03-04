const styleText = require("./styleText");

const { execSync } = require("child_process");
const readlineSync = require("readline-sync");
const getFileComment = (
  file,
  currentFileData,
  force,
  emptyComment,
  useCurrent,
  apple
) => {
  let fileComment = execSync(
    `mdls -name kMDItemFinderComment -raw "${file.path}"`
  ).toString();
  if ((!fileComment.length || fileComment === "(null)") && apple) {
    fileComment = execSync(
      `sh ${__dirname}/applescript/get_comment.sh "${file.path}"`
    ).toString();
  }
  if (currentFileData[file.name] && currentFileData[file.name] != "") {
    fileComment = currentFileData[file.name];
  }
  let overWrite = false;
  console.log(
    styleText("Filename: ", "blue"),
    styleText(file.name, "white_underline")
  );
  if (
    fileComment.length &&
    fileComment !== "(null)" &&
    !force &&
    !emptyComment
  ) {
    console.log(
      styleText("Current details: ", "green"),
      styleText(fileComment, "blue")
    );
    if (!useCurrent) {
      var overWriteQ = readlineSync.question(
        styleText(
          `WARING: Comment already exists, would you like to overwite? (y/n) `,
          "red"
        )
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
    fileComment = readlineSync.question(
      styleText(
        `Please comment this ${file.isDir ? `directory` : `file`}: `,
        "yellow"
      )
    );
  }
  if (emptyComment) {
    fileComment = "";
  }
  if (apple) {
    execSync(
      `xattr -w com.apple.metadata:kMDItemFinderComment "${fileComment}" "${
        file.path
      }"`
    );
    execSync(
      `sh ${__dirname}/applescript/update_finder.sh "${
        file.path
      }" "${fileComment}"`
    );
  }
  return { fileComment, overWrite };
};
module.exports = getFileComment;
