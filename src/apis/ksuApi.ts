import {
  exec,
  spawn,
  fullScreen,
  toast,
  moduleInfo,
  type ExecResults,
} from "@/utils/kernelsu/index.js";
import axios from "axios";
import handlePromiseWithLogging from "@/utils/handlePromiseWithLogging";

export interface SmartFocusIOResult extends ExecResults {
  stdout: "on" | "off";
}

export interface AndroidAppPackageJobsResult extends Omit<ExecResults, 'stdout'> {
  stdout: number;
}


export const getDeviceCharacteristics = (): Promise<string> => {
  const shellCommon = `getprop ro.build.characteristics`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      resolve("tablet");
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        shellCommon
      );
      errno ? reject(stderr) : resolve(stdout);
    }
  }), shellCommon);
};

export const getAndroidTargetSdk = (): Promise<number> => {
  const shellCommon = `getprop ro.build.version.sdk`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      resolve(34);
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        shellCommon
      );
      errno ? reject(stderr) : resolve(Number(stdout));
    }
  }), shellCommon);
};

export const getMIOSVersion = (): Promise<number> => {
  const shellCommon = `getprop ro.mi.os.version.code`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      resolve(1);
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        shellCommon
      );
      errno ? reject(stderr) : resolve(Number(stdout));
    }
  }), shellCommon);
};

export const getSmartFocusIO = (): Promise<SmartFocusIOResult["stdout"]> => {
  const shellCommon = `getprop persist.sys.stability.smartfocusio`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      resolve("on");
    } else {
      const { errno, stdout, stderr }: SmartFocusIOResult = (await exec(
        shellCommon
      )) as SmartFocusIOResult;
      errno ? reject(stderr) : resolve(stdout);
    }
  }), shellCommon);
};

export const getDeviceSocName = (): Promise<string> => {
  const shellCommon = `getprop ro.vendor.qti.soc_name`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      resolve("cape");
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        shellCommon
      );
      errno ? reject(stderr) : resolve(stdout);
    }
  }), shellCommon);
};

export const getDeviceSocModel = (): Promise<string> => {
  const shellCommon = `getprop ro.vendor.qti.soc_model`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      resolve("SM8475");
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        shellCommon
      );
      errno ? reject(stderr) : resolve(stdout);
    }
  }), shellCommon);
};

export const getMiuiCompatEnable = (): Promise<string> => {
  const shellCommon = `getprop ro.config.miui_compat_enable`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      resolve('true');
    } else {
      const { errno, stdout, stderr }: ExecResults = (await exec(
        shellCommon
      )) as unknown as ExecResults;
      errno ? reject(stderr) :  resolve(stdout);
    }
  }), shellCommon);
};

export const getMiuiAppCompatEnable = (): Promise<string> => {
  const shellCommon = `getprop ro.config.miui_appcompat_enable`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      resolve('true');
    } else {
      const { errno, stdout, stderr }: ExecResults = (await exec(
        shellCommon
      )) as unknown as ExecResults;
      errno ? reject(stderr) : resolve(stdout);
    }
  }), shellCommon);
};

export const getSourceEmbeddedRulesList = (): Promise<string> => {
  const shellCommon = `cat /data/adb/modules/MIUI_MagicWindow+/common/source/embedded_rules_list.xml`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      const response = await axios.get("/data/origin/embedded_rules_list.xml");
      const xmlText = response.data; // 这是 XML 内容
      resolve(xmlText);
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        shellCommon
      );
      errno ? reject(stderr) : resolve(stdout);
    }
  }), shellCommon);
};

export const getSourceFixedOrientationList = (): Promise<string> => {
  const shellCommon = `cat /data/adb/modules/MIUI_MagicWindow+/common/source/fixed_orientation_list.xml`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      const response = await axios.get(
        "/data/origin/fixed_orientation_list.xml"
      );
      const xmlText = response.data; // 这是 XML 内容
      resolve(xmlText);
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        shellCommon
      );
      errno ? reject(stderr) : resolve(stdout);
    }
  }), shellCommon);
};

export const getCustomConfigEmbeddedRulesList = (): Promise<string> => {
  const shellCommon = `cat /data/adb/MIUI_MagicWindow+/config/embedded_rules_list.xml`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      const response = await axios.get("/data/custom/embedded_rules_list.xml");
      const xmlText = response.data; // 这是 XML 内容
      resolve(xmlText);
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        shellCommon
      );
      errno ? reject(stderr) : resolve(stdout);
    }
  }), shellCommon);
};

