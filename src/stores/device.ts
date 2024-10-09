import { ref, reactive, computed } from "vue";
import { defineStore } from "pinia";
import $to from 'await-to-js';
import * as ksuApi from '@/apis/ksuApi';

interface ErrorLogging {
    type: string
    msg: Error
}

export const useDeviceStore = defineStore("device", () => {
  const deviceCharacteristics = ref<string>();
  const androidTargetSdk = ref<number>();
  const MIOSVersion = ref<number>();
  const deviceCode = ref<string>();
  const deviceSocName = ref<string>();
  const deviceSocModel = ref<string>();
  const smartFocusIO = ref<boolean>(false);
  const loading = ref<boolean>(true);
  const errorLogging = reactive<ErrorLogging[]>([]);


  async function initDefault() {
    // 设备类型 *强校验
    const [getDeviceCharacteristicsErr,getDeviceCharacteristicsRes] = await $to(ksuApi.getDeviceCharacteristics())
    if (getDeviceCharacteristicsErr) {
        errorLogging.push({
            type: 'deviceCharacteristics',
            msg: getDeviceCharacteristicsErr
        })
    } else {
        deviceCharacteristics.value = getDeviceCharacteristicsRes
    }
    // Android Target SDK Version *强校验
    const [getAndroidTargetSdkErr,getAndroidTargetSdkRes] = await $to(ksuApi.getAndroidTargetSdk())
    if (getAndroidTargetSdkErr) {
        errorLogging.push({
            type: 'androidTargetSdk',
            msg: getAndroidTargetSdkErr
        })
    } else {
        androidTargetSdk.value = Number(getAndroidTargetSdkRes)
    }
    // Xiaomi Hyper OS 版本号 *弱校验
    const [,getMIOSVersionRes] = await $to(ksuApi.getMIOSVersion())
    MIOSVersion.value = Number(getMIOSVersionRes)

    if (!errorLogging.length) {
        loading.value = false
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
    loading,
    initDefault
  };
});
