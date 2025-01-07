import { exec, spawn, fullScreen, toast, moduleInfo, type ExecResults } from '@/utils/kernelsu/index.js';
import axios from 'axios';
import handlePromiseWithLogging from '@/utils/handlePromiseWithLogging';
import type GameBoosterTableItem from '@/types/GameBoosterTableItem';

export interface SmartFocusIOResult extends ExecResults {
	stdout: 'on' | 'off';
}

export interface AndroidAppPackageJobsResult extends Omit<ExecResults, 'stdout'> {
	stdout: number;
}

export const getGameBoosterList = (): Promise<GameBoosterTableItem[]> => {
	const sqlite3 = '/data/adb/modules/MIUI_MagicWindow+/common/utils/sqlite3';
	const GameBoosterDataBase = `/data/data/com.miui.securitycenter/databases/gamebooster.db`;
	const shellCommon = `echo "$(${sqlite3} ${GameBoosterDataBase} "SELECT * FROM gamebooster_table WHERE package_name!='none';" -json)"`;
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
				} else {
					reject(errno)
				}
			}
		}),
		shellCommon,
	);
};

export const openAddGame = ():Promise<string> => {
	const shellCommon = `am start -n com.miui.securitycenter/com.miui.gamebooster.ui.SelectGameLandActivity`
	return handlePromiseWithLogging(
		new Promise(async (resolve, reject) => {
			if (import.meta.env.MODE === 'development') {
				resolve(`success`);
			} else {
				const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
				errno ? reject(stderr) : resolve(stdout)
			}
		}),
		shellCommon,
	);
}

export const updateGameRatioSetting = (packageName:GameBoosterTableItem['package_name'],gameRatio: GameBoosterTableItem['game_ratio'], gameGravity:GameBoosterTableItem['game_gravity']): Promise<string> => {
	const sqlite3 = '/data/adb/modules/MIUI_MagicWindow+/common/utils/sqlite3';
	const GameBoosterDataBase = `/data/data/com.miui.securitycenter/databases/gamebooster.db`;
	const shellCommon = `echo "$(${sqlite3} ${GameBoosterDataBase} "UPDATE gamebooster_table SET game_ratio='${gameRatio}', game_gravity='${gameGravity}' WHERE package_name='${packageName}'; SELECT changes();")"`;
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
					resolve(stdout)
				}
			}
		}),
		shellCommon,
	);
};

