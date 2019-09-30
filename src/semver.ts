import * as semver from "semver";

export function getLatest(current: string, versions: string): string {
    const lines = versions.split("\n").map(x => x.trim());

    let latest = current;
    for (const line of lines) {
        if (line.length == 0) {
            continue
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