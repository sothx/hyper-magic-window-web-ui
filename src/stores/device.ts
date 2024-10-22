import { ref, reactive, computed } from "vue";
import { defineStore } from "pinia";
import $to from "await-to-js";
import * as ksuApi from "@/apis/ksuApi";
import type { ErrorLogging } from "@/types/ErrorLogging";

export interface ModuleInfo {
  moduleDir: string;
  id: string;
}

export interface ModuleProp {
  id: string;
  name: string;
  version: string;
  versionCode: number;
  author: string;
  description: string;
  updateJson: string;
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

export type ROOT_MANAGER_TYPE = 'Magisk' | 'APatch' | 'KernelSU'

export const useDeviceStore = defineStore("device", () => {
  const deviceCharacteristics = ref<string>();
  const androidTargetSdk = ref<number>();
  const MIOSVersion = ref<number>();
  const deviceCode = ref<string>();
  const deviceSocName = ref<string>();
  const deviceSocModel = ref<string>();
  const moduleDir = ref<string>();
  const moduleID = ref<string>();
  const deviceName = ref<string>('');
  const systemVersion = ref<string>('');
  const systemPreVersion = ref<string>('');
  const currentRootManager = ref<ROOT_MANAGER_TYPE>('Magisk');
  const moduleProp = reactive<ModuleProp>({
    id: "",
    name: "",
    version: "",
    versionCode: 0,
    author: "",
    description: "",
    updateJson: ""
  });
  const updateInfo = reactive<UpdateInfo>({
    version: "",
    versionCode: 0,
    zipUrl: "",
    changelog: ""
  })
  const rootManagerInfo = reactive<ROOTManagerInfo>({
    KSU: false,
    KSU_VER: "",
    KSU_VER_CODE: 0,
    KSU_KERNEL_VER_CODE: 0,
    APATCH: false,
    APATCH_VER_CODE: 0,
    APATCH_VER: 0,
    MAGISK_VER: "",
    MAGISK_VER_CODE: ""
  })
  const smartFocusIO = ref<ksuApi.SmartFocusIOResult["stdout"]>();
  const miuiCompatEnable = ref<boolean>(false);
  const miuiAppCompatEnable = ref<boolean>(false);
  const showRotationSuggestions = ref<boolean>(false);
  const loading = ref<boolean>(true);
  const errorLogging = reactive<ErrorLogging[]>([]);
  const skipConfirm = reactive({
    GameMode: false,
    MIUIContentExt: false
  });

  const isNeedShowErrorModal = computed(() => Boolean(errorLogging.length > 0));

  async function initDefault() {
    // 模块信息 *弱校验
    const [, getModuleInfoRes] = await $to<string, string>(ksuApi.getModuleInfo());
    if (!getModuleInfoRes?.length) {
      errorLogging.push({
        type: "moduleInfo",
        title: "模块信息",
        msg: '获取模块信息失败',
      });
    }
    if (getModuleInfoRes?.length) {
      const moduleInfoObj: ModuleInfo = JSON.parse(getModuleInfoRes)
      moduleDir.value = moduleInfoObj.moduleDir
      moduleID.value = moduleInfoObj.id
    }
    // 设备名称
    const [, getDeviceNameRes] = await $to<string, string>(ksuApi.getDeviceName());
    deviceName.value = getDeviceNameRes || '';
    // 系统版本
    const [, getSystemVersionRes] = await $to<string, string>(ksuApi.getSystemVersion());
    systemVersion.value = getSystemVersionRes || '';
    const [, getPreSystemVersionRes] = await $to<string, string>(ksuApi.getPreSystemVersion());
    systemPreVersion.value = getPreSystemVersionRes || '';
    // ROOT管理器信息 *弱校验
    const [, getRootManagerInfo] = await $to<string, string>(ksuApi.getRootManagerInfo());
    if (!getRootManagerInfo?.length) {
      errorLogging.push({
        type: "moduleInfo",
        title: "ROOT管理器信息",
        msg: '获取ROOT管理器信息失败',
      });
    }
    if (getRootManagerInfo?.length) {
      const shellCommon = `echo "$KSU,$KSU_VER,$KSU_VER_CODE,$KSU_KERNEL_VER_CODE,$APATCH,$APATCH_VER_CODE,$APATCH_VER,$MAGISK_VER,$MAGISK_VER_CODE"`
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
        currentRootManager.value = 'KernelSU'
      } else if (rootManagerInfo.APATCH) {
        currentRootManager.value = 'APatch'
      } else {
        currentRootManager.value = 'Magisk'
      }
    }
    // 设备类型 *强校验
    const [getDeviceCharacteristicsErr, getDeviceCharacteristicsRes] =
      await $to<string, string>(ksuApi.getDeviceCharacteristics());
    if (getDeviceCharacteristicsErr) {
      errorLogging.push({
        type: "deviceCharacteristics",
        title: "设备类型",
        msg: getDeviceCharacteristicsErr,
      });
    } else {
      deviceCharacteristics.value = getDeviceCharacteristicsRes;
    }
    // 旋转建议提示按钮 *强校验
    const [getRotationSuggestionsErr, getRotationSuggestionsRes] =
      await $to<string, string>(ksuApi.getRotationSuggestions());
    if (getRotationSuggestionsErr) {
      errorLogging.push({
        type: "rotationSuggestions",
        title: "旋转建议提示按钮",
        msg: getRotationSuggestionsErr,
      });
    } else {
      showRotationSuggestions.value = Number(getRotationSuggestionsRes) === 1 ? true : false;
    }
    // Android Target SDK Version *强校验
    const [getAndroidTargetSdkErr, getAndroidTargetSdkRes] = await $to<number, string>(
      ksuApi.getAndroidTargetSdk()
    );
    if (getAndroidTargetSdkErr) {
      errorLogging.push({
        type: "androidTargetSdk",
        title: "Android SDK版本",
        msg: getAndroidTargetSdkErr,
      });
    } else {
      androidTargetSdk.value = getAndroidTargetSdkRes;
    }
    // 设备Soc类型 *强校验
    const [getDeviceSocModelErr, getDeviceSocModelRes] = await $to<string, string>(
      ksuApi.getDeviceSocModel()
    );
    if (getDeviceSocModelErr) {
      errorLogging.push({
        type: "deviceSocModel",
        title: "设备Soc类型",
        msg: getDeviceSocModelErr,
      });
    } else {
      deviceSocModel.value = getDeviceSocModelRes;
    }
    // 设备Soc名称 *强校验
    const [getDeviceSocNameErr, getDeviceSocNameRes] = await $to<string, string>(
      ksuApi.getDeviceSocName()
    );
    if (getDeviceSocNameErr) {
      errorLogging.push({
        type: "deviceSocName",
        title: "设备Soc名称",
        msg: getDeviceSocNameErr,
      });
    } else {
      deviceSocName.value = getDeviceSocNameRes;
    }
    // 游戏显示布局 *弱校验
    const [, getMiuiCompatEnableRes] = await $to(ksuApi.getMiuiCompatEnable());
    if (getMiuiCompatEnableRes && getMiuiCompatEnableRes === 'true') {
      miuiCompatEnable.value = true;
    }
    const [, getMiuiAppCompatEnableRes] = await $to(ksuApi.getMiuiAppCompatEnable());
    if (getMiuiAppCompatEnableRes && getMiuiCompatEnableRes === 'true') {
      miuiAppCompatEnable.value = true;
    }
    // Xiaomi Hyper OS 版本号 *弱校验
    const [, getMIOSVersionRes] = await $to<number, string>(ksuApi.getMIOSVersion());
    if (getMIOSVersionRes) {
      MIOSVersion.value = getMIOSVersionRes;
    }

    // 智能IO调度 *弱校验
    const [, getSmartFocusIO] = await $to<ksuApi.SmartFocusIOResult["stdout"], string>(ksuApi.getSmartFocusIO());
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
    deviceCode,
    moduleDir,
    moduleID,
    systemVersion,
    systemPreVersion,
    deviceName,
    deviceSocName,
    deviceSocModel,
    smartFocusIO,
    showRotationSuggestions,
    miuiCompatEnable,
    miuiAppCompatEnable,
    skipConfirm,
    currentRootManager,
    rootManagerInfo,
    errorLogging,
    loading,
    initDefault,
  };
}, {
  persist: {
    pick: ['skipConfirm'],
  }
});
