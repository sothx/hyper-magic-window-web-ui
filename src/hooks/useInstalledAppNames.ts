import { ref, computed, onMounted } from 'vue';
import { useDeviceStore } from '@/stores/device'
import * as ksuApi from "@/apis/ksuApi";
import $to from 'await-to-js'
export type InstallAppNameListDictionary = Record<string, string>;
  

export function useInstalledAppNames() {
    const deviceStore = useDeviceStore();

    const loading = ref<boolean>(false);

    const getList = () => {
        return new Promise(async (resolve,reject) => {
            if (loading.value) {
                reject('已经有存在的任务了！')
            } else {
                loading.value = true;
                const [getListErr,getListRes] = await $to(ksuApi.getInstalledAppNameList())
                if (getListErr) {
                    reject(getListErr)
                }
                if (getListRes) {
                    const lines = getListRes.trim().split('\n').filter(line => line);

                    // 创建目标对象
                    const result:InstallAppNameListDictionary = {};
                    
                    // 遍历每一行，将包名和应用名称添加到对象中
                    lines.forEach(line => {
                      const [ , packageName, appName ] = line.split(',');
                      result[packageName] = appName;
                    });
                    deviceStore.installedAppNameList = result;
                    resolve(result)
                    loading.value = false;
                }
            }
        })
    }


    return {
        loading,
        installedAppNameList: deviceStore.installedAppNameList,
        getList
    }


}