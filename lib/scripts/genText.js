"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const word_wrap_1 = __importDefault(require("word-wrap"));
const helpers_1 = require("./helpers");
const columnify_1 = __importDefault(require("columnify"));
const dateformat_1 = __importDefault(require("dateformat"));
const genText = (data, parentComment, CURRENT, totalSize) => {
    let headerTop = "*****************************************************************\n";
    let headerContent = (0, word_wrap_1.default)(parentComment, {
        width: 50,
        indent: "",
        newline: "\n"
    });
    let headerContentArray = headerContent.split("\n");
    headerContentArray.unshift(" ");
    headerContentArray.unshift(`FULL PATH: ${CURRENT}`);
    headerContentArray.unshift(" ");
    headerContentArray.unshift(`TOTAL SIZE: ${(0, helpers_1.formatSizeUnits)(totalSize)}`);
    headerContentArray.unshift(" ");
    headerContentArray.unshift("FILE CREATED: " + (0, dateformat_1.default)(new Date(), "yyyy-mm-dd H:MM:ss"));
    headerContentArray.unshift(" ");
    headerContentArray.push(" ");
    headerContent = headerContentArray.join("\n");
    headerContent = (0, word_wrap_1.default)(headerContent, {
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
    var columns = (0, columnify_1.default)(data, {
        columnSplitter: "  |  ",
        config: {
            description: { maxWidth: 50 }
        }
    });
    return header + "\n" + columns;
};
exports.default = genText;
