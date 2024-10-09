// @ts-ignore
import { exec, spawn, fullScreen, toast } from 'kernelsu';

interface ExecResult {
    errno: number;
    stdout: string;
}

export const getDeviceCharacteristics = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const { errno, stdout }: ExecResult = await exec("getprop ro.build.characteristics");
        errno ? reject(errno) : resolve(stdout);
    });
}

export const getAndroidTargetSdk = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const { errno, stdout }: ExecResult = await exec("getprop ro.build.version.sdk");
        errno ? reject(errno) : resolve(stdout);
    });
}

export const getSourceEmbeddedRulesList = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const { errno, stdout }: ExecResult = await exec("cat /data/system/cloudFeature_embedded_rules_list.xml");
        errno ? reject(errno) : resolve(stdout);
    });
}

export const getSourceFixedOrientationList = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const { errno, stdout }: ExecResult = await exec("cat /data/system/cloudFeature_fixed_orientation_list.xml");
        errno ? reject(errno) : resolve(stdout);
    });
}

export const getCustomConfigEmbeddedRulesList = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const { errno, stdout }: ExecResult = await exec("cat /data/adb/MIUI_MagicWindow+/config/embedded_rules_list.xml");
        errno ? reject(errno) : resolve(stdout);
    });
}

export const getCustomConfigFixedOrientationList = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const { errno, stdout }: ExecResult = await exec("cat /data/adb/MIUI_MagicWindow+/config/fixed_orientation_list.xml");
        errno ? reject(errno) : resolve(stdout);
    });
}

export const getEmbeddedSettingConfig = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const { errno, stdout }: ExecResult = await exec("cat /data/system/users/0/embedded_setting_config.xml");
        errno ? reject(errno) : resolve(stdout);
    });
}
