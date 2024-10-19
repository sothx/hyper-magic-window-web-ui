import { ref, computed, onMounted } from 'vue';
import { useDeviceStore } from '@/stores/device'
import $to from 'await-to-js'
import AutoUIAppDrawer from '@/components/AutoUIAppDrawer.vue';
import { NButton, createDiscreteApi, type DataTableColumns, type NInput } from 'naive-ui'
import type AutoUIMergeRuleItem from '@/types/AutoUIMergeRuleItem';
export function useAutoUI() {
    const { message, modal } = createDiscreteApi(['message', 'modal'])
    const deviceStore = useDeviceStore();

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