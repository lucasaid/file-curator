import { execSync } from "child_process";
import readlineSync from "readline-sync";
import getDescription from "./getDescription";

import styleText from "./styleText";
const getParentComment = (
  CURRENT: string,
  FILELISTNAME: string,
  useCurrent: boolean,
  apple: boolean
) => {
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
  let overWriteMain = false;
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

export default getParentComment;
