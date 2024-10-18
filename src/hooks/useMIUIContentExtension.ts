import { ref, computed, onMounted } from 'vue';
import { useDeviceStore } from '@/stores/device'
import * as ksuApi from "@/apis/ksuApi";

export function useMIUIContentExtension() {

    const isInstallMIUIContentExtension =  ref<boolean>(false);



    onMounted(() => {
        ksuApi.getHasInstalledMIUIContentExtension().then((res) => {
            if (res === 'exists') {
                isInstallMIUIContentExtension.value = true
            }
        })
    })


    return {
        isInstallMIUIContentExtension
    }


}