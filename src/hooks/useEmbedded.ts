import { ref, computed, onMounted, reactive, toRefs } from 'vue';
import { useDeviceStore } from '@/stores/device'
import { cloneDeep } from 'lodash-es';
import $to from 'await-to-js'
import { NButton, createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps, type DataTableColumns, type NInput } from 'naive-ui'
import { useEmbeddedStore } from '@/stores/embedded';
import type EmbeddedRuleItem from '@/types/EmbeddedRuleItem';
import type FixedOrientationRuleItem from '@/types/FixedOrientationRuleItem';
export function useEmbedded(rowName: string) {
    const embeddedStore = useEmbeddedStore(); // 根据实际情况获取你的 store

    interface EmbeddedState {
      moduleEmbeddedRules: EmbeddedRuleItem; // 你可以根据实际情况修改为具体类型
      currentEmbeddedRules: EmbeddedRuleItem;
      moduleFixedOrientation: FixedOrientationRuleItem;
      currentFixedOrientation: FixedOrientationRuleItem;
    }    
  
  // 使用 reactive 创建一个响应式对象
  const state: EmbeddedState = reactive({
    moduleEmbeddedRules: cloneDeep(
      embeddedStore.isPatchMode
        ? embeddedStore.patchEmbeddedRulesList[rowName]
        : embeddedStore.sourceEmbeddedRulesList[rowName]
    ),
    currentEmbeddedRules: cloneDeep(
      embeddedStore.customConfigEmbeddedRulesList[rowName] ||
      (embeddedStore.isPatchMode
        ? embeddedStore.patchEmbeddedRulesList[rowName]
        : embeddedStore.sourceEmbeddedRulesList[rowName])
    ) || {},
    moduleFixedOrientation: cloneDeep(
      embeddedStore.isPatchMode
        ? embeddedStore.patchFixedOrientationList[rowName]
        : embeddedStore.sourceFixedOrientationList[rowName]
    ),
    currentFixedOrientation: cloneDeep(
      embeddedStore.customConfigFixedOrientationList[rowName] ||
      (embeddedStore.isPatchMode
        ? embeddedStore.patchFixedOrientationList[rowName]
        : embeddedStore.sourceFixedOrientationList[rowName])
    ) || {},
  });
  
  return {
    ...toRefs(state), // 将 reactive 对象转换为可以解构的 ref
  };
  }