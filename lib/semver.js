"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const semver = __importStar(require("semver"));
function getLatest(current, versions) {
    const lines = versions.split("\n").map(x => x.trim());
    let latest = current;
    for (const line of lines) {
        if (line.length == 0) {
            continue;
        }
        const version = semver.valid(line);
        if (version == null) {
            continue;
        }
        if (semver.lt(latest, version)) {
            latest = version;
        }
    }
    return latest;
}
exports.getLatest = getLatest;
