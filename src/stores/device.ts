import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useDeviceStore = defineStore("device", () => {
  const deviceCharacteristics = ref<string>();
  const androidTargetSdk = ref<number>();
  const miOSVersion = ref<number>();
  const deviceCode = ref<string>();
  const deviceSocName = ref<string>();
  const deviceSocModel = ref<string>();
  const smartFocusIO = ref<boolean>(false);

  return {
    deviceCharacteristics,
    androidTargetSdk,
    miOSVersion,
    deviceCode,
    deviceSocName,
    deviceSocModel,
    smartFocusIO
  };
});