export const getCustomConfigFixedOrientationList = (): Promise<string> => {
  const shellCommon = `cat /data/adb/MIUI_MagicWindow+/config/fixed_orientation_list.xml`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      const response = await axios.get(
        "/data/custom/fixed_orientation_list.xml"
      );
      const xmlText = response.data; // 这是 XML 内容
      resolve(xmlText);
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        shellCommon
      );
      errno ? reject(stderr) : resolve(stdout);
    }
  }), shellCommon);
};

export const getEmbeddedSettingConfig = (): Promise<string> => {
  const shellCommon = `cat /data/system/users/0/embedded_setting_config.xml`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      const response = await axios.get(
        "/data/origin/embedded_setting_config.xml"
      );
      const xmlText = response.data; // 这是 XML 内容
      resolve(xmlText);
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        "cat /data/system/users/0/embedded_setting_config.xml"
      );
      errno ? reject(stderr) : resolve(stdout);
    }
  }), shellCommon);
};

export const getSourceAutoUIList = (): Promise<string> => {
  const shellCommon = `cat /data/adb/modules/MIUI_MagicWindow+/common/source/autoui_list.xml`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      const response = await axios.get("/data/origin/autoui_list.xml");
      const xmlText = response.data; // 这是 XML 内容
      resolve(xmlText);
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        shellCommon
      );
      errno ? reject(stderr) : resolve(stdout);
    }
  }), shellCommon);
};

export const getCustomConfigAutoUIList = (): Promise<string> => {
  const shellCommon = `cat /data/adb/MIUI_MagicWindow+/config/autoui_list.xml`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      const response = await axios.get("/data/custom/autoui_list.xml");
      const xmlText = response.data; // 这是 XML 内容
      resolve(xmlText);
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        shellCommon
      );
      errno ? reject(stderr) : resolve(stdout);
    }
  }), shellCommon);
};


export const getAutoUISettingConfig = (): Promise<string> => {
  const shellCommon = `cat /data/system/users/0/autoui_setting_config.xml`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      const response = await axios.get(
        "/data/origin/autoui_setting_config.xml"
      );
      const xmlText = response.data; // 这是 XML 内容
      resolve(xmlText);
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        shellCommon
      );
      errno ? reject(stderr) : resolve(stdout);
    }
  }), shellCommon);
};

export const openGameModeManager = (): Promise<string> => {
  const shellCommon = `am start -n com.miui.securitycenter/com.miui.gamebooster.gamemode.GameModeSettingsActivity`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      resolve(`Starting: Intent { cmp=com.miui.securitycenter/com.miui.gamebooster.gamemode.GameModeSettingsActivity }`);
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        shellCommon
      );
      errno ? reject(stderr) : resolve(stdout);
    }
  }), shellCommon);
};

export const getHasInstalledMIUIContentExtension = (): Promise<string> => {
  const shellCommon = `test -f /system/product/priv-app/MIUIContentExtension/MIUIContentExtension.apk && echo "exists" || echo "not exists"`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      resolve(`exists`);
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        shellCommon
      );
      errno ? reject(stderr) : stdout === 'exists' ? resolve(stdout) : reject(stdout);
    }
  }), shellCommon);
}

export const openMIUIContentExtension = (): Promise<string> => {
  const shellCommon = `am start -n com.miui.contentextension/.setting.activity.MainSettingsActivity`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      resolve(`Starting: Intent { cmp=com.miui.contentextension/.setting.activity.MainSettingsActivity }`);
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        shellCommon
      );
      errno ? reject(stderr) : resolve(stdout);
    }
  }), shellCommon);
};

export const rebootDevice = (): Promise<string> => {
  const shellCommon = `reboot && echo "Reboot command executed successfully." || echo "Reboot command failed."`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      resolve(`Reboot command executed successfully.`);
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        shellCommon
      );
      errno ? reject(stderr) : stdout === 'Reboot command executed successfully.' ? resolve(stdout) : reject(stdout);
    }
  }), shellCommon);
}

