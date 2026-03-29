import { exec, spawn, fullScreen, toast, moduleInfo, type ExecResults } from '@/utils/kernelsu/index.js';
import axios from 'axios';
import handlePromiseWithLogging from '@/utils/handlePromiseWithLogging';
import $to from 'await-to-js';
import * as deviceApi from '@/apis/deviceApi';
import { useDeviceStore } from '@/stores/device';
import { useLogsStore } from '@/stores/logs';
import type DotBlackListItem from '@/types/DotBlackListItem';
import type { AutoUI2PackageRules, AutoUI2EnableMap } from '@/types/AutoUI2PackageRules';
import * as xmlFormat from '@/utils/xmlFormat';

export interface AndroidAppPackageJobsResult extends Omit<ExecResults, 'stdout'> {
	stdout: number;
}


export const getSourceAutoUIList = (): Promise<string> => {
	const shellCommon = `cat /data/adb/modules/Hyper_MagicWindow/common/source/autoui_list.xml`;
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

export const getSourceAutoUI2List = (): Promise<string> => {
	const shellCommon = `cat /data/adb/modules/Hyper_MagicWindow/common/source/autoui2_list.xml`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/origin/autoui2_list.xml');
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
	const shellCommon = `cat /data/adb/Hyper_MagicWindow/config/autoui_list.xml`;
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

export const getCustomConfigAutoUI2List = (): Promise<string> => {
	const shellCommon = `cat /data/adb/Hyper_MagicWindow/config/autoui2_list.xml`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/custom/autoui2_list.xml');
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

/** 2.0 仅包名 → 是否启用；与 autoui2_list.xml（规则体）配合 */
export const getCustomConfigAutoUI2EnableJson = (): Promise<string> => {
	const shellCommon = `cat /data/adb/Hyper_MagicWindow/config/autoui2_enable.json`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				try {
					const response = await axios.get('/data/custom/autoui2_enable.json');
					resolve(typeof response.data === 'string' ? response.data : JSON.stringify(response.data));
				} catch {
					reject(new Error('autoui2_enable.json not found in dev'));
				}
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout);
			}
		}),
		shellCommon,
	);
};

