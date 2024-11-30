import { exec, spawn, fullScreen, toast, moduleInfo, type ExecResults } from '@/utils/kernelsu/index.js';
import axios from 'axios';
import handlePromiseWithLogging from '@/utils/handlePromiseWithLogging';
import $to from 'await-to-js';
import * as deviceApi from '@/apis/deviceApi';
import { useDeviceStore } from '@/stores/device';

export interface SmartFocusIOResult extends ExecResults {
	stdout: 'on' | 'off';
}

export interface AndroidAppPackageJobsResult extends Omit<ExecResults, 'stdout'> {
	stdout: number;
}


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

				const [UpdateRuleStderr, UpdateRuleStdout] = await $to<string, string>(deviceApi.updateRule());

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