import { ref, reactive, computed, watchEffect } from 'vue';
import { defineStore } from 'pinia';
import $to from 'await-to-js';
import * as deviceApi from '@/apis/deviceApi';
import type { ErrorLogging } from '@/types/ErrorLogging';
import type { InstallAppNameListDictionary } from '@/hooks/useInstalledAppNames';
import { useAmktiao, type KeyboardMode, type KeyboardModeOptions } from '@/hooks/useAmktiao';
import { parsePropContent } from '@/utils/common';
import { transformValues } from '@/utils/xmlFormat';


export interface ModuleProp {
	id: string;
	name: string;
	version: string;
	versionCode: number;
	author: string;
	description: string;
	updateJson: string;
	dir: string;
}

export interface UpdateInfo {
	version: string;
	versionCode: number;
	zipUrl: string;
	changelog: string;
}

export interface ROOTManagerInfo {
	KSU: boolean;
	KSU_VER: string;
	KSU_VER_CODE: number;
	KSU_KERNEL_VER_CODE: number;
	APATCH: boolean;
	APATCH_VER_CODE: number;
	APATCH_VER: number;
	MAGISK_VER: string;
	MAGISK_VER_CODE: string;
}

export interface BatteryInfo {
	sohQcom: number
	sohMTK: number
	chargeFullDesign: number
	chargeFull: number
	cycleCount: number
}

export interface ShamikoInfo {
	installed: boolean;
	mode?: 'whitelist' | 'blacklist';
}

export interface deviceInfo {
	socName?: string
	socModel?: string
	display0Panel?: string
	memoryInfo?: string
}

export type ROOT_MANAGER_TYPE = 'Magisk' | 'APatch' | 'KernelSU';

