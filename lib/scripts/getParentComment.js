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
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const readline_sync_1 = __importDefault(require("readline-sync"));
const getDescription_1 = __importDefault(require("./getDescription"));
const helpers_1 = require("./helpers");
const getParentComment = (CURRENT, FILELISTNAME, useCurrent, apple) => {
    let parentComment = "";
    if (apple) {
        try {
            parentComment = (0, child_process_1.execFileSync)("mdls", ["-name", "kMDItemFinderComment", "-raw", CURRENT]).toString();
        }
        catch (_a) {
            parentComment = "";
        }
        if (!parentComment.length || parentComment === "(null)") {
            const scriptPath = path.join(__dirname, "../../applescript/get_comment.sh");
            parentComment = (0, child_process_1.execFileSync)("sh", [scriptPath, CURRENT]).toString();
        }
    }
    const listingPath = `${CURRENT}/${FILELISTNAME}`;
    if (!parentComment.length || parentComment === "(null)") {
        parentComment = fs.existsSync(listingPath) ? (0, getDescription_1.default)(listingPath) : "";
    }
    let overWriteMain = false;
    if (parentComment.length && parentComment !== "(null)" && !useCurrent) {
        var overWriteMainQ = readline_sync_1.default.question((0, helpers_1.styleText)(`WARING: Directory comment already exists, would you like to overwite? (y/n)`, "red"));
        if (overWriteMainQ.toLowerCase() === "y" ||
            overWriteMainQ.toLowerCase() === "yes") {
            overWriteMain = true;
        }
    }
    if (!parentComment.length || parentComment === "(null)" || overWriteMain) {
        parentComment = readline_sync_1.default.question((0, helpers_1.styleText)("Please add a description for this directory: ", "yellow"));
    }
    else {
        console.log((0, helpers_1.styleText)("Current directory details:", "green"), (0, helpers_1.styleText)(parentComment, "blue"));
    }
    return parentComment;
};
exports.default = getParentComment;
