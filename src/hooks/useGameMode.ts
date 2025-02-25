import { ref, computed, onMounted } from 'vue';
import { useDeviceStore } from '@/stores/device'

export function useGameMode() {
    const isSupportGameMode  = computed(() => {
        return deviceStore.miuiCompatEnable && deviceStore.androidTargetSdk && deviceStore.androidTargetSdk > 31
    })


    const deviceStore = useDeviceStore();



    onMounted(() => {
    })


    return {
        isSupportGameMode
    }


}