export const useDeviceStore = defineStore(
	'device',
	() => {
		const deviceCharacteristics = ref<string>();
		const androidTargetSdk = ref<number>();
		const MIOSVersion = ref<number>();
		const deviceInfo = reactive<deviceInfo>({
			socName: '',
			socModel: '',
			display0Panel: '',
			memoryInfo: ''
		})
		const lastVersionCode = ref<number>();
		const needReloadData = ref<boolean>(false);
		const moduleInfo = ref<ModuleProp>();
		const hasPenUpdateControl = ref<boolean>(false);
		const hasPenEnableControl = ref<boolean>(false);
		const hasKeyboardControl = ref<boolean>(false);
		const enabledMiuiDesktopMode = ref<boolean>(false);
		const windowWidth = ref(window.innerWidth);
		const isEnableShowNotificationIconNum = ref<boolean>(false);
		const deviceName = ref<string>('');
		const installedAndroidApplicationPackageNameList = ref<string[]>([]);
		const installedAppNameList = ref<InstallAppNameListDictionary>({});
		const systemVersion = ref<string>('');
		const systemPreVersion = ref<string>('');
		const currentRootManager = ref<ROOT_MANAGER_TYPE>('Magisk');
		const hasNeedUpdateModule = ref<boolean>(false);
		const shamikoInfo =  reactive<ShamikoInfo>({
			installed: false,
			mode: undefined
		})
		const rootManagerInfo = reactive<ROOTManagerInfo>({
			KSU: false,
			KSU_VER: '',
			KSU_VER_CODE: 0,
			KSU_KERNEL_VER_CODE: 0,
			APATCH: false,
			APATCH_VER_CODE: 0,
			APATCH_VER: 0,
			MAGISK_VER: '',
			MAGISK_VER_CODE: '',
		});
		const batteryInfo = reactive<BatteryInfo>({
			sohQcom: 0,
			sohMTK:0,
			chargeFullDesign: 0,
			chargeFull: 0,
			cycleCount: 0
		})
		const ABTestInfo = reactive({
			OS2_PAD_EMBEDDED_APP_MANAGER: true,
			Hyper_OS_DOT_BLACK_LIST_MANAGER: true,
			GAME_BOOSTER_RADIO_MANAGER: true,
			GAME_BOOSTER_CUSTOM_RATIO: false
		})
		const smartFocusIO = ref<deviceApi.SmartFocusIOResult['stdout']>();
		const miuiCompatEnable = ref<boolean>(false);
		const miuiAppCompatEnable = ref<boolean>(false);
		const showRotationSuggestions = ref<boolean>(false);
		const isDarkMode = ref<boolean>(false);
		const rhythmMode = ref<string>('autoRhythm');
		const loading = ref<boolean>(true);
		const errorLogging = reactive<ErrorLogging[]>([]);
		const skipConfirm = reactive({
			GameMode: false,
			MIUIContentExt: false,
			lowWebViewVersion: false,
			patchModeAlert: false,
		});
		const showThirdPartySetting = reactive({
			amktiaoROMInterface: false
		})

		const isNeedShowErrorModal = computed(() => Boolean(errorLogging.length > 0));

		async function getAndroidApplicationPackageNameList() {
			return new Promise(async (resolve, reject) => {
				// 获取用户已安装的应用包名
				const [getAndroidApplicationPackageNameListErr, getAndroidApplicationPackageNameListRes] = await $to<
					string,
					string
				>(deviceApi.getAndroidApplicationPackageNameList());
				if (getAndroidApplicationPackageNameListErr) {
					errorLogging.push({
						type: 'getAndroidApplicationPackageNameListErr',
						title: '获取用户已安装的应用包名',
						msg: getAndroidApplicationPackageNameListErr,
					});
					reject(getAndroidApplicationPackageNameListErr);
				} else {
					if (getAndroidApplicationPackageNameListRes) {
						installedAndroidApplicationPackageNameList.value =
							getAndroidApplicationPackageNameListRes?.split(',');
					}
					resolve(installedAndroidApplicationPackageNameList.value);
				}
			});
		}

		async function initDefault() {
			const executeWithoutWaiting = [
				// 模块信息 *弱校验
				$to<string, string>(deviceApi.getModuleInfo()),
				// 设备名称
				$to<string, string>(deviceApi.getDeviceName()),
				// ROOT管理器信息 *弱校验
				$to<string, string>(deviceApi.getRootManagerInfo()),
				// Shamiko安装状态 *弱校验
				$to<string, string>(deviceApi.getShamikoHasInstalled()),
				// 系统版本
				$to<string, string>(deviceApi.getSystemVersion()),
				// 上个系统版本
				$to<string, string>(deviceApi.getPreSystemVersion()),
				// 售后电池健康度
				$to<string, string>(deviceApi.getBatterySohQcom()),
				$to<string, string>(deviceApi.getBatterySohMTK()),
				// 电池设计容量
				$to<string, string>(deviceApi.getBatteryChargeFullDesign()),
				// 当前电池容量
				$to<string, string>(deviceApi.getBatteryChargeFull()),
				// 电池循环次数
				$to<string, string>(deviceApi.getBatteryCycleCount()),
				// 触控笔控制(水龙)
				$to<string, string>(deviceApi.getHasPenUpdateControl()),
				$to<string, string>(deviceApi.getHasPenEnableControl()),
				// 键盘控制(水龙)
				$to<string, string>(deviceApi.getHasKeyboardControl()),
				// 工作台模式判断
				$to<string,string>(deviceApi.getMiuiDesktopModeEnabled()),
				// 设备Soc名称
				$to<string,string>(deviceApi.getDeviceSocName()),
				// 设备Soc类型
				$to<string,string>(deviceApi.getDeviceSocModel()),
				// 设备显示器信息
				$to<string,string>(deviceApi.getDisplay0PanelInfo()),
				// 设备UFS信息
				$to<string,string>(deviceApi.getMemoryInfo()),
			];
			// 等待所有 promises 完成
			const executeWithoutWaitingResults = await Promise.all(executeWithoutWaiting);
			const [
				[, getModuleInfoRes],
				[, getDeviceNameRes],
				[, getRootManagerInfo],
				[,getShamikoHasInstalledRes],
				[, getSystemVersionRes],
				[, getPreSystemVersionRes],
				[, getBatterySohQcomRes],
				[, getBatterySohMTKRes],
				[, getBatteryChargeFullDesignRes],
				[, getBatteryChargeFullRes],
				[, getBatteryCycleCountRes],
				[, getHasPenUpdateControlRes],
				[, getHasPenEnableControlRes],
				[, getHasKeyboardControlRes],
				[, getMiuiDesktopModeEnabledRes],
				[, getDeviceSocNameRes],
				[, getDeviceSocModelRes],
				[, getDisplay0PanelInfo],
				[, getMemoryInfo],
			] = executeWithoutWaitingResults;
			// 模块信息 *弱校验
			if (!getModuleInfoRes?.length) {
				errorLogging.push({
					type: 'moduleInfo',
					title: '模块信息',
					msg: '获取模块信息失败',
				});
			}
			if (getModuleInfoRes?.length) {
				const moduleInfoParse = transformValues({
					...parsePropContent(getModuleInfoRes),
					dir: '/data/adb/modules/MIUI_MagicWindow+'
				}) as unknown as ModuleProp
				if (moduleInfoParse.versionCode) {
					if (!lastVersionCode.value) {
						lastVersionCode.value = moduleInfoParse.versionCode
					} else if (lastVersionCode.value < moduleInfoParse.versionCode) {
						needReloadData.value = true;
						lastVersionCode.value = moduleInfoParse.versionCode
					}
				}
				moduleInfo.value = moduleInfoParse
				// moduleDir.value = moduleInfoObj.moduleDir;
				// moduleID.value = moduleInfoObj.id;
			}
			// 设备名称
			deviceName.value = getDeviceNameRes || '';
			// 系统版本
			systemVersion.value = getSystemVersionRes || '';
			// 上个系统版本
			systemPreVersion.value = getPreSystemVersionRes || '';
			// ROOT管理器信息
			if (getRootManagerInfo?.length) {
				const rootManagerStrArr: string[] = getRootManagerInfo.split(',');
				rootManagerInfo.KSU = rootManagerStrArr[0] === 'true';
				rootManagerInfo.KSU_VER = rootManagerStrArr[1];
				rootManagerInfo.KSU_VER_CODE = parseInt(rootManagerStrArr[2], 10);
				rootManagerInfo.KSU_KERNEL_VER_CODE = parseInt(rootManagerStrArr[3], 10);
				rootManagerInfo.APATCH = rootManagerStrArr[4] === 'true';
				rootManagerInfo.APATCH_VER_CODE = parseInt(rootManagerStrArr[5], 10);
				rootManagerInfo.APATCH_VER = parseInt(rootManagerStrArr[6], 10);
				rootManagerInfo.MAGISK_VER = rootManagerStrArr[7];
				rootManagerInfo.MAGISK_VER_CODE = rootManagerStrArr[8];
				if (rootManagerInfo.KSU) {
					currentRootManager.value = 'KernelSU';
				} else if (rootManagerInfo.APATCH) {
					currentRootManager.value = 'APatch';
				} else {
					currentRootManager.value = 'Magisk';
				}
			}
			// Shamiko控制
			if (getShamikoHasInstalledRes) {
				shamikoInfo.installed = true;
				const [getShamikoModeReject, getShamikoModeResolve] = await $to<string, string>(
					deviceApi.getShamikoMode(),
				);
				if (getShamikoModeResolve === 'whitelist') {
					shamikoInfo.mode = 'whitelist';
				}

				if (getShamikoModeReject) {
					shamikoInfo.mode = 'blacklist';
				}

			}
			// 移植包键盘和手写笔控制
			if (getHasPenUpdateControlRes) {
				hasPenUpdateControl.value = true;
			}
			if (getHasPenEnableControlRes) {
				hasPenEnableControl.value = true;
			}
			if (getHasKeyboardControlRes) {
				hasKeyboardControl.value = true;
			}
			if (getMiuiDesktopModeEnabledRes) {
				enabledMiuiDesktopMode.value = true;
			}
			// 售后电池健康度
			batteryInfo.sohQcom = Number(getBatterySohQcomRes)
			batteryInfo.sohMTK = Number(getBatterySohMTKRes)
			// 电池设计容量
			batteryInfo.chargeFullDesign = Number(getBatteryChargeFullDesignRes)
			// 当前电池容量
			batteryInfo.chargeFull = Number(getBatteryChargeFullRes)
			// 当前电池循环次数
			batteryInfo.cycleCount = Number(getBatteryCycleCountRes)
			// 获取用户已安装的应用
			await getAndroidApplicationPackageNameList();
			// 设备类型 *强校验
			const [getDeviceCharacteristicsErr, getDeviceCharacteristicsRes] = await $to<string, string>(
				deviceApi.getDeviceCharacteristics(),
			);
			if (getDeviceCharacteristicsErr) {
				errorLogging.push({
					type: 'deviceCharacteristics',
					title: '设备类型',
					msg: getDeviceCharacteristicsErr,
				});
			} else {
				deviceCharacteristics.value = getDeviceCharacteristicsRes;
			}
			// 旋转建议提示按钮 *强校验
			const [getRotationSuggestionsErr, getRotationSuggestionsRes] = await $to<string, string>(
				deviceApi.getRotationSuggestions(),
			);
			if (getRotationSuggestionsErr) {
				errorLogging.push({
					type: 'rotationSuggestions',
					title: '旋转建议提示按钮',
					msg: getRotationSuggestionsErr,
				});
			} else {
				showRotationSuggestions.value = Number(getRotationSuggestionsRes) === 1 ? true : false;
			}
			// Android Target SDK Version *强校验
			const [getAndroidTargetSdkErr, getAndroidTargetSdkRes] = await $to<number, string>(
				deviceApi.getAndroidTargetSdk(),
			);
			if (getAndroidTargetSdkErr) {
				errorLogging.push({
					type: 'androidTargetSdk',
					title: 'Android SDK版本',
					msg: getAndroidTargetSdkErr,
				});
			} else {
				androidTargetSdk.value = getAndroidTargetSdkRes;
			}
			// 设备Soc类型 *弱校验
			if (getDeviceSocModelRes) {
				deviceInfo.socModel = getDeviceSocModelRes;
			}
			// 设备Soc名称 *弱校验
			if (getDeviceSocNameRes) {
				deviceInfo.socName = getDeviceSocNameRes;
			}
			// 设备显示器信息
			if (getDisplay0PanelInfo) {
				deviceInfo.display0Panel = getDisplay0PanelInfo;
			}
			// 设备UFS信息
			if (getMemoryInfo) {
				deviceInfo.memoryInfo = getMemoryInfo;
			}
			// 游戏显示布局 *弱校验
			const [, getMiuiCompatEnableRes] = await $to(deviceApi.getMiuiCompatEnable());
			if (getMiuiCompatEnableRes && getMiuiCompatEnableRes === 'true') {
				miuiCompatEnable.value = true;
			}
			const [, getMiuiAppCompatEnableRes] = await $to(deviceApi.getMiuiAppCompatEnable());
			if (getMiuiAppCompatEnableRes && getMiuiCompatEnableRes === 'true') {
				miuiAppCompatEnable.value = true;
			}
			// Xiaomi Hyper OS 版本号 *弱校验
			const [, getMIOSVersionRes] = await $to<number, string>(deviceApi.getMIOSVersion());
			if (getMIOSVersionRes) {
				MIOSVersion.value = getMIOSVersionRes;
			}

			// 智能IO调度 *弱校验
			const [, getSmartFocusIO] = await $to<deviceApi.SmartFocusIOResult['stdout'], string>(
				deviceApi.getSmartFocusIO(),
			);
			if (getSmartFocusIO) {
				smartFocusIO.value = getSmartFocusIO;
			}

			if (!errorLogging.length) {
				loading.value = false;
			}
		}

		return {
			deviceCharacteristics,
			isNeedShowErrorModal,
			androidTargetSdk,
			MIOSVersion,
			shamikoInfo,
			moduleInfo,
			systemVersion,
			systemPreVersion,
			deviceName,
			deviceInfo,
			batteryInfo,
			lastVersionCode,
			needReloadData,
			smartFocusIO,
			showRotationSuggestions,
			installedAndroidApplicationPackageNameList,
			getAndroidApplicationPackageNameList,
			miuiCompatEnable,
			miuiAppCompatEnable,
			installedAppNameList,
			skipConfirm,
			showThirdPartySetting,
			currentRootManager,
			rootManagerInfo,
			errorLogging,
			loading,
			isDarkMode,
			windowWidth,
			rhythmMode,
			initDefault,
			ABTestInfo,
			hasPenUpdateControl,
			hasPenEnableControl,
			hasKeyboardControl,
			hasNeedUpdateModule,
			enabledMiuiDesktopMode,
			isEnableShowNotificationIconNum
		};
	},
	{
		persist: {
			pick: ['skipConfirm', 'installedAndroidApplicationPackageNameList', 'isDarkMode', 'rhythmMode','ABTestInfo','installedAppNameList','lastVersionCode','showThirdPartySetting'],
		},
	},
);