export const deleteGameMode = (): Promise<string> => {
  const shellCommon = `sed -i '/^# 开启游戏显示布局/d; /^ro.config.miui_compat_enable=/d; /^ro.config.miui_appcompat_enable=/d' /data/adb/modules/MIUI_MagicWindow+/system.prop  && echo "Command executed successfully." || echo "Command failed."`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      resolve(`Command executed successfully.`);
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        shellCommon
      );
      errno ? reject(stderr) :  stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
    }
  }), shellCommon);
}

export const addGameMode = (): Promise<string> => {
  const shellCommon = `grep -qxF "# 开启游戏显示布局" system.prop || echo -e "# 开启游戏显示布局\nro.config.miui_compat_enable=true\nro.config.miui_appcompat_enable=true" >> /data/adb/modules/MIUI_MagicWindow+/system.prop  && echo "Command executed successfully." || echo "Command failed."`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      resolve(`Command executed successfully.`);
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        shellCommon
      );
      errno ? reject(stderr) :  stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
    }
  }), shellCommon);
}

export const getModuleInfo = (): Promise<string> => {
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    const response = JSON.stringify({
      moduleDir: "/data/adb/modules/MIUI_MagicWindow+",
      id: "MIUI_MagicWindow+",
    });
    if (import.meta.env.MODE === "development") {
      resolve(response);
    } else {
      resolve(response);
    }
  }), 'getModuleInfo');
};

interface AppInfo {
  packageName: string;
  appName: string;
}

export const getUserAppList = (): Promise<string> => {
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      const response = await axios.get("/data/test.json");
      const jsonText = response.data; // 这是 XML 内容
      resolve(jsonText);
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        "cat /data/system/users/0/autoui_setting_config.xml"
      );
      errno ? reject(stderr) : resolve(stdout);
    }
  }), 'getUserAppList');
};

export const reboot = (): Promise<string> => {
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      const response = await axios.get("/data/test.json");
      const jsonText = response.data; // 这是 XML 内容
      resolve(jsonText);
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        "cat /data/system/users/0/autoui_setting_config.xml"
      );
      errno ? reject(stderr) : resolve(stdout);
    }
  }), 'getUserAppList');
};