/** 获取 patch_rule 中的 AutoUI2 配置 */
export const getPatchRuleAutoUI2List = (): Promise<string> => {
	const shellCommon = `cat /data/adb/Hyper_MagicWindow/patch_rule/autoui2_list.xml`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				try {
					const response = await axios.get('/data/custom/patch_rule_autoui2_list.xml');
					resolve(response.data);
				} catch {
					reject(new Error('patch_rule autoui2_list.xml not found in dev'));
				}
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
	const deviceStore = useDeviceStore();
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
					`echo '${params.customAutoUIListXML}' > /data/adb/Hyper_MagicWindow/config/autoui_list.xml`,
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

				const [UpdateRuleStderr, UpdateRuleStdout] = await $to<string, string>(deviceApi.updateRule('miui_auto_ui'));

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
						`cmd ${deviceStore.androidTargetSdk >= 36 ? `miui.appadaptation autoui` : `miui_auto_ui`} ${params.reloadRuleAction.action} ${params.reloadRuleAction.name}`,
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

export interface updateAutoUI2AppParams {
	/** 仅包名 → 是否启用，写入 autoui2_enable.json */
	customAutoUI2Json: string;
	/** 实际生效列表，仅启用项，写入 autoui2_list.xml */
	customAutoUI2DeployXML: string;
	/** patch_rule 中的 AutoUI2 配置（定制模式下） */
	patchAutoUI2DeployXML?: string;
	/** 是否需要删除 patch_rule 配置 */
	shouldDeletePatchRule?: boolean;
	reloadRuleAction?: {
		name: string;
		action: 'enable' | 'disable';
	};
}

export const buildAutoUI2UpdateParams = (
	customRecord: AutoUI2PackageRules,
	sourceRecord: AutoUI2PackageRules = {},
	isPatchMode: boolean = false,
	opts?: Pick<updateAutoUI2AppParams, 'reloadRuleAction'>,
): updateAutoUI2AppParams => {
	const enableMap: AutoUI2EnableMap = {};
	for (const [k, pkg] of Object.entries(customRecord)) {
		enableMap[k] = pkg.enable !== false;
	}
	
	const params: updateAutoUI2AppParams = {
		customAutoUI2Json: JSON.stringify(enableMap),
		customAutoUI2DeployXML: xmlFormat.stringifyAutoUI2PackageRulesXml(
			xmlFormat.filterAutoUI2PackagesForDeploy(customRecord),
		),
		...opts,
	};

	// 如果在定制模式下，需要生成 patch_rule 配置
	if (isPatchMode) {
		// 合并系统配置、自定义配置和开关配置
		const mergedForPatch = xmlFormat.mergeAutoUI2ForPatchRule(
			sourceRecord,
			customRecord,
			enableMap,
		);
		
		if (Object.keys(mergedForPatch).length > 0) {
			params.patchAutoUI2DeployXML = xmlFormat.stringifyAutoUI2PackageRulesXml(
				xmlFormat.filterAutoUI2PackagesForDeploy(mergedForPatch),
			);
		} else {
			params.shouldDeletePatchRule = true;
		}
	}

	return params;
};

export const updateAutoUI2App = (
	params: updateAutoUI2AppParams,
): Promise<{
	type: 'success' | 'error';
	message: string;
	errorLogging?: updateAutoUIAppErrorLoggingItem[];
	successLogging?: updateAutoUIAppSuccessLoggingItem[];
}> => {
	const deviceStore = useDeviceStore();
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve({
					type: 'success',
					message: '更新成功',
					errorLogging: [],
					successLogging: [],
				});
			} else {
				const errorLogging: updateAutoUIAppErrorLoggingItem[] = [];
				const successLogging: updateAutoUIAppSuccessLoggingItem[] = [];

				const {
					errno: JsonErrno,
					stdout: JsonStdout,
					stderr: JsonStderr,
				}: ExecResults = await exec(
					`echo '${params.customAutoUI2Json}' > /data/adb/Hyper_MagicWindow/config/autoui2_enable.json`,
				);
				if (JsonErrno) {
					errorLogging.push({
						type: 'customAutoUI2Json',
						name: '[自定义规则]应用布局优化 2.0 开关配置（autoui2_enable.json）',
						message: JsonStderr,
					});
				} else {
					successLogging.push({
						type: 'customAutoUI2Json',
						name: '[自定义规则]应用布局优化 2.0 开关配置（autoui2_enable.json）',
						message: '更新成功',
					});
				}

				const {
					errno: EmErrno,
					stdout: EmStdout,
					stderr: EmStderr,
				}: ExecResults = await exec(
					`echo '${params.customAutoUI2DeployXML}' > /data/adb/Hyper_MagicWindow/config/autoui2_list.xml`,
				);
				if (EmErrno) {
					errorLogging.push({
						type: 'customAutoUI2DeployXML',
						name: '[自定义规则]应用布局优化 2.0 生效配置（autoui2_list.xml）',
						message: EmStderr,
					});
				} else {
					successLogging.push({
						type: 'customAutoUI2DeployXML',
						name: '[自定义规则]应用布局优化 2.0 生效配置（autoui2_list.xml）',
						message: '更新成功',
					});
				}

				// 处理 patch_rule 配置
				if (params.patchAutoUI2DeployXML) {
					const {
						errno: PatchErrno,
						stdout: PatchStdout,
						stderr: PatchStderr,
					}: ExecResults = await exec(
						`echo '${params.patchAutoUI2DeployXML}' > /data/adb/Hyper_MagicWindow/patch_rule/autoui2_list.xml`,
					);
					if (PatchErrno) {
						errorLogging.push({
							type: 'patchAutoUI2DeployXML',
							name: '[定制模式]应用布局优化 2.0 配置（patch_rule/autoui2_list.xml）',
							message: PatchStderr,
						});
					} else {
						successLogging.push({
							type: 'patchAutoUI2DeployXML',
							name: '[定制模式]应用布局优化 2.0 配置（patch_rule/autoui2_list.xml）',
							message: '更新成功',
						});
					}
				} else if (params.shouldDeletePatchRule) {
					const {
						errno: RmErrno,
						stdout: RmStdout,
						stderr: RmStderr,
					}: ExecResults = await exec(
						`rm -f /data/adb/Hyper_MagicWindow/patch_rule/autoui2_list.xml`,
					);
					if (RmErrno) {
						errorLogging.push({
							type: 'patchAutoUI2DeployXML',
							name: '[定制模式]应用布局优化 2.0 配置（patch_rule/autoui2_list.xml）',
							message: RmStderr,
						});
					} else {
						successLogging.push({
							type: 'patchAutoUI2DeployXML',
							name: '[定制模式]应用布局优化 2.0 配置（patch_rule/autoui2_list.xml）',
							message: '配置为空，文件已删除',
						});
					}
				}

				const [UpdateRuleStderr, UpdateRuleStdout] = await $to<string, string>(deviceApi.updateRule('miui_auto_ui'));

				if (UpdateRuleStderr) {
					errorLogging.push({
						type: 'updateAutoUI2Rule',
						name: '[模块]重新载入应用布局优化规则',
						message: UpdateRuleStderr,
					});
				}

				if (UpdateRuleStdout) {
					successLogging.push({
						type: 'updateAutoUI2Rule',
						name: '[模块]重新载入应用布局优化规则',
						message: UpdateRuleStdout.split('\n'),
					});
				}

				if (params.reloadRuleAction) {
					const {
						errno: ReloadActionErrno,
						stdout: SwitchActionStdout,
						stderr: ReloadActionStderr,
					}: ExecResults = await exec(
						`cmd ${deviceStore.androidTargetSdk >= 36 ? `miui.appadaptation autoui` : `miui_auto_ui`} ${params.reloadRuleAction.action} ${params.reloadRuleAction.name}`,
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
						errorLogging,
						successLogging,
					});
				} else {
					resolve({
						type: 'success',
						message: '更新成功',
						errorLogging,
						successLogging,
					});
				}
			}
		}),
	);
};
