import { exec, spawn, fullScreen, toast, moduleInfo, type ExecResults } from '@/utils/kernelsu/index.js';
import axios from 'axios';
import handlePromiseWithLogging from '@/utils/handlePromiseWithLogging';
import $to from 'await-to-js';
import { useDeviceStore } from '@/stores/device';
import { useLogsStore } from '@/stores/logs';
import type DotBlackListItem from '@/types/DotBlackListItem';
import { cloneDeep } from 'lodash-es';
import type GameBoosterTableItem from '@/types/GameBoosterTableItem';

export interface SmartFocusIOResult extends ExecResults {
	stdout: 'on' | 'off';
}

export interface AndroidAppPackageJobsResult extends Omit<ExecResults, 'stdout'> {
	stdout: number;
}

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
				}

				if (stdout) {
					try {
						resolve(JSON.parse(stdout));
					} catch (err) {
						reject(err);
					}
				}
			}
		}),
		shellCommon,
	);
};

export const getGameBoosterList = (): Promise<GameBoosterTableItem[]> => {
	const sqlite3 = '/data/adb/modules/MIUI_MagicWindow+/common/utils/sqlite3';
	const GameBoosterDataBase = `/data/data/com.miui.securitycenter/databases/gamebooster.db`;
	const shellCommon = `echo "$(${sqlite3} ${GameBoosterDataBase} "SELECT * FROM gamebooster_table WHERE package_name!='none';")"`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				const response = await axios.get('/data/system/gamebooster_table.json');
				const jsonText = response.data; // 这是 XML 内容
				resolve(jsonText as unknown as GameBoosterTableItem[]);
			} else {
				const { errno, stdout, stderr }: ExecResults = (await exec(
					shellCommon,
				)) as unknown as ExecResults;
				if (errno) {
					reject(stderr);
				}
				if (stdout) {
					try {
						const gameBoosterData = JSON.parse(stdout);
						resolve(gameBoosterData)
					} catch (err) {
						reject(err);
					}
				}
			}
		}),
		shellCommon,
	);
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

export const getHasGameBoosterDataBase = (): Promise<string> => {
	const shellCommon = `test -f /data/data/com.miui.securitycenter/databases/gamebooster.db && echo "exists" || echo "not exists"`;
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

export const updateGameRatio = (packageName:GameBoosterTableItem['package_name'],gameRatio: GameBoosterTableItem['game_ratio']): Promise<string> => {
	const sqlite3 = '/data/adb/modules/MIUI_MagicWindow+/common/utils/sqlite3';
	const GameBoosterDataBase = `/data/data/com.miui.securitycenter/databases/gamebooster.db`;
	const shellCommon = `echo "$(${sqlite3} ${GameBoosterDataBase} "UPDATE gamebooster_table SET game_ratio='${gameRatio}' WHERE package_name='${packageName}';")"`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`1`);
			} else {
				const { errno, stdout, stderr }: ExecResults = (await exec(
					shellCommon,
				)) as unknown as ExecResults;
				if (errno) {
					reject(stderr);
				}
				if (stdout) {
					stdout === '1' ? resolve(stdout) : reject(stdout)
				}
			}
		}),
		shellCommon,
	);
};


export const updateGameGravity = (packageName:GameBoosterTableItem['package_name'],gameGravity: GameBoosterTableItem['game_gravity']): Promise<string> => {
	const sqlite3 = '/data/adb/modules/MIUI_MagicWindow+/common/utils/sqlite3';
	const GameBoosterDataBase = `/data/data/com.miui.securitycenter/databases/gamebooster.db`;
	const shellCommon = `echo "$(${sqlite3} ${GameBoosterDataBase} "UPDATE gamebooster_table SET game_gravity='${gameGravity}' WHERE package_name='${packageName}';")"`;
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`1`);
			} else {
				const { errno, stdout, stderr }: ExecResults = (await exec(
					shellCommon,
				)) as unknown as ExecResults;
				if (errno) {
					reject(stderr);
				}
				if (stdout) {
					stdout === '1' ? resolve(stdout) : reject(stdout)
				}
			}
		}),
		shellCommon,
	);
};

