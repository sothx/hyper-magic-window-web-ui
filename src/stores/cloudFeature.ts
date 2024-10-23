import { ref, computed, reactive } from 'vue';
import { defineStore } from 'pinia';

export const useCloudFeatureStore = defineStore('cloudFeature', () => {
  const joyseBootserConfig = reactive<any>({});
  return { joyseBootserConfig };
});
