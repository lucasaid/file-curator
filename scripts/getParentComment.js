const { execSync } = require("child_process");
const readlineSync = require("readline-sync");
const getDescription = require("./getDescription");

const styleText = require("./styleText");
const getParentComment = (CURRENT, FILELISTNAME, useCurrent, apple) => {
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
      styleText(
        `WARING: Directory comment already exists, would you like to overwite? (y/n)`,
        "red"
      )
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
      styleText("Please add a description for this directory: ", "yellow")
    );
  } else {
    console.log(
      styleText("Current directory details:", "green"),
      styleText(parentComment, "blue")
    );
  }
  return parentComment;
};

module.exports = getParentComment;
