"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const io = __importStar(require("@actions/io"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const process = __importStar(require("process"));
const json_1 = require("./json");
const semver_1 = require("./semver");
function getOption() {
    return __awaiter(this, void 0, void 0, function* () {
        let executeDirectories = core
            .getInput("execute_directories")
            .split(os.EOL)
            .map(x => x.trim());
        if (executeDirectories.length == 1 && executeDirectories[0].length == 0) {
            executeDirectories = null;
        }
        return {
            executeDirectories: executeDirectories
        };
    });
}
function checkEnvironment() {
    return __awaiter(this, void 0, void 0, function* () {
        yield io.which("swift", true);
    });
}
function executeOutdated(executeDirectory) {
    return __awaiter(this, void 0, void 0, function* () {
        const execOption = { ignoreReturnCode: true };
        if (executeDirectory != null) {
            execOption.cwd = executeDirectory;
        }
        let stdout = "";
        execOption.listeners = {
            stdout: (data) => {
                stdout += data.toString();
            }
        };
        yield exec.exec("swift package show-dependencies --format json", undefined, execOption);
        const projectPackage = json_1.toPackage(json_1.extractJsonStringFromPostfix(stdout));
        const dependencies = projectPackage.dependencies;
        const result = [];
        for (const dependency of dependencies) {
            const directory = path.relative(process.cwd(), dependency.path);
            const childExecOption = { cwd: directory };
            let tags = "";
            childExecOption.listeners = {
                stdout: (data) => {
                    tags += data.toString();
                }
            };
            yield exec.exec(`git tag`, undefined, childExecOption);
            const latest = semver_1.getLatest(dependency.version, tags);
            if (latest != dependency.version) {
                result.push({
                    name: dependency.name,
                    current: dependency.version,
                    latest: latest
                });
            }
        }
        return result;
    });
}
function convertToOutputText(outdatedPackages) {
    let result = "";
    for (const outdatedPackage of outdatedPackages) {
        if (0 < result.length) {
            result += os.EOL;
        }
        result += `${outdatedPackage.name}: new version ${outdatedPackage.latest}`;
    }
    return result;
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield checkEnvironment();
            const option = yield getOption();
            const result = [];
            if (option.executeDirectories == null) {
                const packages = yield executeOutdated(null);
                packages.forEach(x => result.push(x));
            }
            else {
                for (const executeDirectory of option.executeDirectories) {
                    const packages = yield executeOutdated(executeDirectory);
                    packages.forEach(x => result.push(x));
                }
            }
            const outputText = convertToOutputText(result);
            core.setOutput("has_swiftpm_update", result.length == 0 ? "false" : "true");
            core.setOutput("swiftpm_update_text", outputText);
            core.setOutput("swiftpm_update_json", JSON.stringify(result));
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
