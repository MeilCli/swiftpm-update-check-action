export interface OutdatedPackage {
    readonly name: string;
    readonly current: string;
    readonly latest: string;
}

export interface Package {
    readonly denpendencies: Dependency[];
}

export interface Dependency {
    readonly name: string;
    readonly version: string;
    readonly path: string;
}

export function toPackage(value: string): Package {
    return JSON.parse(value) as Package;
}
