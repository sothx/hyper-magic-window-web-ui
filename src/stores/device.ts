import { ref, reactive, computed } from "vue";
import { defineStore } from "pinia";
import $to from "await-to-js";
import * as ksuApi from "@/apis/ksuApi";
import type { ErrorLogging } from "@/types/ErrorLogging";

export interface ModuleInfo {
  moduleDir: string;
  id: string;
}

export interface ModuleProp  {
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

export const useDeviceStore = defineStore("device", () => {
  const deviceCharacteristics = ref<string>();
  const androidTargetSdk = ref<number>();
  const MIOSVersion = ref<number>();
  const deviceCode = ref<string>();
  const deviceSocName = ref<string>();
  const deviceSocModel = ref<string>();
  const moduleDir = ref<string>();
  const moduleID = ref<string>();
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
  const smartFocusIO = ref<ksuApi.SmartFocusIOResult["stdout"]>();
  const miuiCompatEnable = ref<boolean>(false);
  const miuiAppCompatEnable = ref<boolean>(false);
  const loading = ref<boolean>(true);
  const errorLogging = reactive<ErrorLogging[]>([]);
  const skipConfirm = reactive({
    GameMode: false,
    MIUIContentExt: false
  });

  const isNeedShowErrorModal = computed(() => Boolean(errorLogging.length > 0));

  async function initDefault() {
    // 模块信息 *弱校验
    const [,getModuleInfoRes] = await $to<string,string>(ksuApi.getModuleInfo());
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
    // 模块参数 *强校验
    // 设备类型 *强校验
    const [getDeviceCharacteristicsErr, getDeviceCharacteristicsRes] =
      await $to<string,string>(ksuApi.getDeviceCharacteristics());
    if (getDeviceCharacteristicsErr) {
      errorLogging.push({
        type: "deviceCharacteristics",
        title: "设备类型",
        msg: getDeviceCharacteristicsErr,
      });
    } else {
      deviceCharacteristics.value = getDeviceCharacteristicsRes;
    }
    // Android Target SDK Version *强校验
    const [getAndroidTargetSdkErr, getAndroidTargetSdkRes] = await $to<number,string>(
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
    const [getDeviceSocModelErr, getDeviceSocModelRes] = await $to<string,string>(
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
    const [getDeviceSocNameErr, getDeviceSocNameRes] = await $to<string,string>(
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
    const [, getMIOSVersionRes] = await $to<number,string>(ksuApi.getMIOSVersion());
    if (getMIOSVersionRes) {
      MIOSVersion.value = getMIOSVersionRes;
    }

    // 智能IO调度 *弱校验
    const [, getSmartFocusIO] = await $to<ksuApi.SmartFocusIOResult["stdout"],string>(ksuApi.getSmartFocusIO());
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
    deviceSocName,
    deviceSocModel,
    smartFocusIO,
    miuiCompatEnable,
    miuiAppCompatEnable,
    skipConfirm,
    errorLogging,
    loading,
    initDefault,
  };
},{
  persist: {
    pick: ['skipConfirm'],
  }
});
