import { exec, spawn, fullScreen, toast, moduleInfo, type ExecResults } from '@/utils/kernelsu/index.js';
import axios from 'axios';
import handlePromiseWithLogging from '@/utils/handlePromiseWithLogging';
import $to from 'await-to-js';
import { useDeviceStore } from '@/stores/device';
import { useLogsStore } from '@/stores/logs';
import type DotBlackListItem from '@/types/DotBlackListItem';
import { cloneDeep } from 'lodash-es';

export interface AndroidAppPackageJobsResult extends Omit<ExecResults, 'stdout'> {
	stdout: number;
}

export const getProjectTrebleSystemDotBlackList = (): Promise<string[]> => {
	const shellCommon = `cat /product/etc/dot_black_list.json`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/system/project_treble_dot_black_list.json');
				const jsonText = response.data; // 这是 XML 内容
				resolve(jsonText as unknown as string[]);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				if (errno) {
					reject(stderr);
				} else {
					if (stdout) {
						try {
							resolve(JSON.parse(stdout));
						} catch (err) {
							reject('dot_black_list config is empty');
						}
					} else {
						reject(null);
					}
				}
			}
		}),
		shellCommon,
	);
};

export const getProjectTrebleCustomDotBlackList = (): Promise<string[]> => {
	const shellCommon = `cat /data/system/dot_black_list.json`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/custom/dot_black_list.json');
				const jsonText = response.data; // 这是 XML 内容
				resolve(jsonText as unknown as string[]);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				if (errno) {
					reject(stderr);
				} else {
					if (stdout) {
						try {
							resolve(JSON.parse(stdout));
						} catch (err) {
							reject('dot_black_list config is empty');
						}
					} else {
						reject(null);
					}
				}
			}
		}),
		shellCommon,
	);
};

export const getIsSupportProjectTrebleCustomDotBlackList = (): Promise<string> => {
	const shellCommon = `getprop ro.config.sothx_project_treble_support_custom_dot_black_list`;
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

export const getIsEnableProjectTrebleCustomDotBlackList = (): Promise<string> => {
	const shellCommon = `settings get system sothx_project_treble_custom_dot_black_list_enable`;
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

export const putIsEnableProjectTrebleCustomDotBlackList = (mode: 1 | 0): Promise<string> => {
	const shellCommon = `settings put system sothx_project_treble_custom_dot_black_list_enable ${mode}`;
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

export const getMiuiFreeformCloudDataIdList = (): Promise<string[]> => {
	const sqlite3 = '/data/adb/modules/MIUI_MagicWindow+/common/utils/sqlite3';
	const HTMLViewerCloudDataDataBase = `/data/user_de/0/com.android.htmlviewer/databases/cloud_all_data.db`;
	const shellCommon = `echo "$(${sqlite3} ${HTMLViewerCloudDataDataBase} "SELECT dataId FROM cloud_all_data WHERE moduleName='MiuiFreeform';")"`;
	return new Promise(async (resolve, reject) => {
		if (import.meta.env.MODE === 'development') {
			resolve(['1211629', '1210869']);
		} else {
			const { errno, stdout, stderr }: ExecResults = (await exec(shellCommon)) as unknown as ExecResults;
			if (errno) {
				reject(stderr);
			}
			if (stdout) {
				try {
					const ids = stdout.split('\n');
					resolve(ids);
				} catch (err) {
					reject(err);
				}
			}
		}
	});
};

export const getCustomDotBlackList = (): Promise<string[]> => {
	const shellCommon = `cat /data/adb/MIUI_MagicWindow+/config/dot_black_list.json`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/custom/dot_black_list.json');
				const jsonText = response.data; // 这是 XML 内容
				resolve(jsonText as unknown as string[]);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				if (errno) {
					reject(stderr);
				} else {
					if (stdout) {
						try {
							resolve(JSON.parse(stdout));
						} catch (err) {
							reject('dot_black_list config is empty');
						}
					} else {
						reject(null);
					}
				}
			}
		}),
		shellCommon,
	);
};

