import wordwrap from "word-wrap";
import { formatSizeUnits } from "./helpers";

import columnify from "columnify";
import dateFormat from "dateformat";
const genText = (
  data: any,
  parentComment: string,
  CURRENT: string,
  totalSize: number
) => {
  let headerTop =
    "*****************************************************************\n";
  let headerContent: string = wordwrap(parentComment, {
    width: 50,
    indent: "",
    newline: "\n"
  });
  let headerContentArray: string[] = headerContent.split("\n");
  headerContentArray.unshift(" ");
  headerContentArray.unshift(`FULL PATH: ${CURRENT}`);
  headerContentArray.unshift(" ");
  headerContentArray.unshift(`TOTAL SIZE: ${formatSizeUnits(totalSize)}`);
  headerContentArray.unshift(" ");
  headerContentArray.unshift(
    "FILE CREATED: " + dateFormat(new Date(), "yyyy-mm-dd H:MM:ss")
  );
  headerContentArray.unshift(" ");
  headerContentArray.push(" ");
  headerContent = headerContentArray.join("\n");
  headerContent = wordwrap(headerContent, {
    width: 50,
    indent: "",
    newline: "\n",
    cut: true
  });
  headerContentArray = headerContent.split("\n");
  headerContentArray = headerContentArray.map(line => {
    line = "*      " + line;
    return line.padEnd(64, " ") + "*";
  });
  headerContent = headerContentArray.join("\n");
  const header = headerTop + headerContent + "\n" + headerTop;
  var columns = columnify(data, {
    columnSplitter: "  |  ",
    config: {
      description: { maxWidth: 50 }
    }
  });
  return header + "\n" + columns;
};
export default genText;
