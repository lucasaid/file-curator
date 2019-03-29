"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var sync_request_1 = __importDefault(require("sync-request"));
function getMovieData(name, API, notfound, yearParse) {
    if (API && name) {
        var year = null;
        var searchName = "";
        if (!notfound) {
            name = name
                .split(".")
                .slice(0, -1)
                .join(".");
            name = name.replace(/\./gi, " ");
            var yearArray = name.split(/[^\d]/).filter(function (n) {
                if (n >= 1900 && n <= 2099)
                    return n;
            });
            year = yearArray[yearArray.length - 1];
            if (year) {
                var nameArray = name.split(year);
                searchName = nameArray[0];
            }
        }
        else {
            if (yearParse) {
                year = yearParse;
            }
            searchName = name;
        }
        var url = "http://www.omdbapi.com/?apikey=" + API + "&type=movie&t=" + searchName;
        if (year) {
            url = url + "&y=" + year;
        }
        var res = sync_request_1.default("GET", url);
        var result = res.getBody("utf8");
        var json = JSON.parse(result);
        if (json.Response === "False") {
            return false;
        }
        return json;
    }
    else {
        return false;
    }
}
exports.default = getMovieData;
