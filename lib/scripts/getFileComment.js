"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const readline_sync_1 = __importDefault(require("readline-sync"));
const getFileComment = (file, currentFileData, force, emptyComment, useCurrent, apple) => {
    let fileComment = "";
    if (apple) {
        try {
            fileComment = (0, child_process_1.execFileSync)("mdls", ["-name", "kMDItemFinderComment", "-raw", file.path]).toString();
        }
        catch (_a) {
            fileComment = "";
        }
        if (!fileComment.length || fileComment === "(null)") {
            const scriptPath = path.join(__dirname, "../../applescript/get_comment.sh");
            fileComment = (0, child_process_1.execFileSync)("sh", [scriptPath, file.path]).toString();
        }
    }
    if (currentFileData[file.name] && currentFileData[file.name] != "") {
        fileComment = currentFileData[file.name];
    }
    let overWrite = false;
    console.log((0, helpers_1.styleText)("Filename: ", "blue"), (0, helpers_1.styleText)(file.name, "white_underline"));
    if (fileComment.length &&
        fileComment !== "(null)" &&
        !force &&
        !emptyComment) {
        console.log((0, helpers_1.styleText)("Current details: ", "green"), (0, helpers_1.styleText)(fileComment, "blue"));
        if (!useCurrent) {
            var overWriteQ = readline_sync_1.default.question((0, helpers_1.styleText)(`WARING: Comment already exists, would you like to overwite? (y/n) `, "red"));
            if (overWriteQ.toLowerCase() === "y" ||
                overWriteQ.toLowerCase() === "yes") {
                overWrite = true;
            }
        }
    }
    else {
        overWrite = true;
    }
    if (overWrite && !emptyComment) {
        fileComment = readline_sync_1.default.question((0, helpers_1.styleText)(`Please comment this ${file.isDir ? `directory` : `file`}: `, "yellow"));
    }
    if (emptyComment) {
        fileComment = "";
    }
    if (apple) {
        (0, child_process_1.execFileSync)("xattr", [
            "-w",
            "com.apple.metadata:kMDItemFinderComment",
            fileComment,
            file.path
        ]);
        const updateScript = path.join(__dirname, "../../applescript/update_finder.sh");
        (0, child_process_1.execFileSync)("sh", [updateScript, file.path, fileComment]);
    }
    return { fileComment, overWrite };
};
exports.default = getFileComment;
