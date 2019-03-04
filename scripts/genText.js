const wordwrap = require("word-wrap");
const { formatSizeUnits } = require("./helpers");

const columnify = require("columnify");
const dateFormat = require("dateformat");
const genText = (data, parentComment, CURRENT, totalSize) => {
  let header = [];
  headerTop =
    "*****************************************************************\n";
  headerContent = wordwrap(parentComment, {
    width: 50,
    indent: "",
    newline: "\n"
  });
  headerContent = headerContent.split("\n");
  headerContent.unshift(" ");
  headerContent.unshift(`FULL PATH: ${CURRENT}`);
  headerContent.unshift(" ");
  headerContent.unshift(`TOTAL SIZE: ${formatSizeUnits(totalSize)}`);
  headerContent.unshift(" ");
  headerContent.unshift(
    "FILE CREATED: " + dateFormat(new Date(), "yyyy-mm-dd H:MM:ss")
  );
  headerContent.unshift(" ");
  headerContent.push(" ");
  headerContent = headerContent.join("\n");
  headerContent = wordwrap(headerContent, {
    width: 50,
    indent: "",
    newline: "\n",
    cut: true
  });
  headerContent = headerContent.split("\n");
  headerContent = headerContent.map(line => {
    line = "*      " + line;
    return line.padEnd(64, " ") + "*";
  });
  headerContent = headerContent.join("\n");
  header = headerTop + headerContent + "\n" + headerTop;
  var columns = columnify(data, {
    columnSplitter: "  |  ",
    config: {
      description: { maxWidth: 50 }
    }
  });
  return header + "\n" + columns;
};
module.exports = genText;
