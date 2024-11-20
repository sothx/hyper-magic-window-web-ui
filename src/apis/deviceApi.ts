import { exec, spawn, fullScreen, toast, moduleInfo, type ExecResults } from '@/utils/kernelsu/index.js';
import axios from 'axios';
import handlePromiseWithLogging from '@/utils/handlePromiseWithLogging';
import $to from 'await-to-js';
import { useDeviceStore } from '@/stores/device';
import { useLogsStore } from '@/stores/logs';
import type DotBlackListItem from '@/types/DotBlackListItem';

export interface SmartFocusIOResult extends ExecResults {
	stdout: 'on' | 'off';
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

export const getSmartFocusIO = (): Promise<SmartFocusIOResult['stdout']> => {
	const shellCommon = `getprop persist.sys.stability.smartfocusio`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve('on');
			} else {
				const { errno, stdout, stderr }: SmartFocusIOResult = (await exec(shellCommon)) as SmartFocusIOResult;
				errno ? reject(stderr) : resolve(stdout);
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
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			const response = JSON.stringify({
				moduleDir: '/data/adb/modules/MIUI_MagicWindow+',
				id: 'MIUI_MagicWindow+',
			});
			if (import.meta.env.MODE === 'development') {
				resolve(response);
			} else {
				resolve(response);
			}
		}),
		'getModuleInfo',
	);
};

export const addIsPatchMode = (): Promise<string> => {
	const shellCommon = `grep -q '^is_patch_mode=' /data/adb/MIUI_MagicWindow+/config.prop || (echo "is_patch_mode=true" | tee -a /data/adb/MIUI_MagicWindow+/config.prop > /dev/null && echo "Command executed successfully." || echo "Command failed.")`;
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

export const deleteGameMode = (): Promise<string> => {
	const shellCommon = `sed -i '/^# 开启游戏显示布局/d; /^ro.config.miui_compat_enable=/d; /^ro.config.miui_appcompat_enable=/d' /data/adb/modules/MIUI_MagicWindow+/system.prop  && echo "Command executed successfully." || echo "Command failed."`;
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

export const addGameMode = (): Promise<string> => {
	const shellCommon = `grep -qxF "# 开启游戏显示布局" system.prop || echo -e "# 开启游戏显示布局\nro.config.miui_compat_enable=true\nro.config.miui_appcompat_enable=true" >> /data/adb/modules/MIUI_MagicWindow+/system.prop  && echo "Command executed successfully." || echo "Command failed."`;
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
	const shellCommon = `test -f /system/product/priv-app/MIUIContentExtension/MIUIContentExtension.apk && echo "exists" || echo "not exists"`;
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

export const saveLogs = (content:string,timestamp:number): Promise<string> => {
	const shellCommon = `echo "${content.replace(/"/g, '\\"')}" > /data/adb/MIUI_MagicWindow+/logs-${timestamp}.txt`;
	return new Promise(async (resolve, reject) => {
		if (import.meta.env.MODE === 'development') {
			resolve(`save command executed successfully.`);
		} else {
			const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
			errno
				? reject(stderr)
				: resolve(`save command executed successfully.`)
		}
	})
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

export const updateRule = (): Promise<string> => {
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
					`sh /data/adb/modules/MIUI_MagicWindow+/common/source/update_rule/update_rule.sh`,
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
