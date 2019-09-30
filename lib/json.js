"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = __importStar(require("os"));
const core = __importStar(require("@actions/core"));
function extractJsonStringFromPostfix(value) {
    const lines = value.split("\n");
    let inJson = false;
    let result = "";
    for (const line of lines) {
        if (line.trim() == "{") {
            inJson = true;
        }
        if (inJson) {
            result += `${line}${os.EOL}`;
        }
    }
    return result;
}
exports.extractJsonStringFromPostfix = extractJsonStringFromPostfix;
function toPackage(value) {
    try {
        return JSON.parse(value);
    }
    catch (error) {
        core.info(`fail parse json: ${value}`);
        throw error;
    }
}
exports.toPackage = toPackage;
