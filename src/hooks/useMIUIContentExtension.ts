import { ref, computed, onMounted } from 'vue';
import { useDeviceStore } from '@/stores/device'
import * as deviceApi from '@/apis/deviceApi';

export function useMIUIContentExtension() {

    const isInstallMIUIContentExtension =  ref<boolean>(false);



    onMounted(() => {
        deviceApi.getHasInstalledMIUIContentExtension().then((res) => {
            if (res === 'exists') {
                isInstallMIUIContentExtension.value = true
            }
        })
    })


    return {
        isInstallMIUIContentExtension
    }


}