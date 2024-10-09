import { ref, reactive, computed } from "vue";
import { defineStore } from "pinia";
import $to from "await-to-js";
import * as ksuApi from "@/apis/ksuApi";

interface ErrorLogging {
  type: string;
  msg: Error;
}

export const useDeviceStore = defineStore("device", () => {
  const deviceCharacteristics = ref<string>();
  const androidTargetSdk = ref<number>();
  const MIOSVersion = ref<number>();
  const deviceCode = ref<string>();
  const deviceSocName = ref<string>();
  const deviceSocModel = ref<string>();
  const smartFocusIO = ref<ksuApi.SmartFocusIOResult["stdout"]>();
  const miuiCompatEnable = ref<boolean>();
  const miuiAppCompatEnable = ref<boolean>();
  const loading = ref<boolean>(true);
  const errorLogging = reactive<ErrorLogging[]>([]);

  async function initDefault() {
    // 设备类型 *强校验
    const [getDeviceCharacteristicsErr, getDeviceCharacteristicsRes] =
      await $to(ksuApi.getDeviceCharacteristics());
    if (getDeviceCharacteristicsErr) {
      errorLogging.push({
        type: "deviceCharacteristics",
        msg: getDeviceCharacteristicsErr,
      });
    } else {
      deviceCharacteristics.value = getDeviceCharacteristicsRes;
    }
    // Android Target SDK Version *强校验
    const [getAndroidTargetSdkErr, getAndroidTargetSdkRes] = await $to(
      ksuApi.getAndroidTargetSdk()
    );
    if (getAndroidTargetSdkErr) {
      errorLogging.push({
        type: "androidTargetSdk",
        msg: getAndroidTargetSdkErr,
      });
    } else {
      androidTargetSdk.value = getAndroidTargetSdkRes;
    }
    // 设备Soc类型 *强校验
    const [getDeviceSocModelErr, getDeviceSocModelRes] = await $to(
      ksuApi.getDeviceSocModel()
    );
    if (getDeviceSocModelErr) {
      errorLogging.push({
        type: "deviceSocModel",
        msg: getDeviceSocModelErr,
      });
    } else {
      deviceSocModel.value = getDeviceSocModelRes;
    }
    // 设备Soc名称 *强校验
    const [getDeviceSocNameErr, getDeviceSocNameRes] = await $to(
      ksuApi.getDeviceSocName()
    );
    if (getDeviceSocNameErr) {
      errorLogging.push({
        type: "deviceSocName",
        msg: getDeviceSocNameErr,
      });
    } else {
      deviceSocName.value = getDeviceSocNameRes;
    }
    // 游戏显示布局 *弱校验
    const [, getMiuiCompatEnableRes] = await $to(ksuApi.getMiuiCompatEnable());
    miuiCompatEnable.value = getMiuiCompatEnableRes;
    const [, getMiuiAppCompatEnableRes] = await $to(ksuApi.getMiuiAppCompatEnable());
    miuiAppCompatEnable.value = getMiuiAppCompatEnableRes;
    // Xiaomi Hyper OS 版本号 *弱校验
    const [, getMIOSVersionRes] = await $to(ksuApi.getMIOSVersion());
    MIOSVersion.value = getMIOSVersionRes;

    // 智能IO调度 *弱校验
    const [, getSmartFocusIO] = await $to(ksuApi.getSmartFocusIO());
    smartFocusIO.value = getSmartFocusIO;

    if (!errorLogging.length) {
      loading.value = false;
    }
  }

  return {
    deviceCharacteristics,
    androidTargetSdk,
    MIOSVersion,
    deviceCode,
    deviceSocName,
    deviceSocModel,
    smartFocusIO,
    miuiCompatEnable,
    miuiAppCompatEnable,
    loading,
    initDefault,
  };
});
