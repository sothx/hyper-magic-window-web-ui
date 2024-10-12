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
        if (import.meta.env.MODE === 'development') {
            resolve('tablet')
            return;
        }
        const { errno, stdout, stderr }: ExecResult = await exec("getprop ro.build.characteristics");
        errno ? reject(stderr) : resolve(stdout);
    });
}

export const getAndroidTargetSdk = (): Promise<number> => {
    return new Promise(async (resolve, reject) => {
        if (import.meta.env.MODE === 'development') {
            resolve(34)
            return;
        }
        const { errno, stdout, stderr }: ExecResult = await exec("getprop ro.build.version.sdk");
        errno ? reject(stderr) : resolve(Number(stdout));
    });
}

export const getMIOSVersion = (): Promise<number> => {
    return new Promise(async (resolve, reject) => {
        if (import.meta.env.MODE === 'development') {
            resolve(1)
            return;
        }
        const { errno, stdout, stderr }: ExecResult = await exec("getprop ro.mi.os.version.code");
        errno ? reject(stderr) : resolve(Number(stdout));
    });
}

export const getSmartFocusIO = (): Promise<SmartFocusIOResult["stdout"]> => {
    return new Promise(async (resolve, reject) => {
        if (import.meta.env.MODE === 'development') {
            resolve('on')
            return;
        }
        const { errno, stdout, stderr }: SmartFocusIOResult = await exec("getprop persist.sys.stability.smartfocusio");
        errno ? reject(stderr) : resolve(stdout);
    });
}

export const getDeviceSocName = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        if (import.meta.env.MODE === 'development') {
            resolve('cape')
            return;
        }
        const { errno, stdout, stderr }: ExecResult = await exec("getprop ro.vendor.qti.soc_name");
        errno ? reject(stderr) : resolve(stdout);
    });
}

export const getDeviceSocModel = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        if (import.meta.env.MODE === 'development') {
            resolve('SM8475')
            return;
        }
        const { errno, stdout, stderr }: ExecResult = await exec("getprop ro.vendor.qti.soc_model");
        errno ? reject(stderr) : resolve(stdout);
    });
}

export const getMiuiCompatEnable = (): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        if (import.meta.env.MODE === 'development') {
            resolve(true)
            return;
        }
        const { errno, stdout, stderr }: MiuiCompatResult = await exec("getprop ro.config.miui_compat_enable");
        errno ? reject(stderr) : resolve(stdout);
    });
}


export const getMiuiAppCompatEnable = (): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        if (import.meta.env.MODE === 'development') {
            resolve(true)
            return;
        }
        const { errno, stdout, stderr }: MiuiCompatResult = await exec("getprop ro.config.miui_appcompat_enable");
        errno ? reject(stderr) : resolve(stdout);
    });
}



export const getSourceEmbeddedRulesList = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        if (import.meta.env.MODE === 'development') {
            const response = await axios.get('/data/origin/embedded_rules_list.xml');
            const xmlText = response.data; // 这是 XML 内容
            resolve(xmlText);
        } else {
            const { errno, stdout, stderr }: ExecResult = await exec("cat /data/adb/modules/MIUI_MagicWindow+/common/source/embedded_rules_list.xml");
            errno ? reject(stderr) : resolve(stdout);
        }
    });
}

export const getSourceFixedOrientationList = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        if (import.meta.env.MODE === 'development') {
            const response = await axios.get('/data/origin/fixed_orientation_list.xml');
            const xmlText = response.data; // 这是 XML 内容
            resolve(xmlText);
        } else {
            const { errno, stdout, stderr }: ExecResult = await exec("cat /data/adb/modules/MIUI_MagicWindow+/common/source/fixed_orientation_list.xml");
            errno ? reject(stderr) : resolve(stdout);
        }
    });
}

export const getCustomConfigEmbeddedRulesList = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        if (import.meta.env.MODE === 'development') {
            const response = await axios.get('/data/custom/embedded_rules_list.xml');
            const xmlText = response.data; // 这是 XML 内容
            resolve(xmlText);
        } else {
            const { errno, stdout, stderr }: ExecResult = await exec("cat /data/adb/MIUI_MagicWindow+/config/embedded_rules_list.xml");
            errno ? reject(stderr) : resolve(stdout);
        }
    });
}

export const getCustomConfigFixedOrientationList = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        if (import.meta.env.MODE === 'development') {
            const response = await axios.get('/data/custom/fixed_orientation_list.xml');
            const xmlText = response.data; // 这是 XML 内容
            resolve(xmlText);
        } else {
            const { errno, stdout, stderr }: ExecResult = await exec("cat /data/adb/MIUI_MagicWindow+/config/fixed_orientation_list.xml");
            errno ? reject(stderr) : resolve(stdout); 
        }
    });
}

export const getEmbeddedSettingConfig = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        if (import.meta.env.MODE === 'development') {
            const response = await axios.get('/data/origin/embedded_setting_config.xml');
            const xmlText = response.data; // 这是 XML 内容
            resolve(xmlText);
        } else {
            const { errno, stdout, stderr }: ExecResult = await exec("cat /data/system/users/0/embedded_setting_config.xml");
            errno ? reject(stderr) : resolve(stdout);
        }
    });
}

export const getSourceAutoUIList = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        if (import.meta.env.MODE === 'development') {
            const response = await axios.get('/data/origin/autoui_list.xml');
            const xmlText = response.data; // 这是 XML 内容
            resolve(xmlText);
        } else {
            const { errno, stdout, stderr }: ExecResult = await exec("cat /data/adb/modules/MIUI_MagicWindow+/common/source/autoui_list.xml");
            errno ? reject(stderr) : resolve(stdout);
        }
    });
}

export const getCustomConfigAutoUIList = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        if (import.meta.env.MODE === 'development') {
            const response = await axios.get('/data/custom/autoui_list.xml');
            const xmlText = response.data; // 这是 XML 内容
            resolve(xmlText);
        } else {
            const { errno, stdout, stderr }: ExecResult = await exec("cat /data/adb/MIUI_MagicWindow+/config/autoui_list.xml");
            errno ? reject(stderr) : resolve(stdout);
        }
    });
}


export const getAutoUISettingConfig = ():Promise<string> => {
    return new Promise(async (resolve, reject) => {
        if (import.meta.env.MODE === 'development') {
            const response = await axios.get('/data/origin/autoui_setting_config.xml');
            const xmlText = response.data; // 这是 XML 内容
            resolve(xmlText);
        } else {
            const { errno, stdout, stderr }: ExecResult = await exec("cat /data/system/users/0/autoui_setting_config.xml");
            errno ? reject(stderr) : resolve(stdout);
        }
    });
}