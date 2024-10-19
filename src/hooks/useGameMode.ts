import { ref, computed, onMounted } from 'vue';
import { useDeviceStore } from '@/stores/device'

export function useGameMode() {
    const isSupportGameMode  = computed(() => {
        console.log(deviceStore.miuiCompatEnable,deviceStore.miuiAppCompatEnable,'deviceStore.miuiCompatEnable')
        return deviceStore.miuiCompatEnable && deviceStore.miuiAppCompatEnable && deviceStore.androidTargetSdk && deviceStore.androidTargetSdk > 31
    })


    const deviceStore = useDeviceStore();



    onMounted(() => {
    })


    return {
        isSupportGameMode
    }


}