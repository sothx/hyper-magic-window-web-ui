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

export const getMiuiFreeformCloudDataIdList = (): Promise<string[]> => {
	const sqlite3 = '/data/adb/modules/MIUI_MagicWindow+/common/utils/sqlite3'
	const HTMLViewerCloudDataDataBase = `/data/user_de/0/com.android.htmlviewer/databases/cloud_all_data.db`
	const shellCommon = `echo "$(${sqlite3} ${HTMLViewerCloudDataDataBase} "SELECT dataId FROM cloud_all_data WHERE moduleName='MiuiFreeform';")"`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(['1211629','1210869']);
			} else {
				const { errno, stdout, stderr }: ExecResults = (await exec(shellCommon)) as unknown as ExecResults;
				if (errno) {
					reject(stderr)
				}
				if (stdout) {
					try {
						const ids = stdout.split('\n');
						resolve(ids)
					} catch (err) {
						reject(err)
					}
				}
			}
		}),
		shellCommon,
	);
};

export const getCustomDotBlackList = (): Promise<string[]> => {
	const shellCommon = `cat /data/adb/MIUI_MagicWindow+/config/dot_black_list.json`;
	return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
	  if (import.meta.env.MODE === "development") {
		const response = await axios.get(
		  "/data/custom/dot_black_list.json"
		);
		const jsonText = response.data; // 这是 XML 内容
		resolve(jsonText as unknown as string[]);
	  } else {
		const { errno, stdout, stderr }: ExecResults = await exec(
		  shellCommon
		);
		if (errno) {
			reject(stderr);
		}

		if (stdout) {
			try {
				resolve(JSON.parse(stdout))
			} catch (err) {
				reject(err)
			}
		}
	  }
	}), shellCommon);
}

export const getDotBlackList = (): Promise<DotBlackListItem[]> => {
	const sqlite3 = '/data/adb/modules/MIUI_MagicWindow+/common/utils/sqlite3'
	const HTMLViewerCloudDataBase = `/data/user_de/0/com.android.htmlviewer/databases/cloud_all_data.db`
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/system/dot_black_list.json');
				resolve(response.data as unknown as DotBlackListItem[]);
			} else {
				const [,getMiuiFreeformCloudDataIdListRes] = await $to<string[],string>(getMiuiFreeformCloudDataIdList())
				if (getMiuiFreeformCloudDataIdListRes) {
					const fetchDataById = async (dataId:string):Promise<DotBlackListItem> => {
						const shellCommon = `echo "$(${sqlite3} ${HTMLViewerCloudDataBase} "SELECT productData FROM cloud_all_data WHERE dataId='${dataId}';")"`;
						return handlePromiseWithLogging(
							new Promise(async (fetchDataByIdResolve,fetchDataByIdReject) => {
								const { errno, stdout, stderr }: ExecResults = (await exec(shellCommon)) as unknown as ExecResults;
								if (errno) {
									fetchDataByIdReject(stderr)
								}
								if (stdout) {
									try {
										const cloudFeatucteData = JSON.parse(stdout)
										if (cloudFeatucteData.dot_black_list) {
											fetchDataByIdResolve({
												dataId: Number(dataId),
												productData: cloudFeatucteData || {},
												dataList: cloudFeatucteData.dot_black_list || []
											})
										} else {
											fetchDataByIdResolve({
												dataId: Number(dataId),
												productData: cloudFeatucteData || {},
												dataList:[]
											})
										}
									} catch (err) {
										fetchDataByIdReject(err)
									}
								}
							}),
							shellCommon
						)
					}
					const [getDotBlackListErr,getDotBlackListRes] = await $to(Promise.all(getMiuiFreeformCloudDataIdListRes.map(dataId => fetchDataById(dataId))))
					if (getDotBlackListErr) {
						reject(getDotBlackListErr)
					}
					if (getDotBlackListRes) {
						resolve(getDotBlackListRes)
					}
				}
			}
		}),
		'getDotBlackList',
	);
};

