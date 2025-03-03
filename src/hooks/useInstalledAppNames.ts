import { ref, computed, onMounted } from 'vue';
import { useDeviceStore } from '@/stores/device'
import * as deviceApi from '@/apis/deviceApi';
import $to from 'await-to-js'
export type InstallAppNameListDictionary = Record<string, string>;
  

export function useInstalledAppNames() {
    const deviceStore = useDeviceStore();


    const procceelocked = ref<boolean>(false);

    const loading = ref<boolean>(false);

    const getList = async () => {
        loading.value = true;
        if (procceelocked.value) {
            loading.value = false;
            return Promise.reject('已经存在任务了！')
        }
        return new Promise(async (resolve,reject) => {
            procceelocked.value = true;
            const [getListErr,getListRes] = await $to(deviceApi.getInstalledAppNameList())
            if (getListErr) {
                procceelocked.value = false;
                loading.value = false;
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
                procceelocked.value = false;
                loading.value = false;
                resolve(result)
            }
        })
    }


    return {
        loading,
        procceelocked,
        installedAppNameList: deviceStore.installedAppNameList,
        getList
    }


}