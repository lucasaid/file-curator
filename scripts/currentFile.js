const fs = require("fs");
const currentFile = file => {
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
};
module.exports = currentFile;
