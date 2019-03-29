import fs from "fs";
import { currentFiles } from "./helpers";

const currentFile = (file: string): currentFiles => {
  let fileData = fs.readFileSync(file, "utf8");
  let fileLines = fileData.split("\n");
  let headerIndex = fileLines.findIndex(fileLine => {
    if (
      fileLine.match(/NAME/g) &&
      fileLine.match(/DATE/g) &&
      fileLine.match(/SIZE/g) &&
      fileLine.match(/DESCRIPTION/g) &&
      fileLine.match(/YEAR/g) &&
      fileLine.match(/RATING/g)
    ) {
      return true;
    }
    return false;
  });
  fileLines.splice(0, headerIndex + 1);
  let fileList: currentFiles | any = [];
  let previous: string;
  fileLines.map(fileLine => {
    let fileLineArray = fileLine.split("  |  ");
    let name = fileLineArray[0].trim();
    let description = fileLineArray[3].trim();
    let year = fileLineArray[4].trim();
    let rating = fileLineArray[5].trim();
    if (name !== "") {
      previous = name;
      fileList[name] = {
        desc: ""
      };
      fileList[name].desc = description;
      if (year != "") {
        fileList[name].year = year;
        fileList[name].rating = rating;
      }
    } else {
      fileList[previous].desc = fileList[previous].desc + " " + description;
    }
  });
  return fileList;
};
export default currentFile;
