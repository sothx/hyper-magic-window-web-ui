import type EmbeddedRuleItem from '@/types/EmbeddedRuleItem';
// @ts-ignore
import { exec, spawn, fullScreen, toast } from 'kernelsu';
import axios from 'axios';

interface ExecResult {
    errno: number;
    stdout: string;
    stderr: string;
}

export interface SmartFocusIOResult extends ExecResult {
    stdout: 'on' | 'off'
}

export interface MiuiCompatResult extends Omit<ExecResult, 'stdout'> {
    stdout: boolean;
}

export const getDeviceCharacteristics = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const { errno, stdout, stderr }: ExecResult = await exec("getprop ro.build.characteristics");
        errno ? reject(stderr) : resolve(stdout);
    });
}

export const getAndroidTargetSdk = (): Promise<number> => {
    return new Promise(async (resolve, reject) => {
        const { errno, stdout, stderr }: ExecResult = await exec("getprop ro.build.version.sdk");
        errno ? reject(stderr) : resolve(Number(stdout));
    });
}

export const getMIOSVersion = (): Promise<number> => {
    return new Promise(async (resolve, reject) => {
        const { errno, stdout, stderr }: ExecResult = await exec("getprop ro.mi.os.version.code");
        errno ? reject(stderr) : resolve(Number(stdout));
    });
}

export const getSmartFocusIO = (): Promise<SmartFocusIOResult["stdout"]> => {
    return new Promise(async (resolve, reject) => {
        const { errno, stdout, stderr }: SmartFocusIOResult = await exec("getprop persist.sys.stability.smartfocusio");
        errno ? reject(stderr) : resolve(stdout);
    });
}

export const getDeviceSocName = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const { errno, stdout, stderr }: ExecResult = await exec("getprop ro.vendor.qti.soc_name");
        errno ? reject(stderr) : resolve(stdout);
    });
}

export const getDeviceSocModel = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const { errno, stdout, stderr }: ExecResult = await exec("getprop ro.vendor.qti.soc_model");
        errno ? reject(stderr) : resolve(stdout);
    });
}

export const getMiuiCompatEnable = (): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        const { errno, stdout, stderr }: MiuiCompatResult = await exec("getprop ro.config.miui_compat_enable");
        errno ? reject(stderr) : resolve(stdout);
    });
}


export const getMiuiAppCompatEnable = (): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        const { errno, stdout, stderr }: MiuiCompatResult = await exec("getprop ro.config.miui_appcompat_enable");
        errno ? reject(stderr) : resolve(stdout);
    });
}



export const getSourceEmbeddedRulesList = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            const { errno, stdout, stderr }: ExecResult = await exec("cat /data/system/cloudFeature_embedded_rules_list.xml");
            errno ? reject(stderr) : resolve(stdout);
        } catch (err) {
            const response = await axios.get('/data/origin/embedded_rules_list.xml');
            const xmlText = response.data; // 这是 XML 内容
            resolve(xmlText);
        }
    });
}

export const getSourceFixedOrientationList = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            const { errno, stdout, stderr }: ExecResult = await exec("cat /data/system/cloudFeature_fixed_orientation_list.xml");
            errno ? reject(stderr) : resolve(stdout);
        } catch (err) {
            const response = await axios.get('/data/origin/fixed_orientation_list.xml');
            const xmlText = response.data; // 这是 XML 内容
            resolve(xmlText);
        }
    });
}

export const getCustomConfigEmbeddedRulesList = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            const { errno, stdout, stderr }: ExecResult = await exec("cat /data/adb/MIUI_MagicWindow+/config/embedded_rules_list.xml");
            errno ? reject(stderr) : resolve(stdout);
        } catch (err) {
            const response = await axios.get('/data/custom/embedded_rules_list.xml');
            const xmlText = response.data; // 这是 XML 内容
            resolve(xmlText);
        }
    });
}

export const getCustomConfigFixedOrientationList = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            const { errno, stdout, stderr }: ExecResult = await exec("cat /data/adb/MIUI_MagicWindow+/config/fixed_orientation_list.xml");
            errno ? reject(stderr) : resolve(stdout);
        } catch (err) {
            const response = await axios.get('/data/custom/fixed_orientation_list.xml');
            const xmlText = response.data; // 这是 XML 内容
            resolve(xmlText);
        }
    });
}

export const getEmbeddedSettingConfig = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            const { errno, stdout, stderr }: ExecResult = await exec("cat /data/system/users/0/embedded_setting_config.xml");
            errno ? reject(stderr) : resolve(stdout);
        } catch (err) {
            const response = await axios.get('/data/origin/embedded_setting_config.xml');
            const xmlText = response.data; // 这是 XML 内容
            resolve(xmlText);
        }
    });
}