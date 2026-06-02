import { styleText, commentData } from "./helpers";
import { execSync, execFileSync } from "child_process";
import * as path from "path";
import readlineSync from "readline-sync";
const getFileComment = (
  file: any,
  currentFileData: any,
  force: boolean,
  emptyComment: boolean,
  useCurrent: boolean,
  apple: boolean
): commentData => {
  let fileComment = "";
  if (apple) {
    try {
      fileComment = execFileSync("mdls", ["-name", "kMDItemFinderComment", "-raw", file.path]).toString();
    } catch {
      fileComment = "";
    }
    if (!fileComment.length || fileComment === "(null)") {
      const scriptPath = path.join(__dirname, "../../applescript/get_comment.sh");
      fileComment = execFileSync("sh", [scriptPath, file.path]).toString();
    }
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
    execFileSync("xattr", [
      "-w",
      "com.apple.metadata:kMDItemFinderComment",
      fileComment,
      file.path
    ]);
    const updateScript = path.join(__dirname, "../../applescript/update_finder.sh");
    execFileSync("sh", [updateScript, file.path, fileComment]);
  }
  return { fileComment, overWrite };
};

export default getFileComment;
