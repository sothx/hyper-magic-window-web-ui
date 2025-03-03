import { ref, computed, onMounted } from 'vue';
import { useDeviceStore } from '@/stores/device';
import * as deviceApi from '@/apis/deviceApi';
import { pick } from 'lodash-es';
import $to from 'await-to-js';
export type InstallAppNameListDictionary = Record<string, string>;

// 定义健康数据的类型
interface UFSHealthData {
    bPreEOLInfo: number;
    bDeviceLifeTimeEstA: number;
    bDeviceLifeTimeEstB: number;
}

export function useMemoryInfo() {
    const DDRVendor = ref<string>('');

    onMounted(async () => {
            const [getDDRVvndorErr, getDDRVvndorRes] = await $to(
                deviceApi.getDDRVendor(),
            );

            if (getDDRVvndorRes) {
                DDRVendor.value = getDDRVvndorRes;
            }
    });

    return {
        DDRVendor
    };
}
