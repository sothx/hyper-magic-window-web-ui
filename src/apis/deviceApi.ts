import { exec, spawn, fullScreen, toast, type ExecResults } from '@/utils/kernelsu/index.js';
import axios from 'axios';
import handlePromiseWithLogging from '@/utils/handlePromiseWithLogging';
import $to from 'await-to-js';
import { useDeviceStore } from '@/stores/device';
import type { KeyboardMode, PenEnable, PenUpdate } from '@/hooks/useAmktiao';
import type { DisplayModeItem } from '@/hooks/useDisplayModeRecord';
import type { miuiCursorStyleType } from '@/hooks/useMiuiCursorStyle';
const toolsFunc = `/data/adb/modules/MIUI_MagicWindow+/common/utils/tools_functions.sh`;

export interface SmartFocusIOResult extends ExecResults {
	stdout: 'on' | 'off';
}

export interface ModuleUpdateInfo {
	changelog: string;
	version: string;
	versionCode: number;
	zipUrl: string;
	chinaMobileMCloudUrl: string;
}

export interface AndroidAppPackageJobsResult extends Omit<ExecResults, 'stdout'> {
	stdout: number;
}

export const getDeviceCharacteristics = (): Promise<string> => {
	const shellCommon = `getprop ro.build.characteristics`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve('tablet');
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getMuiltdisplayType = (): Promise<string> => {
	const shellCommon = `getprop persist.sys.muiltdisplay_type`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve('');
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getAndroidTargetSdk = (): Promise<number> => {
	const shellCommon = `getprop ro.build.version.sdk`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(35);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(Number(stdout));
			}
		}),
		shellCommon,
	);
};

export const getMIOSVersion = (): Promise<number> => {
	const shellCommon = `getprop ro.mi.os.version.code`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(2);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(Number(stdout));
			}
		}),
		shellCommon,
	);
};

