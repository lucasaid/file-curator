import fs from "fs";
const currentFile = (file: string) => {
  let fileData = fs.readFileSync(file, "utf8");
  let fileLines = fileData.split("\n");
  let headerIndex = fileLines.findIndex(fileLine => {
    if (
      fileLine.match(/NAME/g) &&
      fileLine.match(/DATE/g) &&
      fileLine.match(/SIZE/g) &&
      fileLine.match(/DESCRIPTION/g)
    ) {
      return true;
    }
    return false;
  });
  fileLines.splice(0, headerIndex + 1);
  let fileList: any = [];
  let previous: any = null;
  fileLines.map(fileLine => {
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
};
export default currentFile;
