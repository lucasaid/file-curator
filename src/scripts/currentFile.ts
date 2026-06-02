import fs from "fs";
import { currentFiles } from "./helpers";

const currentFile = (file: string): currentFiles => {
  let fileData = fs.readFileSync(file, "utf8");
  let fileLines = fileData.split("\n");
  let headerIndex = fileLines.findIndex(fileLine => {
    return (
      fileLine.match(/NAME/g) !== null &&
      fileLine.match(/DATE/g) !== null &&
      fileLine.match(/SIZE/g) !== null &&
      fileLine.match(/DESCRIPTION/g) !== null
    );
  });

  if (headerIndex === -1) {
    return {};
  }

  fileLines.splice(0, headerIndex + 1);
  const fileList: currentFiles = {};
  let previous: string | undefined;

  fileLines.forEach(fileLine => {
    const fileLineArray = fileLine.split("  |  ", 4);
    if (fileLineArray.length < 4) {
      return;
    }
    const name = fileLineArray[0].trim();
    const description = fileLineArray[3].trim();
    if (name !== "") {
      previous = name;
      fileList[name] = description;
    } else if (previous !== undefined) {
      fileList[previous] = fileList[previous] + " " + description;
    }
  });

  return fileList;
};
export default currentFile;
