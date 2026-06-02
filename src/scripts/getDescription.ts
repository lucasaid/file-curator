import * as fs from "fs";

const getDescription = (file: string): string => {
  if (!fs.existsSync(file)) {
    return "";
  }
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
    return newDesc.join(" ");
  } else {
    return "";
  }
};
export default getDescription;
