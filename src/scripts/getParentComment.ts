import { execFileSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import readlineSync from "readline-sync";
import getDescription from "./getDescription";

import { styleText } from "./helpers";
const getParentComment = (
  CURRENT: string,
  FILELISTNAME: string,
  useCurrent: boolean,
  apple: boolean
) => {
  let parentComment = "";
  if (apple) {
    try {
      parentComment = execFileSync("mdls", ["-name", "kMDItemFinderComment", "-raw", CURRENT]).toString();
    } catch {
      parentComment = "";
    }
    if (!parentComment.length || parentComment === "(null)") {
      const scriptPath = path.join(__dirname, "../../applescript/get_comment.sh");
      parentComment = execFileSync("sh", [scriptPath, CURRENT]).toString();
    }
  }
  const listingPath = `${CURRENT}/${FILELISTNAME}`;
  if (!parentComment.length || parentComment === "(null)") {
    parentComment = fs.existsSync(listingPath) ? getDescription(listingPath) : "";
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