export interface updateEmbeddedAppParams {
  customEmbeddedRulesListXML: string;
  customFixedOrientationListXML: string;
  settingConfigXML: string;
  switchAction?: {
    name: string;
    action: "enable" | "disable";
  };
  reloadRuleAction?: {
    name: string;
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

export const updateEmbeddedApp = (
  params: updateEmbeddedAppParams
): Promise<{
  type: "success" | "error"; // 操作的类型，成功或错误
  message: string; // 操作的消息
  errorLogging?: updateEmbeddedAppErrorLoggingItem[]; // 错误日志记录
  successLogging?: updateEmbeddedAppSuccessLoggingItem[]; // 成功日志记录
}> => {
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      resolve({
        type: "success",
        message: "更新成功",
        errorLogging: [],
        successLogging: [], // 返回一个空的成功日志
      });
    } else {
      const errorLogging: updateEmbeddedAppErrorLoggingItem[] = [];
      const successLogging: updateEmbeddedAppSuccessLoggingItem[] = [];

      const {
        errno: EmErrno,
        stdout: EmStdout,
        stderr: EmStderr,
      }: ExecResults = await exec(
        `echo '${params.customEmbeddedRulesListXML}' > /data/adb/MIUI_MagicWindow+/config/embedded_rules_list.xml`
      );
      if (EmErrno) {
        errorLogging.push({
          type: "customEmbeddedRulesListXML",
          name: "[自定义规则]平行窗口配置文件",
          message: EmStderr,
        });
      } else {
        successLogging.push({
          type: "customEmbeddedRulesListXML",
          name: "[自定义规则]平行窗口配置文件",
          message: "更新成功",
        });
      }

      const {
        errno: FixErrno,
        stdout: FixStdout,
        stderr: FixStderr,
      }: ExecResults = await exec(
        `echo '${params.customFixedOrientationListXML}' > /data/adb/MIUI_MagicWindow+/config/fixed_orientation_list.xml`
      );
      if (FixErrno) {
        errorLogging.push({
          type: "customFixedOrientationListXML",
          name: "[自定义规则]信箱模式配置文件",
          message: FixStderr,
        });
      } else {
        successLogging.push({
          type: "customFixedOrientationListXML",
          name: "[自定义规则]信箱模式配置文件",
          message: "更新成功",
        });
      }

      const {
        errno: SettingsErrno,
        stdout: SettingsStdout,
        stderr: SettingsStderr,
      }: ExecResults = await exec(
        `echo '${params.settingConfigXML}' > /data/system/users/0/embedded_setting_config.xml`
      );
      if (SettingsErrno) {
        errorLogging.push({
          type: "settingConfigXML",
          name: "[模块]应用横屏布局配置文件",
          message: SettingsStderr,
        });
      } else {
        successLogging.push({
          type: "settingConfigXML",
          name: "[模块]应用横屏布局配置文件",
          message: "更新成功",
        });
      }

      const {
        errno: UpdateRuleErrno,
        stdout: UpdateRuleStdout,
        stderr: UpdateRuleStderr,
      }: ExecResults = await exec(
        `sh /data/adb/modules/MIUI_MagicWindow+/common/source/update_rule/update_rule.sh`
      );
      if (UpdateRuleErrno) {
        errorLogging.push({
          type: "updateMiuiEmbeddingWindowRule",
          name: "[模块]重新载入模块应用横屏布局规则",
          message: UpdateRuleStderr,
        });
      } else {
        successLogging.push({
          type: "updateMiuiEmbeddingWindowRule",
          name: "[模块]重新载入模块应用横屏布局配置文件",
          message: UpdateRuleStdout.split("\n"),
        });
      }

      if (params.switchAction) {
        const {
          errno: SwitchActionErrno,
          stdout: SwitchActionStdout,
          stderr: SwitchActionStderr,
        }: ExecResults = await exec(
          `cmd miui_embedding_window ${params.switchAction.action} ${params.switchAction.name}`
        );
        if (SwitchActionErrno) {
          errorLogging.push({
            type: "updateMiuiEmbeddingWindowSwitchAction",
            name: `[模块]更新${params.switchAction.action}的设置`,
            message: SwitchActionStderr,
          });
        } else {
          successLogging.push({
            type: "updateMiuiEmbeddingWindowSwitchAction",
            name: `[模块]更新${params.switchAction.action}的设置`,
            message:SwitchActionStdout,
          });
        }
      }

      if (errorLogging.length) {
        reject({
          type: "error",
          message: "发生错误,提交失败",
          errorLogging, // 返回错误日志
          successLogging,
        });
      } else {
        resolve({
          type: "success",
          message: "更新成功",
          errorLogging,
          successLogging, // 返回成功日志
        });
      }
    }
  }));
};


export const getAndroidAppPackageList = (): Promise<string> => {
  const shellCommon = `cat /data/adb/modules/MIUI_MagicWindow+/common/temp/package_info.json`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      const response = await axios.get(
        "/data/origin/package_info.json"
      );
      const jsonText = response.data; // 这是 XML 内容
      resolve(jsonText);
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        shellCommon
      );
      errno ? reject(stderr) : resolve(stdout);
    }
  }), shellCommon);
};

export const reloadAndroidAppPackageList = (): Promise<string> => {
  const shellCommon = `(sh /data/adb/modules/MIUI_MagicWindow+/service.sh > /dev/null 2>&1 & echo $!)`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      resolve('27455');
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        shellCommon
      );
      errno ? reject(stderr) : !isNaN(Number(stdout)) ? resolve(String(stdout)) : reject(stdout);
    }
  }), shellCommon);
};

export const readAndroidPackageShellJobs = (id: number): Promise<string> => {
  const shellCommon = `ps | grep ${id}`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      const response = await axios.get(
        "/data/origin/package_info.json"
      );
      const jsonText = response.data; // 这是 XML 内容
      resolve(jsonText);
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        shellCommon
      );
      errno ? reject(stderr) : resolve(stdout);
    }
  }), shellCommon);
}

export const getRootManagerInfo = () : Promise<string> => {
  const shellCommon = `echo "$KSU,$KSU_VER,$KSU_VER_CODE,$KSU_KERNEL_VER_CODE,$APATCH,$APATCH_VER_CODE,$APATCH_VER,$MAGISK_VER,$MAGISK_VER_CODE"`
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      resolve('false,v0.4.0,10672,10672,true,10672,10672,27.0,27000');
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        shellCommon
      );
      errno ? reject(stderr) : resolve(stdout);
    }
  }), shellCommon);
}

