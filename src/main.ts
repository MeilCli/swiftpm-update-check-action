import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as io from "@actions/io";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import * as process from "process";
import { ExecOptions } from "@actions/exec/lib/interfaces";
import {
    OutdatedPackage,
    Package,
    Dependency,
    extractJsonStringFromPostfix,
    toPackage
} from "./json";
import { getLatest } from "./semver";

interface Option {
    readonly executeDirectories: string[] | null;
}

async function getOption(): Promise<Option> {
    let executeDirectories: string[] | null = core
        .getInput("execute_directories")
        .split(os.EOL)
        .map(x => x.trim());
    if (executeDirectories.length == 1 && executeDirectories[0].length == 0) {
        executeDirectories = null;
    }

    return {
        executeDirectories: executeDirectories
    };
}

async function checkEnvironment() {
    await io.which("swift", true);
}

async function executeOutdated(
    executeDirectory: string | null
): Promise<OutdatedPackage[]> {
    const execOption: ExecOptions = { ignoreReturnCode: true };
    if (executeDirectory != null) {
        execOption.cwd = executeDirectory;
    }

    let stdout = "";
    execOption.listeners = {
        stdout: (data: Buffer) => {
            stdout += data.toString();
        }
    };

    await exec.exec(
        "swift package show-dependencies --format json",
        undefined,
        execOption
    );

    const projectPackage: Package = toPackage(
        extractJsonStringFromPostfix(stdout)
    );
    const dependencies: Dependency[] = projectPackage.dependencies;
    const result: OutdatedPackage[] = [];

    for (const dependency of dependencies) {
        const directory = path.relative(process.cwd(), dependency.path);
        const tagFile = "cocoapods-update-check.txt";
        await exec.exec(`git tag > ${tagFile}`, undefined, { cwd: directory });
        const tags: string = fs
            .readFileSync(path.join(directory, tagFile))
            .toString();
        await io.rmRF(path.join(directory, tagFile));

        const latest = getLatest(dependency.version, tags);
        if (latest != dependency.version) {
            result.push({
                name: dependency.name,
                current: dependency.version,
                latest: latest
            });
        }
    }

    return result;
}

function convertToOutputText(outdatedPackages: OutdatedPackage[]): string {
    let result = "";
    for (const outdatedPackage of outdatedPackages) {
        if (0 < result.length) {
            result += os.EOL;
        }
        result += `${outdatedPackage.name}: new version ${outdatedPackage.latest}`;
    }
    return result;
}

async function run() {
    try {
        await checkEnvironment();
        const option = await getOption();

        const result: OutdatedPackage[] = [];
        if (option.executeDirectories == null) {
            const packages = await executeOutdated(null);
            packages.forEach(x => result.push(x));
        } else {
            for (const executeDirectory of option.executeDirectories) {
                const packages = await executeOutdated(executeDirectory);
                packages.forEach(x => result.push(x));
            }
        }

        const outputText = convertToOutputText(result);
        core.setOutput(
            "has_swiftpm_update",
            result.length == 0 ? "false" : "true"
        );
        core.setOutput("swiftpm_update_text", outputText);
        core.setOutput("swiftpm_update_json", JSON.stringify(result));
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
