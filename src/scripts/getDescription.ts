const fs = require("fs");
const getDescription = (file: any) => {
  let fileData = fs.readFileSync(file, "utf8");
  let desc = fileData.match(/DESCRIPTION([\S\s]*?)\*\*\*/gi);
  if (desc && desc[0]) {
    let fileLineArray = desc[0].split(/\*\n/gi);
    fileLineArray.shift();
    fileLineArray.pop();
    let newDesc = fileLineArray.map(function(line: string) {
      line = line.replace(/\*/g, "");
      line = line.trim();
      return line;
    });
    newDesc = newDesc.join(" ");
    return newDesc;
  } else {
    return "";
  }
};
export default getDescription;
