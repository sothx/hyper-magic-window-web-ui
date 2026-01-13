import { exec, spawn, fullScreen, toast, moduleInfo, type ExecResults } from '@/utils/kernelsu/index.js';
import axios from 'axios';
import handlePromiseWithLogging from '@/utils/handlePromiseWithLogging';
import $to from 'await-to-js';
import * as deviceApi from '@/apis/deviceApi';
import { useDeviceStore } from '@/stores/device';
import { useLogsStore } from '@/stores/logs';
import type DotBlackListItem from '@/types/DotBlackListItem';

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
