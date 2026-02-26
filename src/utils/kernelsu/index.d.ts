export interface ExecOptions {
    cwd?: string,
    env?: { [key: string]: string }
}

export interface ExecResults {
    errno: number,
    stdout: string,
    stderr: string
}

declare function exec(command: string): Promise<ExecResults>;
declare function exec(command: string, options: ExecOptions): Promise<ExecResults>;

export interface SpawnOptions {
    cwd?: string,
    env?: { [key: string]: string }
}

export interface Stdio {
    on(event: 'data', callback: (data: string) => void)
}

export interface ChildProcess {
    stdout: Stdio,
    stderr: Stdio,
    on(event: 'exit', callback: (code: number) => void)
    on(event: 'error', callback: (err: any) => void)
}

declare function spawn(command: string): ChildProcess;
declare function spawn(command: string, args: string[]): ChildProcess;
declare function spawn(command: string, options: SpawnOptions): ChildProcess;
declare function spawn(command: string, args: string[], options: SpawnOptions): ChildProcess;

declare function fullScreen(isFullScreen: boolean);

declare function enableEdgeToEdge(enable: boolean);

declare function toast(message: string);

declare function moduleInfo(): string;

export interface PackagesInfo {
    packageName: string;
    versionName: string;
    versionCode: number;
    appLabel: string;
    isSystem: boolean;
    uid: number;
}

declare function listPackages(type: string): string[];

declare function getPackagesInfo(packages: string[]): PackagesInfo[];

declare function exit();

export {
    exec,
    spawn,
    fullScreen,
    enableEdgeToEdge,
    toast,
    moduleInfo,
    listPackages,
    getPackagesInfo,
    exit,
}
