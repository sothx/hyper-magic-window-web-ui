// @ts-ignore
import { exec, spawn, fullScreen, toast } from 'kernelsu';
import type EmbeddedRuleItem from "@/types/EmbeddedRuleItem";
import type FixedOrientationRuleItem from "@/types/FixedOrientationRuleItem";
import type EmbeddedSettingRuleItem from "@/types/EmbeddedSettingRuleItem";
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

export interface updateEmbeddedAppParams {
    customEmbeddedRulesListXML: string;
    customFixedOrientationListXML: string;
    settingConfigXML: string;
    switchAction?: {
        name: string;
        action: 'enable' | 'disable';
    };
}

export interface updateEmbeddedAppErrorLoggingItem {
    type: string;
    name: string;
    message: string | string[];
}

export interface updateEmbeddedAppSuccessLoggingItem {
    type: string;
    name: string;
    message: string | string[];
} 

export const updateEmbeddedApp = (params: updateEmbeddedApp): Promise<{
    type: 'success' | 'error';  // 操作的类型，成功或错误
    message: string;             // 操作的消息
    errorLogging?: updateEmbeddedAppErrorLoggingItem[]; // 错误日志记录
    successLogging?: updateEmbeddedAppSuccessLoggingItem[]; // 成功日志记录
}> => {
    return new Promise(async (resolve, reject) => {
        if (import.meta.env.MODE === 'development') {
            resolve({
                type: 'success',
                message: '更新成功',
                errorLogging: [],
                successLogging: [] // 返回一个空的成功日志
            });
        } else {
            const errorLogging: updateEmbeddedAppErrorLoggingItem[] = [];
            const successLogging: updateEmbeddedAppSuccessLoggingItem[] = [];

            const { errno: EmErrno, stdout: EmStdout, stderr: EmStderr }: ExecResult = await exec(`echo '${params.customEmbeddedRulesListXML}' > /data/adb/MIUI_MagicWindow+/config/embedded_rules_list.xml`);
            if (EmErrno) {
                errorLogging.push({
                    type: 'customEmbeddedRulesListXML',
                    name: '[自定义规则]平行窗口配置文件',
                    message: EmStderr
                });
            } else {
                successLogging.push({
                    type: 'customEmbeddedRulesListXML',
                    name: '[自定义规则]平行窗口配置文件',
                    message: '更新成功'
                });
            }

            const { errno: FixErrno, stdout: FixStdout, stderr: FixStderr }: ExecResult = await exec(`echo '${params.customFixedOrientationListXML}' > /data/adb/MIUI_MagicWindow+/config/fixed_orientation_list.xml`);
            if (FixErrno) {
                errorLogging.push({
                    type: 'customFixedOrientationListXML',
                    name: '[自定义规则]信箱模式配置文件',
                    message: FixStderr
                });
            } else {
                successLogging.push({
                    type: 'customFixedOrientationListXML',
                    name: '[自定义规则]信箱模式配置文件',
                    message: '更新成功'
                });
            }

            const { errno: SettingsErrno, stdout: SettingsStdout, stderr: SettingsStderr }: ExecResult = await exec(`echo '${params.settingConfigXML}' > /data/system/users/0/embedded_setting_config.xml`);
            if (SettingsErrno) {
                errorLogging.push({
                    type: 'settingConfigXML',
                    name: '[模块]应用横屏布局配置文件',
                    message: SettingsStderr
                });
            } else {
                successLogging.push({
                    type: 'settingConfigXML',
                    name: '[模块]应用横屏布局配置文件',
                    message: '更新成功'
                });
            }

            const { errno: UpdateRuleErrno, stdout: UpdateRuleStdout, stderr: UpdateRuleStderr }: ExecResult = await exec(`sh /data/adb/modules/MIUI_MagicWindow+/common/source/update_rule/update_rule.sh`);
            if (UpdateRuleErrno) {
                errorLogging.push({
                    type: 'updateMiuiEmbeddingWindowRule',
                    name: '[模块]重新载入模块应用横屏布局规则',
                    message: UpdateRuleStderr
                });
            } else {
                successLogging.push({
                    type: 'updateMiuiEmbeddingWindowRule',
                    name: '[模块]重新载入模块应用横屏布局配置文件',
                    message: UpdateRuleStdout.split('\n')
                });
            }

            if (params.switchAction) {
                const { errno: SwitchActionErrno, stdout: SwitchActionStdout, stderr: SwitchActionStderr }: ExecResult = await exec(`cmd miui_embedding_window ${params.switchAction.action} ${params.switchAction.name}`);
                if (SwitchActionErrno) {
                    errorLogging.push({
                        type: 'updateMiuiEmbeddingWindowSwitchAction',
                        name: `[模块]更新${params.switchAction.action}的设置`,
                        message: SwitchActionStderr
                    });
                } else {
                    successLogging.push({
                        type: 'updateMiuiEmbeddingWindowSwitchAction',
                        name: `[模块]更新${params.switchAction.action}的设置`,
                        message: `更新成功`
                    });
                }
            }

            if (errorLogging.length) {
                reject({
                    type: 'error',
                    message: '发生错误,提交失败',
                    errorLogging, // 返回错误日志
                    successLogging
                });
            } else {
                resolve({
                    type: 'success',
                    message: '更新成功',
                    errorLogging,
                    successLogging, // 返回成功日志
                });
            }
        }
    });
}