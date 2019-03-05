"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var word_wrap_1 = __importDefault(require("word-wrap"));
var helpers_1 = require("./helpers");
var columnify_1 = __importDefault(require("columnify"));
var dateformat_1 = __importDefault(require("dateformat"));
var genText = function (data, parentComment, CURRENT, totalSize) {
    var headerTop = "*****************************************************************\n";
    var headerContent = word_wrap_1.default(parentComment, {
        width: 50,
        indent: "",
        newline: "\n"
    });
    headerContent = headerContent.split("\n");
    headerContent.unshift(" ");
    headerContent.unshift("FULL PATH: " + CURRENT);
    headerContent.unshift(" ");
    headerContent.unshift("TOTAL SIZE: " + helpers_1.formatSizeUnits(totalSize));
    headerContent.unshift(" ");
    headerContent.unshift("FILE CREATED: " + dateformat_1.default(new Date(), "yyyy-mm-dd H:MM:ss"));
    headerContent.unshift(" ");
    headerContent.push(" ");
    headerContent = headerContent.join("\n");
    headerContent = word_wrap_1.default(headerContent, {
        width: 50,
        indent: "",
        newline: "\n",
        cut: true
    });
    headerContent = headerContent.split("\n");
    headerContent = headerContent.map(function (line) {
        line = "*      " + line;
        return line.padEnd(64, " ") + "*";
    });
    headerContent = headerContent.join("\n");
    var header = headerTop + headerContent + "\n" + headerTop;
    var columns = columnify_1.default(data, {
        columnSplitter: "  |  ",
        config: {
            description: { maxWidth: 50 }
        }
    });
    return header + "\n" + columns;
};
exports.default = genText;