export const getDotBlackList = (): Promise<DotBlackListItem[]> => {
	const sqlite3 = '/data/adb/modules/MIUI_MagicWindow+/common/utils/sqlite3';
	const HTMLViewerCloudDataBase = `/data/user_de/0/com.android.htmlviewer/databases/cloud_all_data.db`;
	return new Promise(async (resolve, reject) => {
		if (import.meta.env.MODE === 'development') {
			const response = await axios.get('/data/system/dot_black_list.json');
			resolve(response.data as unknown as DotBlackListItem[]);
		} else {
			const [getMiuiFreeformCloudDataIdListErr, getMiuiFreeformCloudDataIdListRes] = await $to<string[], string>(
				getMiuiFreeformCloudDataIdList(),
			);
			if (getMiuiFreeformCloudDataIdListErr) {
				reject(getMiuiFreeformCloudDataIdListErr);
			}
			if (getMiuiFreeformCloudDataIdListRes) {
				const fetchDataById = async (dataId: string): Promise<DotBlackListItem> => {
					const shellCommon = `echo "$(${sqlite3} ${HTMLViewerCloudDataBase} "SELECT productData FROM cloud_all_data WHERE dataId='${dataId}';")"`;
					return handlePromiseWithLogging(
						new Promise(async (fetchDataByIdResolve, fetchDataByIdReject) => {
							const { errno, stdout, stderr }: ExecResults = (await exec(
								shellCommon,
							)) as unknown as ExecResults;
							if (errno) {
								fetchDataByIdReject(stderr);
							}
							if (stdout) {
								try {
									const cloudFeatucteData = JSON.parse(stdout);
									if (cloudFeatucteData.dot_black_list) {
										fetchDataByIdResolve({
											dataId: Number(dataId),
											productData: cloudFeatucteData || {},
											dataList: cloudFeatucteData.dot_black_list || [],
										});
									} else {
										fetchDataByIdResolve({
											dataId: Number(dataId),
											productData: cloudFeatucteData || {},
											dataList: [],
										});
									}
								} catch (err) {
									fetchDataByIdReject(err);
								}
							}
						}),
						shellCommon,
					);
				};
				const [getDotBlackListErr, getDotBlackListRes] = await $to(
					Promise.all(getMiuiFreeformCloudDataIdListRes.map(dataId => fetchDataById(dataId))),
				);
				if (getDotBlackListErr) {
					reject(getDotBlackListErr);
				}
				if (getDotBlackListRes) {
					resolve(getDotBlackListRes);
				}
			}
		}
	});
};

export interface updateDotBlackListAppErrorLoggingItem {
	type: string;
	name: string;
	message: string | string[];
}

export interface updateDotBlackListAppSuccessLoggingItem {
	type: string;
	name: string;
	message: string | string[];
}

export interface updateDotBlackListAppParams {
	dotBlackList: string[];
	sourceDotBlackList: DotBlackListItem[];
	customDotBlackList: string[];
}

export interface updateProjectTrebleDotBlackListAppParams {
	dotBlackList: string[];
	systemDotBlackList: string[];
	customDotBlackList: string[];
}

export const getHasHTMLViewerCloudDataBase = (): Promise<string> => {
	const shellCommon = `ls /data/user_de/0/com.android.htmlviewer/databases/cloud_all_data.db &>/dev/null && echo "exists" || echo "not exists"`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`exists`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : stdout === 'exists' ? resolve(stdout) : reject(stdout);
			}
		}),
		'getHasHTMLViewerCloudDataBase',
	);
};

export const updateProjectTrebleDotBlackList = (
	params: updateProjectTrebleDotBlackListAppParams,
): Promise<{
	type: 'success' | 'error';
	message: string;
	errorLogging?: updateDotBlackListAppErrorLoggingItem[]; // 错误日志记录
	successLogging?: updateDotBlackListAppSuccessLoggingItem[]; // 成功日志记录
}> => {
	const errorLogging: updateDotBlackListAppErrorLoggingItem[] = [];
	const successLogging: updateDotBlackListAppSuccessLoggingItem[] = [];
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
				const uniqueCustomDotBlackList = Array.from(new Set(params.customDotBlackList));
				const fetchCustomList = async (dotBlackList: string[]): Promise<string> => {
					const shellCommon = `echo '${JSON.stringify(dotBlackList)}' > /data/adb/MIUI_MagicWindow+/config/dot_black_list.json`;
					return handlePromiseWithLogging(
						new Promise(async (fetchCustomListResolve, fetchCustomListReject) => {
							const { errno, stdout, stderr }: ExecResults = (await exec(
								shellCommon,
							)) as unknown as ExecResults;
							if (errno) {
								errorLogging.push({
									type: 'updateCustomDotBlackListJSON',
									name: '[自定义规则]窗口控制器配置文件',
									message: stderr,
								});
								fetchCustomListReject(stderr);
							} else {
								successLogging.push({
									type: 'updateCustomDotBlackListJSON',
									name: '[自定义规则]窗口控制器配置文件',
									message: '更新成功',
								});
								fetchCustomListResolve(stdout);
							}
						}),
						shellCommon,
					);
				};
				const [updateCustomDotBlackListErr, updateCustomDotBlackListRes] = await $to(
					fetchCustomList(uniqueCustomDotBlackList),
				);
				if (updateCustomDotBlackListErr) {
					reject(updateCustomDotBlackListErr);
				}
				const uniqueDotBlackList = Array.from(new Set(params.dotBlackList));
				const fetchList = async (dotBlackList: string[]): Promise<string> => {
					const shellCommon = `echo '${JSON.stringify(dotBlackList)}' > /data/system/dot_black_list.json`;
					return handlePromiseWithLogging(
						new Promise(async (fetchListResolve, fetchListReject) => {
							const { errno, stdout, stderr }: ExecResults = (await exec(
								shellCommon,
							)) as unknown as ExecResults;
							if (errno) {
								errorLogging.push({
									type: 'updateDotBlackListJSON',
									name: '[模块]窗口控制器配置文件',
									message: stderr,
								});
								fetchListReject(stderr);
							} else {
								successLogging.push({
									type: 'updateDotBlackListJSON',
									name: '[模块]窗口控制器配置文件',
									message: '更新成功',
								});
								fetchListResolve(stdout);
							}
						}),
						shellCommon,
					);
				};
				const [updateDotBlackListResErr, updateDotBlackListRes] = await $to(
					fetchList(uniqueDotBlackList),
				);
				if (updateDotBlackListResErr) {
					reject(updateDotBlackListResErr);
				}
				resolve({
					type: 'success',
					message: '更新成功',
					errorLogging,
					successLogging, // 返回一个空的成功日志
				});
			}
		}),
		'updateProjectTrebleDotBlackList',
	);
};

