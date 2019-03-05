"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var getDescription = function (file) {
    var fileData = fs.readFileSync(file, "utf8");
    var desc = fileData.match(/DESCRIPTION([\S\s]*?)\*\*\*/gi);
    if (desc && desc[0]) {
        var fileLineArray = desc[0].split(/\*\n/gi);
        fileLineArray.shift();
        fileLineArray.pop();
        var newDesc = fileLineArray.map(function (line) {
            line = line.replace(/\*/g, "");
            line = line.trim();
            return line;
        });
        newDesc = newDesc.join(" ");
        return newDesc;
    }
    else {
        return "";
    }
};
exports.default = getDescription;
