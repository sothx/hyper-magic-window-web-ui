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

export function useUFSHealth() {
	const deviceStore = useDeviceStore();

	const procceelocked = ref<boolean>(false);

	const loading = ref<boolean>(false);

    const bPreEOLInfo = ref <number>();

    const bDeviceLifeTimeEstA = ref <number>();

    const bDeviceLifeTimeEstB = ref <number>();

    const preEOLInfo = computed(() => {
        if (bPreEOLInfo.value === 1) {
            return '健康'
        }
        if (bPreEOLInfo.value === 2) {
            return '寿命接近终点'
        }
        if (bPreEOLInfo.value === 3) {
            return '接近失效'
        }
        return ''
    });

    const isShow = computed(() => {
        return Boolean(bPreEOLInfo.value && bDeviceLifeTimeEstA.value && bDeviceLifeTimeEstB.value)
    })

    const deviceLifeTimeEstA = computed(() => {
        if (bDeviceLifeTimeEstA.value && bDeviceLifeTimeEstA.value >= 1 && bDeviceLifeTimeEstA.value <= 9) {
            return `${bDeviceLifeTimeEstA.value * 10}%`;
        }
        return '';
    });

    const deviceLifeTimeEstB = computed(() => {
        if (bDeviceLifeTimeEstB.value && bDeviceLifeTimeEstB.value >= 1 && bDeviceLifeTimeEstB.value <= 9) {
            return `${bDeviceLifeTimeEstB.value * 10}%`;
        }
        return '';
    });

	onMounted(async () => {
		const [getUFSHealthInfoErr, getUFSHealthInfoRes] = await $to(deviceApi.getUFSHealthInfo());

		if (getUFSHealthInfoRes) {
			// 使用正则提取健康相关字段
			// 需要提取的健康相关字段
			const healthFields: (keyof UFSHealthData)[] = ['bPreEOLInfo', 'bDeviceLifeTimeEstA', 'bDeviceLifeTimeEstB'];
			const regex = new RegExp(`(${healthFields.join('|')}) = 0x([0-9a-fA-F]+)`, 'g');
			// 解析数据
			// 解析数据
			const parseUfsHealthData = (data: string): UFSHealthData => {
				const healthData: Partial<UFSHealthData> = {};
				let match: RegExpExecArray | null;

				while ((match = regex.exec(data)) !== null) {
					healthData[match[1] as keyof UFSHealthData] = parseInt(match[2], 16);
				}

				return pick(healthData, healthFields) as UFSHealthData;
			};

            const result: UFSHealthData = parseUfsHealthData(getUFSHealthInfoRes);

            if (result.bPreEOLInfo) {
                bPreEOLInfo.value = result.bPreEOLInfo;
            }

            if (result.bDeviceLifeTimeEstA) {
                bDeviceLifeTimeEstA.value = result.bDeviceLifeTimeEstA;
            }

            if (result.bDeviceLifeTimeEstB) {
                bDeviceLifeTimeEstB.value = result.bDeviceLifeTimeEstB;
            }


		}
	});

	return {
		bPreEOLInfo,
        preEOLInfo,
        bDeviceLifeTimeEstA,
        deviceLifeTimeEstA,
        bDeviceLifeTimeEstB,
        deviceLifeTimeEstB,
        isShow
	};
}
