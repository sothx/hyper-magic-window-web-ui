import { exec, spawn, fullScreen, toast, moduleInfo, type ExecResults } from '@/utils/kernelsu/index.js';
import axios from 'axios';
import handlePromiseWithLogging from '@/utils/handlePromiseWithLogging';
import $to from 'await-to-js';
import * as deviceApi from '@/apis/deviceApi';
import { useDeviceStore } from '@/stores/device';
import * as xmlFormat from '@/utils/xmlFormat';
import { useEmbeddedStore } from '@/stores/embedded';
import {
	thirdPartyAppOptimizeJSONFormatToProp,
	thirdPartyAppOptimizeJSONFormatToRunnerShell,
} from '@/utils/embeddedFun';

export interface AndroidAppPackageJobsResult extends Omit<ExecResults, 'stdout'> {
	stdout: number;
}

export const getSourceEmbeddedRulesList = (): Promise<string> => {
	const shellCommon = `cat /data/adb/modules/Hyper_MagicWindow/common/source/embedded_rules_list.xml`;
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

export const setAppMode = (name: string, action: 0 | 1 | 2 | 3 | null): Promise<string> => {
	const shellCommon = `cmd miui_embedding_window set-appMode ${name} ${action}`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve('success');
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const switchAction = (name: string, action: 'enable' | 'disable'): Promise<string> => {
	const shellCommon = `cmd miui_embedding_window ${action} ${name}`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve('success');
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

export const getSourceFixedOrientationList = (): Promise<string> => {
	const shellCommon = `cat /data/adb/modules/Hyper_MagicWindow/common/source/fixed_orientation_list.xml`;
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
	const shellCommon = `cat /data/adb/Hyper_MagicWindow/config/embedded_rules_list.xml`;
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
	const shellCommon = `cat /data/adb/Hyper_MagicWindow/config/fixed_orientation_list.xml`;
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
	const shellCommon = `cat /data/adb/modules/Hyper_MagicWindow/common/source/embedded_setting_config.xml`;
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
	const shellCommon = `cat /data/adb/Hyper_MagicWindow/config/embedded_setting_config.xml`;
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

export const getSourceThirdPartyAppOptimizeConfig = (): Promise<string> => {
	const shellCommon = `cat /data/adb/modules/Hyper_MagicWindow/common/source/os2_third_party_app_optimize/third_party_app_optimize.prop`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/origin/third_party_app_optimize.prop');
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

export const getSystemAppOptimizeConfig = (): Promise<string> => {
	const shellCommon = `cat /data/adb/modules/Hyper_MagicWindow/common/source/os2_system_app_optimize/system_app_optimize.prop`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/origin/system_app_optimize.prop');
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

export const getCustomThirdPartyAppOptimizeConfig = (): Promise<string> => {
	const shellCommon = `cat /data/adb/Hyper_MagicWindow/config/third_party_app_optimize.prop`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/custom/third_party_app_optimize.prop');
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
		'resetApplicationCompats',
	);
};

export interface updateEmbeddedAppParams {
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
	params: updateEmbeddedAppParams = {},
): Promise<{
	type: 'success' | 'error'; // 操作的类型，成功或错误
	message: string; // 操作的消息
	errorLogging?: updateEmbeddedAppErrorLoggingItem[]; // 错误日志记录
	successLogging?: updateEmbeddedAppSuccessLoggingItem[]; // 成功日志记录
}> => {
	const deviceStore = useDeviceStore();
	const embeddedStore = useEmbeddedStore();
	const updateData = {
		...(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
			? {
					customThirdPartyAppOptimizeConfigProp: thirdPartyAppOptimizeJSONFormatToProp(
						embeddedStore.customThirdPartyAppOptimizeConfig,
					),
					thirdPartyAppOptimizeConfigRunnerShell: thirdPartyAppOptimizeJSONFormatToRunnerShell(
						embeddedStore.mergeThirdPartyAppOptimizeConfig,
					),
				}
			: undefined),
		isPatchMode: embeddedStore.isPatchMode,
		patchEmbeddedRulesListXML: xmlFormat.objectToXML(
			embeddedStore.patchEmbeddedRulesList,
			'package',
			'package_config',
		),
		patchFixedOrientationListXML: xmlFormat.objectToXML(
			embeddedStore.patchFixedOrientationList,
			'package',
			'package_config',
		),
		patchEmbeddedSettingConfigXML: xmlFormat.objectToXML(
			embeddedStore.patchEmbeddedSettingConfig,
			'setting',
			'setting_rule',
		),
		customEmbeddedRulesListXML: xmlFormat.objectToXML(
			embeddedStore.customConfigEmbeddedRulesList,
			'package',
			undefined,
		),
		customFixedOrientationListXML: xmlFormat.objectToXML(
			embeddedStore.customConfigFixedOrientationList,
			'package',
			undefined,
		),
		...(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
			? {
					settingConfigXML: xmlFormat.objectToXML(
						embeddedStore.customConfigEmbeddedSettingConfig,
						'setting',
						undefined,
					),
				}
			: {
					settingConfigXML: xmlFormat.objectToXML(
						embeddedStore.systemEmbeddedSettingConfig,
						'setting',
						'setting_rule',
					),
				}),
	};
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
				if (deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35) {
					if (updateData.customThirdPartyAppOptimizeConfigProp) {
						const {
							errno: PatchEmErrno,
							stdout: PatchEmStdout,
							stderr: PatchEmStderr,
						}: ExecResults = await exec(
							`echo '${updateData.customThirdPartyAppOptimizeConfigProp}' > /data/adb/Hyper_MagicWindow/config/third_party_app_optimize.prop`,
						);

						if (PatchEmErrno) {
							errorLogging.push({
								type: 'customThirdPartyAppOptimizeConfigProp',
								name: '[第三方应用横屏优化]第三方应用横屏优化配置文件',
								message: PatchEmStderr,
							});
						} else {
							successLogging.push({
								type: 'customThirdPartyAppOptimizeConfigProp',
								name: '[第三方应用横屏优化]第三方应用横屏优化配置文件',
								message: '更新成功',
							});
						}
					} else {
						const {
							errno: PatchRmErrno,
							stdout: PatchRmStdout,
							stderr: PatchRmStderr,
						}: ExecResults = await exec(
							`rm -f /data/adb/Hyper_MagicWindow/config/third_party_app_optimize.prop`,
						);

						if (PatchRmErrno) {
							errorLogging.push({
								type: 'customThirdPartyAppOptimizeConfigProp',
								name: '[第三方应用横屏优化]第三方应用横屏优化配置文件',
								message: PatchRmStderr,
							});
						} else {
							successLogging.push({
								type: 'customThirdPartyAppOptimizeConfigProp',
								name: '[第三方应用横屏优化]第三方应用横屏优化配置文件',
								message: '配置为空，文件已删除',
							});
						}
					}

					if (updateData.thirdPartyAppOptimizeConfigRunnerShell) {
						const {
							errno: PatchEmErrno,
							stdout: PatchEmStdout,
							stderr: PatchEmStderr,
						}: ExecResults = await exec(
							`echo '${updateData.thirdPartyAppOptimizeConfigRunnerShell}' > /data/adb/Hyper_MagicWindow/config/third_party_app_optimize_runner.sh`,
						);

						if (PatchEmErrno) {
							errorLogging.push({
								type: 'thirdPartyAppOptimizeConfigRunnerShell',
								name: '[第三方应用横屏优化]第三方应用横屏优化运行脚本',
								message: PatchEmStderr,
							});
						} else {
							successLogging.push({
								type: 'thirdPartyAppOptimizeConfigRunnerShell',
								name: '[第三方应用横屏优化]第三方应用横屏优化运行脚本',
								message: '更新成功',
							});
						}
					} else {
						const {
							errno: PatchRmErrno,
							stdout: PatchRmStdout,
							stderr: PatchRmStderr,
						}: ExecResults = await exec(
							`rm -f /data/adb/Hyper_MagicWindow/config/third_party_app_optimize_runner.sh`,
						);

						if (PatchRmErrno) {
							errorLogging.push({
								type: 'thirdPartyAppOptimizeConfigRunnerShell',
								name: '[第三方应用横屏优化]第三方应用横屏优化运行脚本',
								message: PatchRmStderr,
							});
						} else {
							successLogging.push({
								type: 'thirdPartyAppOptimizeConfigRunnerShell',
								name: '[第三方应用横屏优化]第三方应用横屏优化运行脚本',
								message: '配置为空，文件已删除',
							});
						}
					}
				}
				if (updateData.isPatchMode) {
					const {
						errno: PatchEmErrno,
						stdout: PatchEmStdout,
						stderr: PatchEmStderr,
					}: ExecResults = await exec(
						`echo '${updateData.patchEmbeddedRulesListXML}' > /data/adb/Hyper_MagicWindow/patch_rule/embedded_rules_list.xml`,
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
						`echo '${updateData.patchFixedOrientationListXML}' > /data/adb/Hyper_MagicWindow/patch_rule/fixed_orientation_list.xml`,
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

					if (deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35) {
						const {
							errno: PatchSettingsErrno,
							stdout: PatchSettingsStdout,
							stderr: PatchSettingsStderr,
						}: ExecResults = await exec(
							`echo '${updateData.patchEmbeddedSettingConfigXML}' > /data/adb/Hyper_MagicWindow/patch_rule/embedded_setting_config.xml`,
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
					`echo '${updateData.customEmbeddedRulesListXML}' > /data/adb/Hyper_MagicWindow/config/embedded_rules_list.xml`,
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
					`echo '${updateData.customFixedOrientationListXML}' > /data/adb/Hyper_MagicWindow/config/fixed_orientation_list.xml`,
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

				if (deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35) {
					const {
						errno: SettingsErrno,
						stdout: SettingsStdout,
						stderr: SettingsStderr,
					}: ExecResults = await exec(
						`echo '${updateData.settingConfigXML}' > /data/adb/Hyper_MagicWindow/config/embedded_setting_config.xml`,
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
						`echo '${updateData.settingConfigXML}' > /data/system/users/0/embedded_setting_config.xml`,
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

				const [UpdateRuleStderr, UpdateRuleStdout] = await $to<string, string>(
					deviceApi.updateRule('miui_embedding_window'),
				);

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