export const getDeviceSocName = (): Promise<string> => {
	const shellCommon = `getprop ro.vendor.qti.soc_name`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve('cape');
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getDeviceSocModel = (): Promise<string> => {
	const shellCommon = `getprop ro.vendor.qti.soc_model`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve('SM8475');
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getMiuiCompatEnable = (): Promise<string> => {
	const shellCommon = `getprop ro.config.miui_compat_enable`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve('true');
			} else {
				const { errno, stdout, stderr }: ExecResults = (await exec(shellCommon)) as unknown as ExecResults;
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getMiuiAppCompatEnable = (): Promise<string> => {
	const shellCommon = `getprop ro.config.miui_appcompat_enable`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve('true');
			} else {
				const { errno, stdout, stderr }: ExecResults = (await exec(shellCommon)) as unknown as ExecResults;
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getModuleInfo = (): Promise<string> => {
	const shellCommon = `cat /data/adb/modules/MIUI_MagicWindow+/module.prop`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(
					`id=MIUI_MagicWindow+\nname=HyperOS 完美横屏应用计划\nversion=pad-ext-2.04.26.beta\nversionCode=204026\nauthor=御坂初琴、做梦书、柚稚的孩纸 等\ndescription=[★适配应用总数:8365] 适用于HyperOS For Pad，用于扩展应用横屏布局、应用布局优化和游戏显示布局的支持范围并优化适配体验，支持[自定义规则]扩充或覆盖部分应用适配。当前刷入的是[自用版]，此版本仅供模块作者使用，含有大量测试用途的代码，误装容易造成卡米。(下载正式版可前往酷安动态 @做梦书 ，模块首页:https://hyper-magic-window.sothx.com，GitHub仓库:https://github.com/sothx/mipad-magic-window，模块Q群:277757185，如需卸载模块请移除模块后重启平板)\nupdateJson=https://hyper-magic-window-module-update.sothx.com/release/V10/pad.json`,
				);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const addIsPatchMode = (): Promise<string> => {
	const shellCommon = `grep -q '^is_patch_mode=' /data/adb/MIUI_MagicWindow+/config.prop || (source ${toolsFunc} && add_lines "is_patch_mode=true" /data/adb/MIUI_MagicWindow+/config.prop && echo "Command executed successfully." || echo "Command failed.")`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const removeIsPatchMode = (): Promise<string> => {
	const shellCommon = `sed -i '/^is_patch_mode=/d' //data/adb/MIUI_MagicWindow+/config.prop && echo "Remove is_patch_mode successfully." || echo "Remove is_patch_mode failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Remove is_patch_mode successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getIsPatchMode = (): Promise<string> => {
	const shellCommon = `grep 'is_patch_mode=' /data/adb/MIUI_MagicWindow+/config.prop | awk -F'=' '{print $2}'`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`false`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const addIsDeepPatchMode = (): Promise<string> => {
	const shellCommon = `grep -q '^is_deep_patch_mode=' /data/adb/MIUI_MagicWindow+/config.prop || (source ${toolsFunc} && add_lines "is_deep_patch_mode=true=true" /data/adb/MIUI_MagicWindow+/config.prop && echo "Command executed successfully." || echo "Command failed.")`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const removeIsDeepPatchMode = (): Promise<string> => {
	const shellCommon = `sed -i '/^is_deep_patch_mode=/d' //data/adb/MIUI_MagicWindow+/config.prop && echo "Remove is_deep_patch_mode successfully." || echo "Remove is_deep_patch_mode failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Remove is_deep_patch_mode successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getIsDeepPatchMode = (): Promise<string> => {
	const shellCommon = `grep 'is_deep_patch_mode=' /data/adb/MIUI_MagicWindow+/config.prop | awk -F'=' '{print $2}'`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`false`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const addIsDisabledOS2SystemAppOptimize = (): Promise<string> => {
	const shellCommon = `grep -q '^is_disabled_os2_system_app_optimize=' /data/adb/MIUI_MagicWindow+/config.prop || (source ${toolsFunc} && add_lines "is_disabled_os2_system_app_optimize=true" /data/adb/MIUI_MagicWindow+/config.prop && echo "Command executed successfully." || echo "Command failed.")`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const removeIsDisabledOS2SystemAppOptimize = (): Promise<string> => {
	const shellCommon = `sed -i '/^is_disabled_os2_system_app_optimize=/d' //data/adb/MIUI_MagicWindow+/config.prop && echo "Remove is_disabled_os2_system_app_optimize successfully." || echo "Remove is_disabled_os2_system_app_optimize failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Remove is_disabled_os2_system_app_optimize successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getIsDisabledOS2SystemAppOptimize = (): Promise<string> => {
	const shellCommon = `grep 'is_disabled_os2_system_app_optimize=' /data/adb/MIUI_MagicWindow+/config.prop | awk -F'=' '{print $2}'`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`false`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const addDisplayModeRecordAutoEnableID = (id: number): Promise<string> => {
	const shellCommon = `grep -q '^display_mode_record_auto_enable_id=' /data/adb/MIUI_MagicWindow+/config.prop || (source ${toolsFunc} && add_lines "display_mode_record_auto_enable_id=${id}" /data/adb/MIUI_MagicWindow+/config.prop && echo "Command executed successfully." || echo "Command failed.")`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const removeDisplayModeRecordAutoEnableID = (): Promise<string> => {
	const shellCommon = `sed -i '/^display_mode_record_auto_enable_id=/d' //data/adb/MIUI_MagicWindow+/config.prop && echo "Remove display_mode_record_auto_enable_id successfully." || echo "Remove display_mode_record_auto_enable_id failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Remove display_mode_record_auto_enable_id successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getDisplayModeRecordAutoEnableID = (): Promise<string> => {
	const shellCommon = `grep 'display_mode_record_auto_enable_id=' /data/adb/MIUI_MagicWindow+/config.prop | awk -F'=' '{print $2}'`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(``);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const deleteGameMode = (): Promise<string> => {
	const shellCommon = `sed -i '/^ro.config.miui_compat_enable=/d' //data/adb/modules/MIUI_MagicWindow+/system.prop && echo "Remove ro.config.miui_compat_enable successfully." || echo "Remove ro.config.miui_compat_enable failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Remove ro.config.miui_compat_enable successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'Remove ro.config.miui_compat_enable successfully.' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const getGameMode = (): Promise<string> => {
	const shellCommon = `grep 'ro.config.miui_compat_enable=' /data/adb/modules/MIUI_MagicWindow+/system.prop | awk -F'=' '{print $2}'`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`true`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const addGameMode = (): Promise<string> => {
	const shellCommon = `grep -q '^ro.config.miui_compat_enable=' /data/adb/modules/MIUI_MagicWindow+/system.prop || (source ${toolsFunc} && add_lines "ro.config.miui_compat_enable=true" /data/adb/modules/MIUI_MagicWindow+/system.prop && echo "Command executed successfully." || echo "Command failed.")`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const getDeviceName = (): Promise<string> => {
	const shellCommon = `settings get global device_name`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Xiaomi Pad 6 Pro`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getRotationSuggestions = (): Promise<string> => {
	const shellCommon = `settings get secure show_rotation_suggestions`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`1`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getSystemVersion = (): Promise<string> => {
	const shellCommon = `settings get global miui_version_name`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`OS1.0.10.0.UMYCNXM`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getBatterySohQcom = (): Promise<string> => {
	const shellCommon = `cat /sys/class/qcom-battery/soh`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`90`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getBatterySohMTK = (): Promise<string> => {
	const shellCommon = `cat /sys/class/power_supply/bms/soh`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`90`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getBatteryChargeFullDesign = (): Promise<string> => {
	const shellCommon = `cat /sys/class/power_supply/battery/charge_full_design`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`8600000`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getBatteryChargeFull = (): Promise<string> => {
	const shellCommon = `cat /sys/class/power_supply/battery/charge_full`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`7785000`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getBatteryCycleCount = (): Promise<string> => {
	const shellCommon = `cat /sys/class/power_supply/battery/cycle_count`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`338`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getQcomBatteryFg1RSoc = (): Promise<string> => {
	const shellCommon = `cat /sys/class/qcom-battery/fg1_rsoc`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`90`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getCapacityRaw = (): Promise<string> => {
	const shellCommon = `cat /sys/class/power_supply/bms/capacity_raw`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`9001`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getBatterySohXMPower = (): Promise<string> => {
	const shellCommon = `cat /sys/class/xm_power/fg_master/soh`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`90`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getPreSystemVersion = (): Promise<string> => {
	const shellCommon = `settings get global miui_pre_version`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`OS1.0.10.0.UMYCNXM`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const setRotationSuggestions = (mode: 1 | 0): Promise<string> => {
	const shellCommon = `settings put secure show_rotation_suggestions ${mode}`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`1`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const addIsHideGestureLine = (): Promise<string> => {
const shellCommon = `grep -q '^is_hide_gesture_line=' /data/adb/MIUI_MagicWindow+/config.prop || (source ${toolsFunc} && add_lines "is_hide_gesture_line=true" /data/adb/MIUI_MagicWindow+/config.prop && echo "Command executed successfully." || echo "Command failed.");`
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const removeIsHideGestureLine = (): Promise<string> => {
	const shellCommon = `sed -i '/^is_hide_gesture_line=/d' //data/adb/MIUI_MagicWindow+/config.prop && echo "Remove is_hide_gesture_line successfully." || echo "Remove is_hide_gesture_line failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Remove is_hide_gesture_line successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const setHideGestureLine = (mode: 1 | 0): Promise<string> => {
	const shellCommon = `settings put global hide_gesture_line ${mode}`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`1`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getHideGestureLine = (): Promise<string> => {
	const shellCommon = `settings get global hide_gesture_line`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`0`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const setInVisibleMode = (mode: 1 | 0): Promise<string> => {
	const shellCommon = `settings put secure key_invisible_mode_state ${mode}`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`1`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getInVisibleMode = (): Promise<string> => {
	const shellCommon = `settings get secure key_invisible_mode_state`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`0`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openInVisibleMode = (): Promise<string> => {
	const shellCommon = `am start -n com.miui.securitycenter/com.miui.permcenter.settings.InvisibleModeActivity`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(
					`Starting: Intent { cmp=com.miui.securitycenter/com.miui.permcenter.settings.InvisibleModeActivity }`,
				);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openCarSicknessReliefSettings = (): Promise<string> => {
	const shellCommon = `am start -n com.miui.securitycenter/com.miui.carsickness.ui.CarSicknessReliefSettingsActivity`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(
					`Starting: Intent { cmp=com.miui.securitycenter/com.miui.carsickness.ui.CarSicknessReliefSettingsActivity }`,
				);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const setMiuiCursorStyleType = (mode: 3 | 1 | 0): Promise<string> => {
	const shellCommon = `settings put system miui_cursor_style ${mode}`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`1`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getMiuiCursorStyleType = (): Promise<string> => {
	const shellCommon = `settings get system miui_cursor_style`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`3`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const setMouseGestureNaturalscroll = (mode: 1 | 0): Promise<string> => {
	const shellCommon = `settings put secure mouse_gesture_naturalscroll ${mode}`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`1`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getMouseGestureNaturalscroll = (): Promise<string> => {
	const shellCommon = `settings get secure mouse_gesture_naturalscroll`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`0`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const setHomeVideoWallpaperLoop = (): Promise<string> => {
	const shellCommon = `sed -i 's/loopVideo="false"/loopVideo="true"/g' /data/system/theme_magic/users/0/wallpaper/data/home.xml`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`success`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const setLockVideoWallpaperLoop = (): Promise<string> => {
	const shellCommon = `sed -i 's/loopVideo="false"/loopVideo="true"/g' /data/system/theme_magic/users/0/wallpaper/data/lock.xml`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`success`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const killMiWallpaper = (): Promise<string> => {
	const shellCommon = `pkill -9 -f com.miui.miwallpaper && echo "kill command executed successfully." || echo "kill command failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`kill command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno
					? reject(stderr)
					: stdout === 'kill command executed successfully.'
						? resolve(stdout)
						: reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const clearJoyose = (): Promise<string> => {
	const shellCommands = [
		'killall -9 com.xiaomi.joyose || true',
		'am force-stop com.xiaomi.joyose',
		'am kill com.xiaomi.joyose',
		'pm clear com.xiaomi.joyose >/dev/null',
		'pm enable com.xiaomi.joyose/com.xiaomi.joyose.cloud.CloudServerReceiver >/dev/null',
		'am startservice com.xiaomi.joyose/com.xiaomi.joyose.smartop.SmartOpService',
	];

	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				reject('clear command executed successfully.');
			} else {
				for (const cmd of shellCommands) {
					const { errno, stdout, stderr }: ExecResults = await exec(cmd);

					// 如果有错误，直接返回 stderr 或 stdout
					if (errno) {
						return reject(stderr || stdout || `Shell command failed: ${cmd}`);
					}
				}
				resolve('clear command executed successfully.');
			}
		}),
		shellCommands.join(' && '),
	);
};


export const setPointerSpeed = (value: number): Promise<string> => {
	const shellCommon = `settings put system pointer_speed ${value}`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`1`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getPointerSpeed = (): Promise<string> => {
	const shellCommon = `settings get system pointer_speed`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`0`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getRootManagerInfo = (): Promise<string> => {
	const shellCommon = `cat /data/adb/modules/MIUI_MagicWindow+/common/temp/root_manager_info.txt`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve('false,v0.4.0,10672,10672,true,10672,10672,27.0,27000');
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getAndroidApplicationPackageNameList = (): Promise<string> => {
	const shellCommon = `pm list packages -a | awk -F':' '{print $2}' | tr '\n' ',' | sed 's/,$/\n/'`;
	// 列出包名和UID
	//  pm list packages -U | awk -F'[: ]+' '{print $2":"$4}' | tr '\n' ',' | sed 's/,$/\n/'
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/system/app.txt');
				resolve(response.data);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getInstalledAppNameList = (): Promise<string> => {
	const shellCommon = `CLASSPATH="/data/adb/modules/MIUI_MagicWindow+/common/utils/classes.dex" app_process /system/bin com.xayah.dex.HiddenApiUtil getInstalledPackagesAsUser 0 "user" "pkgName|label"`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(
					`,com.xiaomi.scanner,小爱视觉\n,com.max.xiaoheihe,小黑盒\n,com.xingin.xhs,小红书\n,com.miui.creation,小米创作`,
				);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getHasInstalledMIUIContentExtension = (): Promise<string> => {
	const shellCommon = `ls /system/product/priv-app/MIUIContentExtension/MIUIContentExtension.apk &>/dev/null && echo "exists" || echo "not exists"`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`exists`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'exists' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const openGameModeManager = (): Promise<string> => {
	const shellCommon = `am start -n com.miui.securitycenter/com.miui.gamebooster.gamemode.GameModeSettingsActivity`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(
					`Starting: Intent { cmp=com.miui.securitycenter/com.miui.gamebooster.gamemode.GameModeSettingsActivity }`,
				);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openMIUIContentExtension = (): Promise<string> => {
	const shellCommon = `am start -n com.miui.contentextension/.setting.activity.MainSettingsActivity`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Starting: Intent { cmp=com.miui.contentextension/.setting.activity.MainSettingsActivity }`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const rebootDevice = (): Promise<string> => {
	const shellCommon = `reboot && echo "Reboot command executed successfully." || echo "Reboot command failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Reboot command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno
					? reject(stderr)
					: stdout === 'Reboot command executed successfully.'
						? resolve(stdout)
						: reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const saveLogs = (content: string, timestamp: number): Promise<string> => {
	const shellCommon = `echo "${content.replace(/"/g, '\\"')}" > /data/adb/MIUI_MagicWindow+/logs-${timestamp}.txt`;
	return new Promise(async (resolve, reject) => {
		if (import.meta.env.MODE === 'development') {
			resolve(`save command executed successfully.`);
		} else {
			const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
			errno ? reject(stderr) : resolve(`save command executed successfully.`);
		}
	});
};

export const killAndroidSystemUI = (): Promise<string> => {
	const shellCommon = `pkill -9 -f com.android.systemui && echo "kill command executed successfully." || echo "kill command failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`kill command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno
					? reject(stderr)
					: stdout === 'kill command executed successfully.'
						? resolve(stdout)
						: reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const killGameBoosterApp = (packageName: string): Promise<string> => {
	const shellCommon = `pgrep -f ${packageName} > /dev/null && kill -9 $(pgrep -f ${packageName}) || true && pgrep -f com.miui.securitycenter > /dev/null && kill -9 $(pgrep -f com.miui.securitycenter) || true && pgrep -f com.miui.securityadd > /dev/null && kill -9 $(pgrep -f com.miui.securityadd) || true && am start -n com.miui.securityadd/com.miui.gamebooster.GameBoosterRichWebActivity`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`kill command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const frameRateService = (status: 'start' | 'stop'): Promise<string> => {
	const shellCommon = `cmd activity ${status}service -n com.miui.powerkeeper/.ui.framerate.FrameRateService`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`${status}service command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

const parseDisplayModeRecords = (output: string): DisplayModeItem[] => {
	const deviceStore = useDeviceStore();
	const records: DisplayModeItem[] = [];
	const lines = output.split('\n');

	// 构建正则
	let pattern = 'id=(\\d+),\\s*width=(\\d+),\\s*height=(\\d+),\\s*fps=([\\d.]+)';
	const sdk = deviceStore.androidTargetSdk;

	if (sdk >= 35) {
		pattern +=
			',\\s*vsync=([\\d.]+),\\s*synthetic=(true|false),\\s*alternativeRefreshRates=\\[([^\\]]*)\\],\\s*supportedHdrTypes=\\[([^\\]]*)\\]';
	} else if (sdk === 34) {
		pattern += ',\\s*alternativeRefreshRates=\\[([^\\]]*)\\],\\s*supportedHdrTypes=\\[([^\\]]*)\\]';
	} else {
		pattern += ',\\s*alternativeRefreshRates=\\[([^\\]]*)\\]';
	}

	const regex = new RegExp(pattern);

	lines.forEach(line => {
		let pattern = 'id=(\\d+),\\s*width=(\\d+),\\s*height=(\\d+),\\s*fps=([\\d.]+)';

		if (deviceStore.androidTargetSdk >= 35) {
			pattern +=
				',\\s*vsync=([\\d.]+),\\s*synthetic=(true|false),\\s*alternativeRefreshRates=\\[([^\\]]*)\\],\\s*supportedHdrTypes=\\[([^\\]]*)\\]';
		} else if (deviceStore.androidTargetSdk === 34) {
			pattern += ',\\s*alternativeRefreshRates=\\[([^\\]]*)\\],\\s*supportedHdrTypes=\\[([^\\]]*)\\]';
		} else {
			pattern += ',\\s*alternativeRefreshRates=\\[([^\\]]*)\\]';
		}

		const regex = new RegExp(pattern);

		const match = regex.exec(line);

		if (match) {
			if (deviceStore.androidTargetSdk && deviceStore.androidTargetSdk >= 35) {
				const [_, id, width, height, fps, vsync, synthetic, alternativeRefreshRates, supportedHdrTypes] = match;

				const record: DisplayModeItem = {
					id: parseInt(id, 10),
					width: parseInt(width, 10),
					height: parseInt(height, 10),
					fps: parseFloat(fps),
					vsync: parseInt(vsync),
					synthetic: synthetic === 'true' ? true : false,
					alternativeRefreshRates: alternativeRefreshRates
						? alternativeRefreshRates.split(',').map(rate => parseFloat(rate.trim()))
						: [],
					supportedHdrTypes: supportedHdrTypes
						? supportedHdrTypes.split(',').map(type => parseInt(type.trim(), 10))
						: [],
				};

				records.push(record);
			} else if (deviceStore.androidTargetSdk && deviceStore.androidTargetSdk === 34) {
				const [_, id, width, height, fps, alternativeRefreshRates, supportedHdrTypes] = match;

				const record: DisplayModeItem = {
					id: parseInt(id, 10),
					width: parseInt(width, 10),
					height: parseInt(height, 10),
					fps: parseFloat(fps),
					alternativeRefreshRates: alternativeRefreshRates
						? alternativeRefreshRates.split(',').map(rate => parseFloat(rate.trim()))
						: [],
					supportedHdrTypes: supportedHdrTypes
						? supportedHdrTypes.split(',').map(type => parseInt(type.trim(), 10))
						: [],
				};

				records.push(record);
			} else {
				const [_, id, width, height, fps, alternativeRefreshRates] = match;

				const record: DisplayModeItem = {
					id: parseInt(id, 10),
					width: parseInt(width, 10),
					height: parseInt(height, 10),
					fps: parseFloat(fps),
					alternativeRefreshRates: alternativeRefreshRates
						? alternativeRefreshRates.split(',').map(rate => parseFloat(rate.trim()))
						: [],
				};

				records.push(record);
			}
		}
	});

	return records;
};

export const getDisplayModeRecord = (): Promise<DisplayModeItem[]> => {
	const shellCommon = `dumpsys display | grep 'DisplayModeRecord'`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/system/DisplayModeRecord.json');
				const jsonText = response.data;
				resolve(jsonText);
			} else {
				try {
					const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
					if (errno) {
						reject(stderr);
						return;
					}
					const parsedRecords = parseDisplayModeRecords(stdout);
					resolve(parsedRecords);
				} catch (error) {
					reject(error);
				}
			}
		}),
		shellCommon,
	);
};

export const updateRule = (targetService?: 'miui_embedding_window' | 'miui_auto_ui'): Promise<string> => {
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve('success,success');
			} else {
				const {
					errno: UpdateRuleErrno,
					stdout: UpdateRuleStdout,
					stderr: UpdateRuleStderr,
				}: ExecResults = await exec(
					`sh /data/adb/modules/MIUI_MagicWindow+/common/source/update_rule/update_rule.sh${targetService ? ` ${targetService}` : ''}`,
				);
				if (UpdateRuleErrno) {
					reject(UpdateRuleStderr);
				} else {
					resolve(UpdateRuleStdout);
				}
			}
		}),
		'updateMiuiEmbeddingWindowRule',
	);
};

export const getShamikoHasInstalled = (): Promise<string> => {
	const shellCommon = `ls -d /data/adb/shamiko/ &>/dev/null && echo "exists" || echo "not exists"`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`exists`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'exists' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const getShamikoMode = (): Promise<string> => {
	const shellCommon = `ls /data/adb/shamiko/whitelist &>/dev/null && echo "whitelist" || echo "blacklist"`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`whitelist`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const putShamikoMode = (mode: 'whitelist' | 'blacklist'): Promise<string> => {
	const shellCommon =
		mode === 'whitelist' ? `touch /data/adb/shamiko/whitelist` : 'rm -rf /data/adb/shamiko/whitelist';
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`success`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getHasPenUpdateControl = (): Promise<string> => {
	const shellCommon = `ls /sys/touchpanel/pen_update &>/dev/null && echo "exists" || echo "not exists"`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`exists`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'exists' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const getHasPenEnableControl = (): Promise<string> => {
	const shellCommon = `ls /sys/touchpanel/pen_enable &>/dev/null && echo "exists" || echo "not exists"`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`exists`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'exists' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const getHasKeyboardControl = (): Promise<string> => {
	const shellCommon = `ls /sys/touchpanel/keyboard &>/dev/null && echo "exists" || echo "not exists"`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`exists`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'exists' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const getCurrentPenUpdate = (): Promise<string> => {
	const shellCommon = `cat /sys/touchpanel/pen_update`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`0`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const putCurrentPenUpdate = (mode: PenUpdate): Promise<string> => {
	const shellCommon = `echo ${mode} > /sys/touchpanel/pen_update`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`success`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const addIsAmktiaoPenUpdate = (): Promise<string> => {
	const shellCommon = `grep -q '^is_amktiao_pen_update=' /data/adb/MIUI_MagicWindow+/config.prop || (source ${toolsFunc} && add_lines "is_amktiao_pen_update=true" /data/adb/MIUI_MagicWindow+/config.prop && echo "Command executed successfully." || echo "Command failed.");`
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const removeIsAmktiaoPenUpdate = (): Promise<string> => {
	const shellCommon = `sed -i '/^is_amktiao_pen_update=/d' //data/adb/MIUI_MagicWindow+/config.prop && echo "Remove is_amktiao_pen_update successfully." || echo "Remove is_amktiao_pen_update failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Remove is_amktiao_pen_update successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getCurrentPenEnable = (): Promise<string> => {
	const shellCommon = `cat /sys/touchpanel/pen_enable`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`0`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const putCurrentPenEnable = (mode: PenEnable): Promise<string> => {
	const shellCommon = `echo ${mode} > /sys/touchpanel/pen_enable`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`success`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const addIsAmktiaoPenEnable = (): Promise<string> => {
	const shellCommon = `grep -q '^is_amktiao_pen_enable=' /data/adb/MIUI_MagicWindow+/config.prop || (source ${toolsFunc} && add_lines "is_amktiao_pen_enable=true" /data/adb/MIUI_MagicWindow+/config.prop && echo "Command executed successfully." || echo "Command failed.");`
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const removeIsAmktiaoPenEnable = (): Promise<string> => {
	const shellCommon = `sed -i '/^is_amktiao_pen_enable=/d' //data/adb/MIUI_MagicWindow+/config.prop && echo "Remove is_amktiao_pen_enable successfully." || echo "Remove is_amktiao_pen_enable failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Remove is_amktiao_pen_enable successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getCurrentKeyboardMode = (): Promise<string> => {
	const shellCommon = `cat /sys/touchpanel/keyboard | head -n 1`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`0`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const putCurrentKeyboardMode = (mode: KeyboardMode): Promise<string> => {
	const shellCommon = `echo ${mode} > /sys/touchpanel/keyboard`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`success`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getMiuiDesktopModeEnabled = (): Promise<string> => {
	const shellCommon = `getprop ro.config.miui_desktop_mode_enabled`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`true`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const addIsAddDesktopModeEnabled = (): Promise<string> => {
	const shellCommon = `grep -q '^is_add_miui_desktop_mode_enabled=' /data/adb/MIUI_MagicWindow+/config.prop || (source ${toolsFunc} && add_lines "is_add_miui_desktop_mode_enabled=true" /data/adb/MIUI_MagicWindow+/config.prop && echo "Command executed successfully." || echo "Command failed.");`
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const removeIsAddDesktopModeEnabled = (): Promise<string> => {
	const shellCommon = `sed -i '/^is_add_miui_desktop_mode_enabled=/d' //data/adb/MIUI_MagicWindow+/config.prop && echo "Remove is_add_miui_desktop_mode_enabled successfully." || echo "Remove is_add_miui_desktop_mode_enabled failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Remove is_add_miui_desktop_mode_enabled successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const addMiuiDesktopModeEnabled = (): Promise<string> => {
	const shellCommon = `grep -q '^ro.config.miui_desktop_mode_enabled=' /data/adb/modules/MIUI_MagicWindow+/system.prop || (source ${toolsFunc} && add_lines "ro.config.miui_desktop_mode_enabled=true" /data/adb/modules/MIUI_MagicWindow+/system.prop && echo "Command executed successfully." || echo "Command failed.");`
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const removeMiuiDesktopModeEnabled = (): Promise<string> => {
	const shellCommon = `sed -i '/^ro.config.miui_desktop_mode_enabled=/d' //data/adb/modules/MIUI_MagicWindow+/system.prop && echo "Remove ro.config.miui_desktop_mode_enabled successfully." || echo "Remove ro.config.miui_desktop_mode_enabled failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Remove ro.config.miui_desktop_mode_enabled successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getCurrentMiuiDktMode = (): Promise<string> => {
	const shellCommon = `settings get system miui_dkt_mode`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`1`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export type MiuiDKTMode = 1 | 'null';

export const putCurrentMiuiDktMode = (mode: MiuiDKTMode): Promise<string> => {
	const shellCommon = `settings put system miui_dkt_mode ${mode}`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`success`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const addIsEnableShowNotificationIconNum = (): Promise<string> => {
	const shellCommon = `grep -q '^is_enable_show_notification_icon_num=' /data/adb/MIUI_MagicWindow+/config.prop || (source ${toolsFunc} && add_lines "is_enable_show_notification_icon_num=true" /data/adb/MIUI_MagicWindow+/config.prop && echo "Command executed successfully." || echo "Command failed.");`
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const removeIsEnableShowNotificationIconNum = (): Promise<string> => {
	const shellCommon = `sed -i '/^is_enable_show_notification_icon_num=/d' //data/adb/MIUI_MagicWindow+/config.prop && echo "Remove is_enable_show_notification_icon_num successfully." || echo "Remove is_enable_show_notification_icon_num failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Remove is_enable_show_notification_icon_num successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getIsEnableShowNotificationIconNum = (): Promise<string> => {
	const shellCommon = `grep 'is_enable_show_notification_icon_num=' /data/adb/MIUI_MagicWindow+/config.prop | awk -F'=' '{print $2}'`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`true`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getShowNotificationIconNum = (): Promise<string> => {
	const shellCommon = `grep 'show_notification_icon_num=' /data/adb/MIUI_MagicWindow+/config.prop | awk -F'=' '{print $2}'`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`3`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const removeShowNotificationIconNum = (): Promise<string> => {
	const shellCommon = `sed -i '/^show_notification_icon_num=/d' //data/adb/MIUI_MagicWindow+/config.prop && echo "Remove show_notification_icon_num successfully." || echo "Remove show_notification_icon_num failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Remove show_notification_icon_num successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const addShowNotificationIconNum = (num: number): Promise<string> => {
	const shellCommon = `grep -q '^show_notification_icon_num=' /data/adb/MIUI_MagicWindow+/config.prop || (source ${toolsFunc} && add_lines "show_notification_icon_num=${num}" /data/adb/MIUI_MagicWindow+/config.prop && echo "Command executed successfully." || echo "Command failed.");`
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const getCurrentStatusBarShowNotificationIcon = (): Promise<string> => {
	const shellCommon = `settings get system status_bar_show_notification_icon`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`3`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const putCurrentStatusBarShowNotificationIcon = (num: number): Promise<string> => {
	const shellCommon = `settings put system status_bar_show_notification_icon ${num}`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`success`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getMemoryInfo = (): Promise<string> => {
	const shellCommon = `cat /proc/mv`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`D: 0x06 12\nU: 0x01ad 256 HN8T15DEHKX075 A003`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getDisplay0PanelInfo = (): Promise<string> => {
	const shellCommon = `cat /sys/class/mi_display/disp-DSI-0/panel_info`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`mdss_dsi_m81_42_02_0b_dualdsi_dsc_lcd_video`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				if (errno) {
					reject(stderr);
				} else {
					if (stdout === 'null') {
						resolve('');
					}
					const stdoutArr = stdout.split('=');
					if (Array.isArray(stdoutArr) && stdoutArr.length === 2) {
						resolve(stdoutArr[1]);
					} else {
						resolve('');
					}
				}
			}
		}),
		shellCommon,
	);
};

export const setDisplayMode = (displayModeID: number): Promise<string> => {
	const shellCommon = `service call SurfaceFlinger 1035 i32 ${displayModeID}`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Result: Parcel(NULL)`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const setFpsFrameService = (status: boolean): Promise<string> => {
	const shellCommon = `service call SurfaceFlinger 1034 i32 ${status ? 1 : 0}`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Result: Parcel(NULL)`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openVoiceAssistant = (): Promise<string> => {
	const shellCommon = `am start com.miui.voiceassist/com.xiaomi.voiceassistant.CTAAlertActivity`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`am start command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openAITranslation = (): Promise<string> => {
	const shellCommon = `am startservice -n com.xiaomi.aiasst.vision/.control.translation.AiTranslateService --es from systemui.plugin.tile.aisubtitles --es floatingWindowType startAiSubtitlesWindow`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`am startservice command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openFboResultActivity = (): Promise<string> => {
	const shellCommon = `am start -n com.miui.securitycenter/com.miui.optimizecenter.storage.FboResultActivity`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`am startservice command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openMiFilm = (): Promise<string> => {
	const shellCommon = `am start -n com.miui.mediaeditor/com.miui.gallery.vlog.template2.VlogTemplateActivity`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`am start command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openBrightColors = (): Promise<string> => {
	const shellCommon = `am start 'intent://settings/#Intent;action=android.intent.action.VIEW;launchFlags=0x14400000;component=com.android.settings/.Settings$ReduceBrightColorsSettingsActivity;end'`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`am start command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openAccessibilityInversion = (): Promise<string> => {
	const shellCommon = `am start 'intent://settings/#Intent;action=android.intent.action.VIEW;launchFlags=0x14400000;component=com.android.settings/.Settings$AccessibilityInversionSettingsActivity;end'`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`am start command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openCodeDialer = (): Promise<string> => {
	const shellCommon = `am start -n com.android.phone/com.android.phone.EmergencyDialer -e shortcut "volume_down_up_three_time"`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`am start command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openManageApplicationsActivity = (): Promise<string> => {
	const shellCommon = `am start -a android.intent.action.VIEW -n com.android.settings/.RunningServices -f 0x10000000`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`am start command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openNotificationStationActivity = (): Promise<string> => {
	const shellCommon = `am start 'intent://settings/#Intent;action=android.intent.action.VIEW;launchFlags=0x14400000;component=com.android.settings/.Settings$NotificationStationActivity;end'`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`am start command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openMemorySettingsActivity = (): Promise<string> => {
	const shellCommon = `am start 'intent://settings/#Intent;action=android.intent.action.VIEW;launchFlags=0x14400000;component=com.android.settings/.Settings$MemorySettingsActivity;end'`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`am start command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openAiWallpaperList = (): Promise<string> => {
	const shellCommon = `am start 'intent://settings/#Intent;action=android.intent.action.VIEW;launchFlags=0x14400000;component=com.android.thememanager/.activity.ai.AiWallpaperListActivity;end'`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`am start command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openAiDistComputeClient = (): Promise<string> => {
	const shellCommon = `am start 'intent://settings/#Intent;action=android.intent.action.VIEW;launchFlags=0x14400000;component=com.xiaomi.aicr/.dist.client.activity.DistComputeClientActivity;end'`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`am start command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openAiDistComputeServer = (): Promise<string> => {
	const shellCommon = `am start 'intent://settings/#Intent;action=android.intent.action.VIEW;launchFlags=0x14400000;component=com.xiaomi.aicr/.dist.server.activity.DistComputeServerActivity;end'`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`am start command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openAiWallpaperGuide = (): Promise<string> => {
	const shellCommon = `am start 'intent://settings/#Intent;action=android.intent.action.VIEW;launchFlags=0x14400000;component=com.android.thememanager/.activity.AiWallpaperGuideActivity;end'`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`am start command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openAiTranslationChat = (): Promise<string> => {
	const shellCommon = `am start 'intent://settings/#Intent;action=android.intent.action.VIEW;launchFlags=0x14400000;component=com.miui.voiceassist/com.xiaomi.voiceassistant.instruction.card.translation.TranslationChatActivity;end'`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`am start command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openAiTranslationSynchronize = (): Promise<string> => {
	const shellCommon = `am start 'intent://settings/#Intent;action=android.intent.action.VIEW;launchFlags=0x14400000;component=com.miui.voiceassist/com.xiaomi.voiceassistant.instruction.card.translation.TranslationSynchronizeActivity;end'`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`am start command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openGoogleSettings = (): Promise<string> => {
	const shellCommon = `am start -n com.google.android.gms/com.google.android.gms.googlesettings.ui.GoogleSettingsActivity`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`am start command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openAutoTask = (): Promise<string> => {
	const shellCommon = `am start -n com.miui.securitycenter/com.miui.autotask.activity.TaskManagerActivity`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`am start command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openLSPosedManger = (): Promise<string> => {
	const shellCommon = `am broadcast -a android.telephony.action.SECRET_CODE -d android_secret_code://5776733 android`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`am broadcast command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openImportThemeManger = (): Promise<string> => {
	const shellCommon = `am start -n com.android.thememanager/com.android.thememanager.activity.ThemeTabActivity`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`am start command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openAllAppList = (): Promise<string> => {
	const shellCommon = `am start -n com.miui.securitycenter/com.miui.apppredict.activity.AppClassificationActivity`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`am start command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openGameEngineLauncherActivity = (): Promise<string> => {
	const shellCommon = `am start -n com.hyperos.aitoolbox/com.xiaomi.windowsgame.ui.GameEngineLauncherActivity`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`am start command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getHasGameBoosterDataBase = (): Promise<string> => {
	const shellCommon = `ls /data/data/com.miui.securitycenter/databases/gamebooster.db &>/dev/null && echo "exists" || echo "not exists"`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`exists`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'exists' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const deleteMIUIContentExtensionSettings = (): Promise<string> => {
	const sqlite3 = '/data/adb/modules/MIUI_MagicWindow+/common/utils/sqlite3';
	const GameBoosterDataBase = `/data/data/com.miui.securitycenter/databases/gamebooster.db`;
	const shellCommon = `echo "$(${sqlite3} ${GameBoosterDataBase} "DELETE FROM gamebooster_table WHERE package_name='com.miui.contentextension'; SELECT changes();")"`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`1`);
			} else {
				const { errno, stdout, stderr }: ExecResults = (await exec(shellCommon)) as unknown as ExecResults;
				if (errno) {
					reject(stderr);
				} else {
					if (stderr) {
						reject(stderr);
					}
					resolve(stdout);
				}
			}
		}),
		shellCommon,
	);
};

export const setMIUIContentExtensionAuth = (authCode: number): Promise<string> => {
	const shellCommon = `chmod ${authCode} /data/user/0/com.miui.contentextension/files/blacklistConfig`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`chmod command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getSmartFocusIOForBuild = (): Promise<SmartFocusIOResult['stdout']> => {
	const shellCommon = `source ${toolsFunc} && grep_prop persist.sys.stability.smartfocusio /system/product/etc/build.prop`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`on`);
			} else {
				const { errno, stdout, stderr }: SmartFocusIOResult = (await exec(shellCommon)) as SmartFocusIOResult;
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getPreStartProcForBuild = (): Promise<string> => {
	const shellCommon = `source ${toolsFunc} && grep_prop persist.sys.prestart.proc /system/product/etc/build.prop`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`true`);
			} else {
				const { errno, stdout, stderr }: ExecResults = (await exec(shellCommon)) as ExecResults;
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getPreStartProcForModule = (): Promise<string> => {
	const shellCommon = `source ${toolsFunc} && grep_prop persist.sys.prestart.proc /data/adb/modules/MIUI_MagicWindow+/system.prop`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`false`);
			} else {
				const { errno, stdout, stderr }: ExecResults = (await exec(shellCommon)) as ExecResults;
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const addDisabledPreStartProc = (): Promise<string> => {
	const shellCommon = `grep -q '^persist.sys.prestart.proc=' /data/adb/modules/MIUI_MagicWindow+/system.prop || (source ${toolsFunc} && add_lines "persist.sys.prestart.proc=false" /data/adb/modules/MIUI_MagicWindow+/system.prop && echo "Command executed successfully." || echo "Command failed.");`
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const removeDisabledPreStartProc = (): Promise<string> => {
	const shellCommon = `sed -i '/^persist.sys.prestart.proc=/d' //data/adb/modules/MIUI_MagicWindow+/system.prop && echo "Remove persist.sys.prestart.proc successfully." || echo "Remove persist.sys.prestart.proc failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Remove persist.sys.prestart.proc successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getDeepSleepEnableForBuild = (): Promise<string> => {
	const shellCommon = `source ${toolsFunc} && grep_prop persist.sys.deep_sleep.enable /system/product/etc/build.prop`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`true`);
			} else {
				const { errno, stdout, stderr }: ExecResults = (await exec(shellCommon)) as ExecResults;
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getDeepSleepEnableForModule = (): Promise<string> => {
	const shellCommon = `source ${toolsFunc} && grep_prop persist.sys.deep_sleep.enable /data/adb/modules/MIUI_MagicWindow+/system.prop`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`false`);
			} else {
				const { errno, stdout, stderr }: ExecResults = (await exec(shellCommon)) as ExecResults;
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const addDisabledDeepSleepEnable = (): Promise<string> => {
	const shellCommon = `grep -q '^persist.sys.deep_sleep.enable=' /data/adb/modules/MIUI_MagicWindow+/system.prop || (source ${toolsFunc} && add_lines "persist.sys.deep_sleep.enable=false" /data/adb/modules/MIUI_MagicWindow+/system.prop && echo "Command executed successfully." || echo "Command failed.");`
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const removeDisabledDeepSleepEnable = (): Promise<string> => {
	const shellCommon = `sed -i '/^persist.sys.deep_sleep.enable=/d' //data/adb/modules/MIUI_MagicWindow+/system.prop && echo "Remove persist.sys.deep_sleep.enable successfully." || echo "Remove persist.sys.deep_sleep.enable failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Remove persist.sys.deep_sleep.enable successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getSmartFocusIO = (): Promise<SmartFocusIOResult['stdout']> => {
	const shellCommon = `getprop persist.sys.stability.smartfocusio`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`on`);
			} else {
				const { errno, stdout, stderr }: SmartFocusIOResult = (await exec(shellCommon)) as SmartFocusIOResult;
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getFboEnable = (): Promise<string> => {
	const shellCommon = `getprop persist.sys.stability.miui_fbo_enable`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`true`);
			} else {
				const { errno, stdout, stderr }: ExecResults = (await exec(shellCommon)) as ExecResults;
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const setFboEnable = (): Promise<string> => {
	const shellCommon = `setprop persist.sys.stability.miui_fbo_enable true`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`true`);
			} else {
				const { errno, stdout, stderr }: ExecResults = (await exec(shellCommon)) as ExecResults;
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getFboInstalld = (): Promise<string> => {
	const shellCommon = `getprop init.svc.fbo-installd`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`running`);
			} else {
				const { errno, stdout, stderr }: ExecResults = (await exec(shellCommon)) as ExecResults;
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getFboServiceCtrl = (): Promise<string> => {
	const shellCommon = `getprop persist.sys.fboservice.ctrl`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`true`);
			} else {
				const { errno, stdout, stderr }: ExecResults = (await exec(shellCommon)) as ExecResults;
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const setFboServiceCtrl = (): Promise<string> => {
	const shellCommon = `setprop persist.sys.fboservice.ctrl true`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`true`);
			} else {
				const { errno, stdout, stderr }: ExecResults = (await exec(shellCommon)) as ExecResults;
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getIsAutoEnableFbo = (): Promise<string> => {
	const shellCommon = `grep 'is_auto_enable_fbo=' /data/adb/MIUI_MagicWindow+/config.prop | awk -F'=' '{print $2}'`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`true`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const removeIsAutoEnableFbo = (): Promise<string> => {
	const shellCommon = `sed -i '/^is_auto_enable_fbo=/d' //data/adb/MIUI_MagicWindow+/config.prop && echo "Remove is_auto_enable_fbo successfully." || echo "Remove is_auto_enable_fbo failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Remove is_auto_enable_fbo successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno
					? reject(stderr)
					: stdout === 'Remove is_auto_enable_fbo successfully.'
						? resolve(stdout)
						: reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const addIsAutoEnableFbo = (): Promise<string> => {
	const shellCommon = `grep -q '^is_auto_enable_fbo=' /data/adb/MIUI_MagicWindow+/config.prop || (source ${toolsFunc} && add_lines "is_auto_enable_fbo=true" /data/adb/MIUI_MagicWindow+/config.prop && echo "Command executed successfully." || echo "Command failed.");`
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const getIsAutoRegularlyFbo = (): Promise<string> => {
	const shellCommon = `grep 'is_auto_regularly_fbo=' /data/adb/MIUI_MagicWindow+/config.prop | awk -F'=' '{print $2}'`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`true`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const removeIsAutoRegularlyFbo = (): Promise<string> => {
	const shellCommon = `sed -i '/^is_auto_regularly_fbo=/d' //data/adb/MIUI_MagicWindow+/config.prop && echo "Remove is_auto_regularly_fbo successfully." || echo "Remove is_auto_regularly_fbo failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Remove is_auto_regularly_fbo successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno
					? reject(stderr)
					: stdout === 'Remove is_auto_regularly_fbo successfully.'
						? resolve(stdout)
						: reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const addIsAutoRegularlyFbo = (): Promise<string> => {
	const shellCommon = `grep -q '^is_auto_regularly_fbo=' /data/adb/MIUI_MagicWindow+/config.prop || (source ${toolsFunc} && add_lines "is_auto_regularly_fbo=true" /data/adb/MIUI_MagicWindow+/config.prop && echo "Command executed successfully." || echo "Command failed.");`
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const getAutoStartMiuiCursorStyleType = (): Promise<string> => {
	const shellCommon = `grep 'is_auto_start_miui_cursor_style_type=' /data/adb/MIUI_MagicWindow+/config.prop | awk -F'=' '{print $2}'`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`3`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const removeAutoStartMiuiCursorStyleType = (): Promise<string> => {
	const shellCommon = `sed -i '/^is_auto_start_miui_cursor_style_type=/d' //data/adb/MIUI_MagicWindow+/config.prop && echo "Remove is_auto_start_miui_cursor_style_type successfully." || echo "Remove is_auto_start_miui_cursor_style_type failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Remove is_auto_start_miui_cursor_style_type successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const addAutoStartMiuiCursorStyleType = (type: miuiCursorStyleType): Promise<string> => {
	const shellCommon = `grep -q '^is_auto_start_miui_cursor_style_type=' /data/adb/MIUI_MagicWindow+/config.prop || (source ${toolsFunc} && add_lines "is_auto_start_miui_cursor_style_type=${type}" /data/adb/MIUI_MagicWindow+/config.prop && echo "Command executed successfully." || echo "Command failed.");`
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const getBackingDev = (): Promise<string> => {
	const shellCommon = `cat /sys/block/zram0/backing_dev`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`/dev/block/dm-56`);
			} else {
				const { errno, stdout, stderr }: ExecResults = (await exec(shellCommon)) as ExecResults;
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getMiuiExtmDmOptEnable = (): Promise<string> => {
	const shellCommon = `getprop persist.miui.extm.dm_opt.enable`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`true`);
			} else {
				const { errno, stdout, stderr }: ExecResults = (await exec(shellCommon)) as unknown as ExecResults;
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getMiuiExtmDmOptTotalWriteBack = (): Promise<string> => {
	const shellCommon = `echo $(awk '{print int($3 * 4096 / 1024 / 1024)}' /sys/block/zram0/bd_stat)`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`5653`);
			} else {
				const { errno, stdout, stderr }: ExecResults = (await exec(shellCommon)) as unknown as ExecResults;
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getMiuiExtmDmOptTotalRead = (): Promise<string> => {
	const shellCommon = `echo $(awk '{print int($2 * 4096 / 1024 / 1024)}' /sys/block/zram0/bd_stat)`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`1503`);
			} else {
				const { errno, stdout, stderr }: ExecResults = (await exec(shellCommon)) as unknown as ExecResults;
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getMiuiExtmDmOptHasWriteBack = (): Promise<string> => {
	const shellCommon = `echo $(awk '{print int($1 * 4096 / 1024 / 1024)}' /sys/block/zram0/bd_stat)`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`2047`);
			} else {
				const { errno, stdout, stderr }: ExecResults = (await exec(shellCommon)) as unknown as ExecResults;
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getDevelopmentSettingsEnabled = (): Promise<string> => {
	const shellCommon = `settings get global development_settings_enabled`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`false`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('false') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const putDevelopmentSettingsEnabled = (type: 1 | 0): Promise<string> => {
	const shellCommon = `settings put global development_settings_enabled ${type}`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`success`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getDisabledOS2InstallModuleTips = (): Promise<string> => {
	const shellCommon = `getprop ro.sothx.disabled_os2_install_module_tips`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve('true');
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const addDisabledOS2InstallModuleTips = (): Promise<string> => {
	const shellCommon = `grep -q '^ro.sothx.disabled_os2_install_module_tips=' /data/adb/modules/MIUI_MagicWindow+/system.prop || (source ${toolsFunc} && add_lines "ro.sothx.disabled_os2_install_module_tips=true" /data/adb/modules/MIUI_MagicWindow+/system.prop && echo "Command executed successfully." || echo "Command failed.");`
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const removeDisabledOS2InstallModuleTips = (): Promise<string> => {
	const shellCommon = `sed -i '/^ro.sothx.disabled_os2_install_module_tips=/d' //data/adb/modules/MIUI_MagicWindow+/system.prop && echo "Remove ro.sothx.disabled_os2_install_module_tips successfully." || echo "Remove ro.sothx.disabled_os2_install_module_tips failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Remove ro.sothx.disabled_os2_install_module_tips successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getAutoTurnOnDisplayMode = (): Promise<string> => {
	const shellCommon = `getprop ro.sothx.auto_turn_on_display_mode`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve('1');
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const addAutoTurnOnDisplayMode = (inputType: number): Promise<string> => {
	const shellCommon = `grep -q '^ro.sothx.auto_turn_on_display_mode=' /data/adb/modules/MIUI_MagicWindow+/system.prop || (source ${toolsFunc} && add_lines "ro.sothx.auto_turn_on_display_mode=${inputType}" /data/adb/modules/MIUI_MagicWindow+/system.prop && echo "Command executed successfully." || echo "Command failed.");`
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const removeAutoTurnOnDisplayMode = (): Promise<string> => {
	const shellCommon = `sed -i '/^ro.sothx.auto_turn_on_display_mode=/d' //data/adb/modules/MIUI_MagicWindow+/system.prop && echo "Remove ro.sothx.auto_turn_on_display_mode successfully." || echo "Remove ro.sothx.auto_turn_on_display_mode failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Remove ro.sothx.auto_turn_on_display_mode successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getUFSEOLInfo = (): Promise<string> => {
	const shellCommon = `cat /sys/devices/platform/soc/1d84000.ufshc/health_descriptor/eol_info`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`0x01`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getUFSLifeTimeEstimationA = (): Promise<string> => {
	const shellCommon = `cat /sys/devices/platform/soc/1d84000.ufshc/health_descriptor/life_time_estimation_a`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`0x02`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getUFSLifeTimeEstimationB = (): Promise<string> => {
	const shellCommon = `cat /sys/devices/platform/soc/1d84000.ufshc/health_descriptor/life_time_estimation_b`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`0x01`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getUFSHealthInfo = (): Promise<string> => {
	const shellCommon = `cat /sys/devices/virtual/mi_memory/mi_memory_device/ufshcd0/dump_health_desc`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(
					`Device Descriptor[Byte offset 0x0]: bLength = 0x2d\nDevice Descriptor[Byte offset 0x1]: bDescriptorType = 0x9\nDevice Descriptor[Byte offset 0x2]: bPreEOLInfo = 0x1\nDevice Descriptor[Byte offset 0x3]: bDeviceLifeTimeEstA = 0x2\nDevice Descriptor[Byte offset 0x4]: bDeviceLifeTimeEstB = 0x1\n`,
				);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getDDRVendor = (): Promise<string> => {
	const shellCommon = `cat /sys/devices/virtual/mi_memory/mi_memory_device/ddr/ddr_vendor`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`SAMSUNG`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getHasQComDisplayBrightness = (): Promise<string> => {
	const shellCommon = `ls /sys/devices/platform/soc/ae00000.qcom,mdss_mdp/backlight/panel0-backlight/brightness &>/dev/null && echo "exists" || echo "not exists"`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`exists`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'exists' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const getHasMTKDisplayBrightness = (): Promise<string> => {
	const shellCommon = `ls /sys/devices/platform/soc/soc:mtk_leds/leds/lcd-backlight/brightness &>/dev/null && echo "exists" || echo "not exists"`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`not exists`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'exists' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const setQComDisplayBrightnessToZero = (): Promise<string> => {
	const shellCommon = `settings put system screen_brightness_mode 0 && echo 0 > /sys/devices/platform/soc/ae00000.qcom,mdss_mdp/backlight/panel0-backlight/brightness`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`success`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const setMTKDisplayBrightnessToZero = (): Promise<string> => {
	const shellCommon = `settings put system screen_brightness_mode 0 && echo 0 > /sys/devices/platform/soc/soc:mtk_leds/leds/lcd-backlight/brightness`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				reject(`error`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openChinaMobileMCloud = (): Promise<string> => {
	const shellCommon = `(pm list packages | grep -q "com.chinamobile.mcloud" && am start -n com.chinamobile.mcloud/.client.ui.logo.LogoActivity) || am start -a android.intent.action.VIEW -d "http://app.xiaomi.com/detail/6527"`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`success`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const openUrl = (url: string): Promise<string> => {
	const shellCommon = `am start -a android.intent.action.VIEW -d "${url}"`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`success`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getModuleUpdateMsg = async (url: string): Promise<ModuleUpdateInfo> => {
	return new Promise(async (resolve, reject) => {
		if (import.meta.env.MODE === 'development') {
			resolve({
				version: '9.99.99',
				versionCode: 999999,
				zipUrl: 'https://github.com/sothx/mipad-magic-window/releases/download/2.12.23/pad-ext-2.12.23.zip',
				changelog: 'https://hyper-magic-window-module-update.sothx.com/release/V10/changelog.md',
				chinaMobileMCloudUrl: 'https://caiyun.139.com/m/i?135CdgGlXeVEC',
			});
		} else {
			const [getUpdateMsgErr, getUpdateMsgRes] = await $to(axios.get(url));
			if (getUpdateMsgErr) {
				reject(getUpdateMsgErr);
			} else {
				resolve(getUpdateMsgRes.data);
			}
		}
	});
};

export const getModuleChangelog = async (url: string): Promise<string> => {
	return new Promise(async (resolve, reject) => {
		if (import.meta.env.MODE === 'development') {
			resolve(`## 更新日志-正式版

为了确保模块的稳定性，Github推送的版本通常会晚几个版本，如需获取最新版本可以前往网盘获取：

链接: [https://caiyun.139.com/m/i?135CdgGlXeVEC](https://caiyun.139.com/m/i?135CdgGlXeVEC)


本次更新内容:

- 小米平板安卓15通用版适配小米平板7 Ultra

- 小米平板安卓15专版适配小米平板6 Max OS2.0.9.0

新功能预告:

- 支持展示和切换系统支持的硬盘IO调度(未上线)

历史重要更新:

- 精选应用新增手机妙享版本下的修改版超级小爱

- 新增模块内Web UI的更新提醒弹窗，当模块存在新版本时，弹窗提示模块更新。

- 小米平板OS2专版适配 小米平板6S Pro/7/7 Pro OS2.0.200.x，低于OS2.0.200.x请切换为通用版模块，否则更新后会卡米



如果是处于测试版(Beta)的模块，可能存在较多的不稳定性以及异常BUG，如遇问题可反馈，反馈Q群：277757185
模块首页:[https://hyper-magic-window.sothx.com/](https://hyper-magic-window.sothx.com/)`);
		} else {
			const [getUpdateMsgErr, getUpdateMsgRes] = await $to(axios.get(url));
			if (getUpdateMsgErr) {
				reject(getUpdateMsgErr);
			} else {
				resolve(getUpdateMsgRes.data);
			}
		}
	});
};

export const getIOScheduler = (): Promise<string> => {
	const shellCommon = `cat /sys/block/sda/queue/scheduler`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`mq-deadline [kyber] bfq cpq none`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getAutoSettingIOScheduler = (): Promise<string> => {
	const shellCommon = `grep 'auto_setting_io_scheduler=' /data/adb/MIUI_MagicWindow+/config.prop | awk -F'=' '{print $2}'`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`kyber`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const removeAutoSettingIOScheduler = (): Promise<string> => {
	const shellCommon = `sed -i '/^auto_setting_io_scheduler=/d' //data/adb/MIUI_MagicWindow+/config.prop && echo "Remove auto_setting_io_scheduler successfully." || echo "Remove auto_setting_io_scheduler failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Remove auto_setting_io_scheduler successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno
					? reject(stderr)
					: stdout === 'Remove auto_setting_io_scheduler successfully.'
						? resolve(stdout)
						: reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const writeIOScheduler = (scheduler: string): Promise<string> => {
	const shellCommon = `echo '${scheduler}' > /sys/block/sda/queue/scheduler`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(``);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'null' ? resolve('') : resolve(stdout);
			}
		}),
		shellCommon,
	);
}

export const addAutoSettingIOScheduler = (scheduler: string): Promise<string> => {
	const shellCommon = `grep -q '^auto_setting_io_scheduler=' /data/adb/MIUI_MagicWindow+/config.prop || (source ${toolsFunc} && add_lines "auto_setting_io_scheduler=${scheduler}" /data/adb/MIUI_MagicWindow+/config.prop && echo "Command executed successfully." || echo "Command failed.");`
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const getSmartPenIdleEnable = (): Promise<string> => {
	const shellCommon = `source ${toolsFunc} && grep_prop ro.vendor.display.smartpen.idle.enable /data/adb/modules/MIUI_MagicWindow+/system.prop`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`false`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getSmartPenVVRFps = (): Promise<string> => {
	const shellCommon = `source ${toolsFunc} && grep_prop ro.vendor.display.smartpen_vrr_fps /data/adb/modules/MIUI_MagicWindow+/system.prop`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`false`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const removeSmartPenIdleEnable = (): Promise<string> => {
	const shellCommon = `sed -i '/^ro.vendor.display.smartpen.idle.enable=/d' //data/adb/modules/MIUI_MagicWindow+/system.prop && echo "Remove ro.vendor.display.smartpen.idle.enable successfully." || echo "Remove ro.vendor.display.smartpen.idle.enable failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Remove ro.vendor.display.smartpen.idle.enable successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno
					? reject(stderr)
					: stdout === 'Remove ro.vendor.display.smartpen.idle.enable successfully.'
						? resolve(stdout)
						: reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const removeSmartPenVVRFps = (): Promise<string> => {
	const shellCommon = `sed -i '/^ro.vendor.display.smartpen_vrr_fps=/d' //data/adb/modules/MIUI_MagicWindow+/system.prop && echo "Remove ro.vendor.display.smartpen_vrr_fps successfully." || echo "Remove ro.vendor.display.smartpen_vrr_fps failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Remove ro.vendor.display.smartpen_vrr_fps successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno
					? reject(stderr)
					: stdout === 'Remove ro.vendor.display.smartpen_vrr_fps successfully.'
						? resolve(stdout)
						: reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const addSmartPenIdleEnableIsFalse = (): Promise<string> => {
	const shellCommon = `grep -q '^ro.vendor.display.smartpen.idle.enable=' /data/adb/modules/MIUI_MagicWindow+/system.prop || (source ${toolsFunc} && add_lines "ro.vendor.display.smartpen.idle.enable=false" /data/adb/modules/MIUI_MagicWindow+/system.prop && echo "Command executed successfully." || echo "Command failed.");`
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const addSmartPenVVRFpsIsFalse = (): Promise<string> => {
	const shellCommon = `grep -q '^ro.vendor.display.smartpen_vrr_fps=' /data/adb/modules/MIUI_MagicWindow+/system.prop || (source ${toolsFunc} && add_lines "ro.vendor.display.smartpen_vrr_fps=false" /data/adb/modules/MIUI_MagicWindow+/system.prop && echo "Command executed successfully." || echo "Command failed.");`
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};


export const getOdmIdleDefaultFps = (): Promise<string> => {
	const shellCommon = `source ${toolsFunc} && grep_prop ro.vendor.display.idle_default_fps /odm/etc/build.prop`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`50`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getOdmIsSupportIdleDefaultFps = (): Promise<string> => {
	const shellCommon = `source ${toolsFunc} && grep_prop ro.vendor.display.idle_default_fps.support /odm/etc/build.prop`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`true`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getVendorIdleDefaultFps = (): Promise<string> => {
	const shellCommon = `source ${toolsFunc} && grep_prop ro.vendor.display.idle_default_fps /vendor/build.prop`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`50`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getVendorIsSupportIdleDefaultFps = (): Promise<string> => {
	const shellCommon = `source ${toolsFunc} && grep_prop ro.vendor.display.idle_default_fps.support /vendor/build.prop`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`true`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getIdleDefaultFps = (): Promise<string> => {
	const shellCommon = `source ${toolsFunc} && grep_prop ro.vendor.display.idle_default_fps /data/adb/modules/MIUI_MagicWindow+/system.prop`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`60`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const removeIdleDefaultFps = (): Promise<string> => {
	const shellCommon = `sed -i '/^ro.vendor.display.idle_default_fps=/d' //data/adb/modules/MIUI_MagicWindow+/system.prop && echo "Remove ro.vendor.display.idle_default_fps successfully." || echo "Remove ro.vendor.display.idle_default_fps failed."`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Remove ro.vendor.display.idle_default_fps successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno
					? reject(stderr)
					: stdout === 'Remove ro.vendor.display.idle_default_fps successfully.'
						? resolve(stdout)
						: reject(stdout);
			}
		}),
		shellCommon,
	);
};

export const addIdleDefaultFps = (fps:number): Promise<string> => {
	const shellCommon = `grep -q '^ro.vendor.display.idle_default_fps=' /data/adb/modules/MIUI_MagicWindow+/system.prop || (source ${toolsFunc} && add_lines "ro.vendor.display.idle_default_fps=${fps}" /data/adb/modules/MIUI_MagicWindow+/system.prop && echo "Command executed successfully." || echo "Command failed.");`
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Command executed successfully.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'Command executed successfully.' ? resolve(stdout) : reject(stdout);
			}
		}),
		shellCommon,
	);
};


export const getDisableIdleFps = (): Promise<string> => {
	const shellCommon = `getprop persist.vendor.disable_idle_fps`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve('true');
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getDisableIdleFpsThreshold = (): Promise<string> => {
	const shellCommon = `getprop persist.vendor.disable_idle_fps.threshold`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve('528');
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getProjectTrebleSupoortMagicWindowFix = (): Promise<string> => {
	const shellCommon = `getprop ro.config.sothx_project_treble_support_magic_window_fix`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve('true');
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getProjectTrebleSupoortVerticalScreenSplit = (): Promise<string> => {
	const shellCommon = `getprop ro.config.sothx_project_treble_support_vertical_screen_split`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve('true');
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getProjectTrebleVerticalScreenSplitEnable = (): Promise<string> => {
	const shellCommon = `getprop persist.config.sothx_project_treble_vertical_screen_split_enable`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`true`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const changeProjectTrebleVerticalScreenSplitEnable = (mode:boolean): Promise<string> => {
	const shellCommon = `setprop persist.config.sothx_project_treble_vertical_screen_split_enable ${mode}`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`success`);
			} else {
				const { errno, stdout, stderr }: ExecResults = (await exec(shellCommon)) as ExecResults;
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};