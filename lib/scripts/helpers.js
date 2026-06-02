"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.styleText = exports.genLine = exports.compareFiles = exports.formatSizeUnits = void 0;
const formatSizeUnits = (bytes) => {
    let newBytes;
    if (bytes >= 1073741824) {
        newBytes = (bytes / 1073741824).toFixed(2) + " GB";
    }
    else if (bytes >= 1048576) {
        newBytes = (bytes / 1048576).toFixed(2) + " MB";
    }
    else if (bytes >= 1024) {
        newBytes = (bytes / 1024).toFixed(2) + " KB";
    }
    else if (bytes > 1) {
        newBytes = bytes + " bytes";
    }
    else if (bytes == 1) {
        newBytes = bytes + " byte";
    }
    else {
        newBytes = "0 bytes";
    }
    return newBytes;
};
exports.formatSizeUnits = formatSizeUnits;
const compareFiles = (a, b) => {
    return (b.isDir ? 1 : 0) - (a.isDir ? 1 : 0) || a.name > b.name ? 1 : -1;
};
exports.compareFiles = compareFiles;
const genLine = (file, description) => {
    return {
        name: file.name,
        date: file.date,
        size: file.size,
        description
    };
};
exports.genLine = genLine;
const styleText = (text, color) => {
    const colors = {
        green: "\x1b[32m",
        red: "\x1b[31m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        white: "\x1b[37m",
        underline: "\x1b[4m",
        white_underline: "\x1b[4m\x1b[37m"
    };
    return `${colors[color]}${text}\x1b[0m`;
};
exports.styleText = styleText;