export const updateDotBlackList = (
	params: updateDotBlackListAppParams,
): Promise<{
	type: 'success' | 'error';
	message: string;
	errorLogging?: updateDotBlackListAppErrorLoggingItem[]; // 错误日志记录
	successLogging?: updateDotBlackListAppSuccessLoggingItem[]; // 成功日志记录
}> => {
	const sqlite3 = '/data/adb/modules/MIUI_MagicWindow+/common/utils/sqlite3';
	const HTMLViewerCloudDataBase = `/data/user_de/0/com.android.htmlviewer/databases/cloud_all_data.db`;
	const errorLogging: updateDotBlackListAppErrorLoggingItem[] = [];
	const successLogging: updateDotBlackListAppSuccessLoggingItem[] = [];
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
				const uniqueCustomDotBlackList = Array.from(new Set(params.customDotBlackList));
				const fetchCustomList = async (dotBlackList: string[]): Promise<string> => {
					const shellCommon = `echo '${JSON.stringify(dotBlackList)}' > /data/adb/MIUI_MagicWindow+/config/dot_black_list.json`;
					return handlePromiseWithLogging(
						new Promise(async (fetchCustomListResolve, fetchCustomListReject) => {
							const { errno, stdout, stderr }: ExecResults = (await exec(
								shellCommon,
							)) as unknown as ExecResults;
							if (errno) {
								errorLogging.push({
									type: 'updateCustomDotBlackListJSON',
									name: '[自定义规则]窗口控制器配置文件',
									message: stderr,
								});
								fetchCustomListReject(stderr);
							} else {
								successLogging.push({
									type: 'updateCustomDotBlackListJSON',
									name: '[自定义规则]窗口控制器配置文件',
									message: '更新成功',
								});
								fetchCustomListResolve(stdout);
							}
						}),
						shellCommon,
					);
				};
				const [updateCustomDotBlackListErr, updateCustomDotBlackListRes] = await $to(
					fetchCustomList(uniqueCustomDotBlackList),
				);
				if (updateCustomDotBlackListErr) {
					reject(updateCustomDotBlackListErr);
				} else {
					const featchDataList = params.sourceDotBlackList.map(item => {
						const cloneDeepProductData = cloneDeep(item.productData);
						cloneDeepProductData.dot_black_list = params.dotBlackList;
						return {
							dataId: item.dataId,
							productData: cloneDeepProductData,
						};
					});
					const fetchDataById = async (dataId: number, productData: any): Promise<string> => {
						const shellCommon = `echo "$(${sqlite3} ${HTMLViewerCloudDataBase} "UPDATE cloud_all_data SET productData='${JSON.stringify(productData).replace(/"/g, '\\"')}' WHERE dataId='${dataId}'; SELECT changes();")"`;
						return handlePromiseWithLogging(
							new Promise(async (fetchDataByIdResolve, fetchDataByIdReject) => {
								const { errno, stdout, stderr }: ExecResults = (await exec(
									shellCommon,
								)) as unknown as ExecResults;
								if (errno) {
									fetchDataByIdReject(stderr);
								} else {
									stdout === '1' ? fetchDataByIdResolve(stdout) : fetchDataByIdReject(stdout);
								}
							}),
							shellCommon,
						);
					};
					const [updateDotBlackListErr, updateDotBlackListRes] = await $to(
						Promise.all(featchDataList.map(item => fetchDataById(item.dataId, item.productData))),
					);
					if (updateDotBlackListErr) {
						reject(updateDotBlackListErr);
					}
					if (updateDotBlackListRes) {
						resolve({
							type: 'success',
							message: '更新成功',
							errorLogging,
							successLogging, // 返回一个空的成功日志
						});
					}
				}
			}
		}),
		'updateDotBlackList',
	);
};
