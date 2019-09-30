import * as os from "os";
import * as core from "@actions/core";

export interface OutdatedPackage {
    readonly name: string;
    readonly current: string;
    readonly latest: string;
}

export interface Package {
    readonly dependencies: Dependency[];
}

export interface Dependency {
    readonly name: string;
    readonly version: string;
    readonly path: string;
}

export function extractJsonStringFromPostfix(value: string): string {
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

export function toPackage(value: string): Package {
    try {
        return JSON.parse(value) as Package;
    } catch (error) {
        core.info(`fail parse json: ${value}`);
        throw error;
    }
}