export const getSourceEmbeddedRulesList = (): Promise<string> => {
	const shellCommon = `cat /data/adb/modules/MIUI_MagicWindow+/common/source/embedded_rules_list.xml`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/origin/embedded_rules_list.xml');
				const xmlText = response.data; // 这是 XML 内容
				resolve(xmlText);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getSystemEmbeddedRulesList = (): Promise<string> => {
	const shellCommon = `cat /product/etc/embedded_rules_list.xml`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/system/embedded_rules_list.xml');
				const xmlText = response.data; // 这是 XML 内容
				resolve(xmlText);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getSourceFixedOrientationList = (): Promise<string> => {
	const shellCommon = `cat /data/adb/modules/MIUI_MagicWindow+/common/source/fixed_orientation_list.xml`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/origin/fixed_orientation_list.xml');
				const xmlText = response.data; // 这是 XML 内容
				resolve(xmlText);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getSystemFixedOrientationList = (): Promise<string> => {
	const shellCommon = `cat /product/etc/fixed_orientation_list.xml`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/system/fixed_orientation_list.xml');
				const xmlText = response.data; // 这是 XML 内容
				resolve(xmlText);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getCustomConfigEmbeddedRulesList = (): Promise<string> => {
	const shellCommon = `cat /data/adb/MIUI_MagicWindow+/config/embedded_rules_list.xml`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/custom/embedded_rules_list.xml');
				const xmlText = response.data; // 这是 XML 内容
				resolve(xmlText);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getCustomConfigFixedOrientationList = (): Promise<string> => {
	const shellCommon = `cat /data/adb/MIUI_MagicWindow+/config/fixed_orientation_list.xml`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/custom/fixed_orientation_list.xml');
				const xmlText = response.data; // 这是 XML 内容
				resolve(xmlText);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getSystemEmbeddedSettingConfig = (): Promise<string> => {
	const shellCommon = `cat /data/system/users/0/embedded_setting_config.xml`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/origin/embedded_setting_config.xml');
				const xmlText = response.data; // 这是 XML 内容
				resolve(xmlText);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getSourceEmbeddedSettingConfig = (): Promise<string> => {
	const shellCommon = `cat /data/adb/modules/MIUI_MagicWindow+/common/source/embedded_setting_config.xml`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/origin/embedded_setting_config.xml');
				const xmlText = response.data; // 这是 XML 内容
				resolve(xmlText);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getCustomConfigEmbeddedSettingConfig = (): Promise<string> => {
	const shellCommon = `cat /data/adb/MIUI_MagicWindow+/config/embedded_setting_config.xml`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/custom/embedded_setting_config.xml');
				const xmlText = response.data; // 这是 XML 内容
				resolve(xmlText);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getSourceAutoUIList = (): Promise<string> => {
	const shellCommon = `cat /data/adb/modules/MIUI_MagicWindow+/common/source/autoui_list.xml`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/origin/autoui_list.xml');
				const xmlText = response.data; // 这是 XML 内容
				resolve(xmlText);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getCustomConfigAutoUIList = (): Promise<string> => {
	const shellCommon = `cat /data/adb/MIUI_MagicWindow+/config/autoui_list.xml`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/custom/autoui_list.xml');
				const xmlText = response.data; // 这是 XML 内容
				resolve(xmlText);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getAutoUISettingConfig = (): Promise<string> => {
	const shellCommon = `cat /data/system/users/0/autoui_setting_config.xml`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/origin/autoui_setting_config.xml');
				const xmlText = response.data; // 这是 XML 内容
				resolve(xmlText);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
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

export const getInstalledAppNameList = (): Promise<string> => {
	const shellCommon = `CLASSPATH="/data/adb/modules/MIUI_MagicWindow+/common/utils/classes.dex" app_process /system/bin com.xayah.dex.HiddenApiUtil getInstalledPackagesAsUser 0 "user" "pkgName|label"`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`,com.xiaomi.scanner,小爱视觉\n,com.max.xiaoheihe,小黑盒\n,com.xingin.xhs,小红书\n,com.miui.creation,小米创作`);
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
}

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
}

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
}


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

interface AppInfo {
	packageName: string;
	appName: string;
}

export const getUserAppList = (): Promise<string> => {
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/test.json');
				const jsonText = response.data; // 这是 XML 内容
				resolve(jsonText);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(
					'cat /data/system/users/0/autoui_setting_config.xml',
				);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		'getUserAppList',
	);
};

export const reboot = (): Promise<string> => {
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/test.json');
				const jsonText = response.data; // 这是 XML 内容
				resolve(jsonText);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(
					'cat /data/system/users/0/autoui_setting_config.xml',
				);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		'getUserAppList',
	);
};

export const resetApplicationCompat = (packageName: string): Promise<string> => {
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`Reset all changes for ${packageName} to default value.`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(`am compat reset-all ${packageName}`);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		'getUserAppList',
	);
};

export interface updateEmbeddedAppParams {
	isPatchMode: boolean;
	patchEmbeddedRulesListXML: string;
	patchFixedOrientationListXML: string;
	patchEmbeddedSettingConfigXML: string;
	customEmbeddedRulesListXML: string;
	customFixedOrientationListXML: string;
	settingConfigXML: string;
	switchAction?: {
		name: string;
		action: 'enable' | 'disable';
	};
	setAppMode?: {
		name: string;
		// 0 is Disable, 1 is ActivityEmbedding, 2 is FixedOrientation, 3 is FullScreen, null is Clean
		action: 0 | 1 | 2 | 3 | null;
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
	params: updateEmbeddedAppParams,
): Promise<{
	type: 'success' | 'error'; // 操作的类型，成功或错误
	message: string; // 操作的消息
	errorLogging?: updateEmbeddedAppErrorLoggingItem[]; // 错误日志记录
	successLogging?: updateEmbeddedAppSuccessLoggingItem[]; // 成功日志记录
}> => {
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve({
					type: 'success',
					message: '更新成功',
					errorLogging: [],
					successLogging: [], // 返回一个空的成功日志
				});
			} else {
				const errorLogging: updateEmbeddedAppErrorLoggingItem[] = [];
				const successLogging: updateEmbeddedAppSuccessLoggingItem[] = [];
				const deviceStore = useDeviceStore();
				if (params.isPatchMode) {
					const {
						errno: PatchEmErrno,
						stdout: PatchEmStdout,
						stderr: PatchEmStderr,
					}: ExecResults = await exec(
						`echo '${params.patchEmbeddedRulesListXML}' > /data/adb/MIUI_MagicWindow+/patch_rule/embedded_rules_list.xml`,
					);
					if (PatchEmErrno) {
						errorLogging.push({
							type: 'patchEmbeddedRulesListXML',
							name: '[定制模式]平行窗口配置文件',
							message: PatchEmStderr,
						});
					} else {
						successLogging.push({
							type: 'patchEmbeddedRulesListXML',
							name: '[定制模式]平行窗口配置文件',
							message: '更新成功',
						});
					}

					const {
						errno: PatchFixErrno,
						stdout: PatchFixStdout,
						stderr: PatchFixStderr,
					}: ExecResults = await exec(
						`echo '${params.patchFixedOrientationListXML}' > /data/adb/MIUI_MagicWindow+/patch_rule/fixed_orientation_list.xml`,
					);
					if (PatchFixErrno) {
						errorLogging.push({
							type: 'patchFixedOrientationListXML',
							name: '[定制模式]信箱模式配置文件',
							message: PatchFixStderr,
						});
					} else {
						successLogging.push({
							type: 'patchixedOrientationListXML',
							name: '[定制模式]信箱模式配置文件',
							message: '更新成功',
						});
					}

					if (deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2) {
						const {
							errno: PatchSettingsErrno,
							stdout: PatchSettingsStdout,
							stderr: PatchSettingsStderr,
						}: ExecResults = await exec(
							`echo '${params.patchEmbeddedSettingConfigXML}' > /data/adb/MIUI_MagicWindow+/patch_rule/embedded_setting_config.xml`,
						);
						if (PatchSettingsErrno) {
							errorLogging.push({
								type: 'patchEmbeddedSettingConfigXML',
								name: '[定制模式]应用横屏布局配置文件',
								message: PatchSettingsStderr,
							});
						} else {
							successLogging.push({
								type: 'patchEmbeddedSettingConfigXML',
								name: '[定制模式]应用横屏布局配置文件',
								message: '更新成功',
							});
						}
					}
				}

				const {
					errno: EmErrno,
					stdout: EmStdout,
					stderr: EmStderr,
				}: ExecResults = await exec(
					`echo '${params.customEmbeddedRulesListXML}' > /data/adb/MIUI_MagicWindow+/config/embedded_rules_list.xml`,
				);
				if (EmErrno) {
					errorLogging.push({
						type: 'customEmbeddedRulesListXML',
						name: '[自定义规则]平行窗口配置文件',
						message: EmStderr,
					});
				} else {
					successLogging.push({
						type: 'customEmbeddedRulesListXML',
						name: '[自定义规则]平行窗口配置文件',
						message: '更新成功',
					});
				}

				const {
					errno: FixErrno,
					stdout: FixStdout,
					stderr: FixStderr,
				}: ExecResults = await exec(
					`echo '${params.customFixedOrientationListXML}' > /data/adb/MIUI_MagicWindow+/config/fixed_orientation_list.xml`,
				);
				if (FixErrno) {
					errorLogging.push({
						type: 'customFixedOrientationListXML',
						name: '[自定义规则]信箱模式配置文件',
						message: FixStderr,
					});
				} else {
					successLogging.push({
						type: 'customFixedOrientationListXML',
						name: '[自定义规则]信箱模式配置文件',
						message: '更新成功',
					});
				}

				if (deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2) {
					const {
						errno: SettingsErrno,
						stdout: SettingsStdout,
						stderr: SettingsStderr,
					}: ExecResults = await exec(
						`echo '${params.settingConfigXML}' > /data/adb/MIUI_MagicWindow+/config/embedded_setting_config.xml`,
					);

					if (SettingsErrno) {
						errorLogging.push({
							type: 'settingConfigXML',
							name: '[自定义规则]应用横屏布局配置文件',
							message: SettingsStderr,
						});
					} else {
						successLogging.push({
							type: 'settingConfigXML',
							name: '[自定义规则]应用横屏布局配置文件',
							message: '更新成功',
						});
					}
				} else {
					const {
						errno: SettingsErrno,
						stdout: SettingsStdout,
						stderr: SettingsStderr,
					}: ExecResults = await exec(
						`echo '${params.settingConfigXML}' > /data/system/users/0/embedded_setting_config.xml`,
					);
					if (SettingsErrno) {
						errorLogging.push({
							type: 'settingConfigXML',
							name: '[系统]应用横屏布局配置文件',
							message: SettingsStderr,
						});
					} else {
						successLogging.push({
							type: 'settingConfigXML',
							name: '[系统]应用横屏布局配置文件',
							message: '更新成功',
						});
					}
				}

				if (params.setAppMode) {
					const [resetCompatErr, resetCompatRes] = await $to<string, string>(
						resetApplicationCompat(params.setAppMode.name),
					);
					if (resetCompatErr) {
						errorLogging.push({
							type: 'resetApplicationCompat',
							name: '[模块]重置应用兼容性',
							message: resetCompatErr,
						});
					}

					if (resetCompatRes) {
						successLogging.push({
							type: 'resetApplicationCompat',
							name: '[模块]重置应用兼容性',
							message: resetCompatRes,
						});
					}
				}

				const [UpdateRuleStderr, UpdateRuleStdout] = await $to<string, string>(updateRule());

				if (UpdateRuleStderr) {
					errorLogging.push({
						type: 'updateMiuiEmbeddingWindowRule',
						name: '[模块]重新载入模块应用横屏布局规则',
						message: UpdateRuleStderr,
					});
				}

				if (UpdateRuleStdout) {
					successLogging.push({
						type: 'updateMiuiEmbeddingWindowRule',
						name: '[模块]重新载入模块应用横屏布局配置文件',
						message: UpdateRuleStdout.split('\n'),
					});
				}

				if (params.switchAction) {
					const {
						errno: SwitchActionErrno,
						stdout: SwitchActionStdout,
						stderr: SwitchActionStderr,
					}: ExecResults = await exec(
						`cmd miui_embedding_window ${params.switchAction.action} ${params.switchAction.name}`,
					);
					if (SwitchActionErrno) {
						errorLogging.push({
							type: 'updateMiuiEmbeddingWindowSwitchAction',
							name: `[模块]更新${params.switchAction.action}的设置`,
							message: SwitchActionStderr,
						});
					} else {
						successLogging.push({
							type: 'updateMiuiEmbeddingWindowSwitchAction',
							name: `[模块]更新${params.switchAction.action}的设置`,
							message: SwitchActionStdout,
						});
					}
				}

				if (params.setAppMode) {
					const {
						errno: SetAppModeErrno,
						stdout: SetAppModeStdout,
						stderr: SetAppModeStderr,
					}: ExecResults = await exec(
						`cmd miui_embedding_window set-appMode ${params.setAppMode.name} ${params.setAppMode.action}`,
					);
					if (SetAppModeErrno) {
						errorLogging.push({
							type: 'updateMiuiEmbeddingWindowSwitchAction',
							name: `[模块]更新${params.setAppMode.name}的设置为${params.setAppMode.action}`,
							message: SetAppModeStderr,
						});
					} else {
						successLogging.push({
							type: 'updateMiuiEmbeddingWindowSwitchAction',
							name: `[模块]更新${params.setAppMode.name}的设置${params.setAppMode.action}`,
							message: SetAppModeStdout,
						});
					}
				}

				if (errorLogging.length) {
					reject({
						type: 'error',
						message: '发生错误,提交失败',
						errorLogging, // 返回错误日志
						successLogging,
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
		}),
	);
};

// export const reloadAndroidAppPackageList = (): Promise<string> => {
//   const shellCommon = `(sh /data/adb/modules/MIUI_MagicWindow+/service.sh > /dev/null 2>&1 & echo $!)`
//   return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
//     if (import.meta.env.MODE === "development") {
//       resolve('27455');
//     } else {
//       const { errno, stdout, stderr }: ExecResults = await exec(
//         shellCommon
//       );
//       errno ? reject(stderr) : !isNaN(Number(stdout)) ? resolve(String(stdout)) : reject(stdout);
//     }
//   }), shellCommon);
// };

// export const readAndroidPackageShellJobs = (id: number): Promise<string> => {
//   const shellCommon = `ps | grep ${id}`
//   return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
//     if (import.meta.env.MODE === "development") {
//       const response = await axios.get(
//         "/data/origin/package_info.json"
//       );
//       const jsonText = response.data; // 这是 XML 内容
//       resolve(jsonText);
//     } else {
//       const { errno, stdout, stderr }: ExecResults = await exec(
//         shellCommon
//       );
//       errno ? reject(stderr) : resolve(stdout);
//     }
//   }), shellCommon);
// }

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
		action: 'enable' | 'disable';
	};
}

export const updateAutoUIApp = (
	params: updateAutoUIAppParams,
): Promise<{
	type: 'success' | 'error'; // 操作的类型，成功或错误
	message: string; // 操作的消息
	errorLogging?: updateAutoUIAppErrorLoggingItem[]; // 错误日志记录
	successLogging?: updateAutoUIAppSuccessLoggingItem[]; // 成功日志记录
}> => {
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve({
					type: 'success',
					message: '更新成功',
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
					`echo '${params.customAutoUIListXML}' > /data/adb/MIUI_MagicWindow+/config/autoui_list.xml`,
				);
				if (EmErrno) {
					errorLogging.push({
						type: 'customAutoUIListXML',
						name: '[自定义规则]应用布局优化配置文件',
						message: EmStderr,
					});
				} else {
					successLogging.push({
						type: 'customAutoUIListXML',
						name: '[自定义规则]应用布局优化配置文件',
						message: '更新成功',
					});
				}

				const {
					errno: SettingsErrno,
					stdout: SettingsStdout,
					stderr: SettingsStderr,
				}: ExecResults = await exec(
					`echo '${params.settingConfigXML}' > /data/system/users/0/autoui_setting_config.xml`,
				);
				if (SettingsErrno) {
					errorLogging.push({
						type: 'settingConfigXML',
						name: '[模块]应用布局优化配置文件',
						message: SettingsStderr,
					});
				} else {
					successLogging.push({
						type: 'settingConfigXML',
						name: '[模块]应用布局优化配置文件',
						message: '更新成功',
					});
				}

				const [UpdateRuleStderr, UpdateRuleStdout] = await $to<string, string>(updateRule());

				if (UpdateRuleStderr) {
					errorLogging.push({
						type: 'updateAutoUIRule',
						name: '[模块]重新载入模块应用布局优化规则',
						message: UpdateRuleStderr,
					});
				}

				if (UpdateRuleStdout) {
					successLogging.push({
						type: 'updateAutoUIRule',
						name: '[模块]重新载入模块应用布局优化规则',
						message: UpdateRuleStdout.split('\n'),
					});
				}

				if (params.reloadRuleAction) {
					const {
						errno: ReloadActionErrno,
						stdout: SwitchActionStdout,
						stderr: ReloadActionStderr,
					}: ExecResults = await exec(
						`cmd miui_auto_ui ${params.reloadRuleAction.action} ${params.reloadRuleAction.name}`,
					);

					if (ReloadActionErrno) {
						errorLogging.push({
							type: 'updateMiuiAutoUIReloadAction',
							name: `[模块]更新${params.reloadRuleAction.name}的设置`,
							message: ReloadActionStderr,
						});
					} else {
						successLogging.push({
							type: 'updateMiuiAutoUIReloadAction',
							name: `[模块]更新${params.reloadRuleAction.name}的设置`,
							message: SwitchActionStdout,
						});
					}
				}

				if (errorLogging.length) {
					reject({
						type: 'error',
						message: '发生错误,提交失败',
						errorLogging, // 返回错误日志
						successLogging,
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
		}),
	);
};