export interface updateAutoUIAppErrorLoggingItem {
  type: string;
  name: string;
  message: string | string[];
}

export interface updateAutoUIAppSuccessLoggingItem {
  type: string;
  name: string;
  message: string | string[];
}

export interface updateAutoUIAppParams {
  customAutoUIListXML: string;
  settingConfigXML: string;
  reloadRuleAction?: {
    name: string;
    action: "enable" | "disable";
  };
}



export const updateAutoUIApp = (
  params: updateAutoUIAppParams
): Promise<{
  type: "success" | "error"; // 操作的类型，成功或错误
  message: string; // 操作的消息
  errorLogging?: updateAutoUIAppErrorLoggingItem[]; // 错误日志记录
  successLogging?: updateAutoUIAppSuccessLoggingItem[]; // 成功日志记录
}> => {
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      resolve({
        type: "success",
        message: "更新成功",
        errorLogging: [],
        successLogging: [], // 返回一个空的成功日志
      });
    } else {
      const errorLogging: updateAutoUIAppErrorLoggingItem[] = [];
      const successLogging: updateAutoUIAppSuccessLoggingItem[] = [];

      const {
        errno: EmErrno,
        stdout: EmStdout,
        stderr: EmStderr,
      }: ExecResults = await exec(
        `echo '${params.customAutoUIListXML}' > /data/adb/MIUI_MagicWindow+/config/autoui_list.xml`
      );
      if (EmErrno) {
        errorLogging.push({
          type: "customAutoUIListXML",
          name: "[自定义规则]应用布局优化配置文件",
          message: EmStderr,
        });
      } else {
        successLogging.push({
          type: "customAutoUIListXML",
          name: "[自定义规则]应用布局优化配置文件",
          message: "更新成功",
        });
      }

      const {
        errno: SettingsErrno,
        stdout: SettingsStdout,
        stderr: SettingsStderr,
      }: ExecResults = await exec(
        `echo '${params.settingConfigXML}' > /data/system/users/0/autoui_setting_config.xml`
      );
      if (SettingsErrno) {
        errorLogging.push({
          type: "settingConfigXML",
          name: "[模块]应用布局优化配置文件",
          message: SettingsStderr,
        });
      } else {
        successLogging.push({
          type: "settingConfigXML",
          name: "[模块]应用布局优化配置文件",
          message: "更新成功",
        });
      }

      const {
        errno: UpdateRuleErrno,
        stdout: UpdateRuleStdout,
        stderr: UpdateRuleStderr,
      }: ExecResults = await exec(
        `sh /data/adb/modules/MIUI_MagicWindow+/common/source/update_rule/update_rule.sh`
      );
      if (UpdateRuleErrno) {
        errorLogging.push({
          type: "updateMiuiEmbeddingWindowRule",
          name: "[模块]重新载入模块应用布局优化规则",
          message: UpdateRuleStderr,
        });
      } else {
        successLogging.push({
          type: "updateMiuiEmbeddingWindowRule",
          name: "[模块]重新载入模块应用布局优化规则",
          message: UpdateRuleStdout.split("\n"),
        });
      }

      if (params.reloadRuleAction) {
        const {
          errno: ReloadActionErrno,
          stdout: SwitchActionStdout,
          stderr: ReloadActionStderr,
        }: ExecResults = await exec(
          `cmd miui_auto_ui ${params.reloadRuleAction.action} ${params.reloadRuleAction.name}`
        );
  
        if (ReloadActionErrno) {
          errorLogging.push({
            type: "updateMiuiAutoUIReloadAction",
            name: `[模块]更新${params.reloadRuleAction.name}的设置`,
            message: ReloadActionStderr,
          });
        } else {
          successLogging.push({
            type: "updateMiuiAutoUIReloadAction",
            name: `[模块]更新${params.reloadRuleAction.name}的设置`,
            message: SwitchActionStdout,
          });
        }
      }


      if (errorLogging.length) {
        reject({
          type: "error",
          message: "发生错误,提交失败",
          errorLogging, // 返回错误日志
          successLogging,
        });
      } else {
        resolve({
          type: "success",
          message: "更新成功",
          errorLogging,
          successLogging, // 返回成功日志
        });
      }
    }
  }));
};