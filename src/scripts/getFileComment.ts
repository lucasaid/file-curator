import { styleText, commentData } from "./helpers";
import { execSync } from "child_process";
import readlineSync from "readline-sync";
const getFileComment = (
  file: any,
  currentFileData: any,
  force: boolean,
  emptyComment: boolean,
  useCurrent: boolean,
  apple: boolean
): commentData => {
  let fileComment = execSync(
    `mdls -name kMDItemFinderComment -raw "${file.path}"`
  ).toString();
  if ((!fileComment.length || fileComment === "(null)") && apple) {
    fileComment = execSync(
      `sh ${__dirname}/applescript/get_comment.sh "${file.path}"`
    ).toString();
  }
  if (
    currentFileData &&
    currentFileData[file.name] &&
    currentFileData[file.name].desc &&
    currentFileData[file.name].desc != ""
  ) {
    fileComment = currentFileData[file.name].desc;
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

export default getFileComment;
