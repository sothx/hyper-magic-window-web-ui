import { ref, computed, onMounted } from 'vue';
import { useDeviceStore } from '@/stores/device'
import $to from 'await-to-js'
import AutoUIAppDrawer from '@/components/AutoUIAppDrawer.vue';
import { NButton, createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps, type DataTableColumns, type NInput } from 'naive-ui'
import type AutoUIMergeRuleItem from '@/types/AutoUIMergeRuleItem';
export function useAutoUI() {
    const deviceStore = useDeviceStore();
    const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
      theme: deviceStore.isDarkMode ? darkTheme : lightTheme
  }))
    const { message, modal } = createDiscreteApi(['message', 'modal'],{
        configProviderProps: configProviderPropsRef
      })

    const add = () => {

    }
 
    const update = () => {

    }

    onMounted(() => {
    })


    return {
        add,
        update
    }


}