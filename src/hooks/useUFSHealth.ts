import { ref, computed, onMounted, nextTick } from 'vue';
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

	const bPreEOLInfo = ref<number>();

	const bDeviceLifeTimeEstA = ref<number>();

	const bDeviceLifeTimeEstB = ref<number>();

    const correctedPreEOLStatus = computed(() => {
        if (bDeviceLifeTimeEstA.value && bDeviceLifeTimeEstB.value) {
            const preEOL = bPreEOLInfo.value;
            const maxLife = Math.max(bDeviceLifeTimeEstA.value, bDeviceLifeTimeEstB.value);
            if (maxLife >= 5 || preEOL === 2) return '寿命接近终点';
            if (maxLife >= 7 || preEOL === 3) return '接近失效';
            return '健康'
        }
        return '';
    });

	const isShow = computed(() => {
		return Boolean(bPreEOLInfo.value && bDeviceLifeTimeEstA.value && bDeviceLifeTimeEstB.value);
	});

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

	const fetchData = async () => {
		// 先获取 UFS 健康信息
		const [getUFSHealthInfoErr, getUFSHealthInfoRes] = await $to(deviceApi.getUFSHealthInfo());
	
		if (getUFSHealthInfoRes) {
			// 使用正则提取健康相关字段
			const healthFields: (keyof UFSHealthData)[] = ['bPreEOLInfo', 'bDeviceLifeTimeEstA', 'bDeviceLifeTimeEstB'];
			const regex = new RegExp(`(${healthFields.join('|')}) = 0x([0-9a-fA-F]+)`, 'g');
	
			const parseUfsHealthData = (data: string): UFSHealthData => {
				const healthData: Partial<UFSHealthData> = {};
				let match: RegExpExecArray | null;
	
				while ((match = regex.exec(data)) !== null) {
					healthData[match[1] as keyof UFSHealthData] = parseInt(match[2], 16);
				}
	
				return pick(healthData, healthFields) as UFSHealthData;
			};
	
			const result: UFSHealthData = parseUfsHealthData(getUFSHealthInfoRes);
	
			if (result.bPreEOLInfo !== undefined) bPreEOLInfo.value = result.bPreEOLInfo;
			if (result.bDeviceLifeTimeEstA !== undefined) bDeviceLifeTimeEstA.value = result.bDeviceLifeTimeEstA;
			if (result.bDeviceLifeTimeEstB !== undefined) bDeviceLifeTimeEstB.value = result.bDeviceLifeTimeEstB;
		} else if (getUFSHealthInfoErr) {
			// 如果 UFS 健康信息获取失败，则并行请求其他数据
			const [
				[, getUFSEOLInfoRes],
				[, getUFSLifeTimeEstimationARes],
				[, getUFSLifeTimeEstimationBRes]
			] = await Promise.all([
				$to(deviceApi.getUFSEOLInfo()),
				$to(deviceApi.getUFSLifeTimeEstimationA()),
				$to(deviceApi.getUFSLifeTimeEstimationB())
			]);
	
			if (getUFSEOLInfoRes) bPreEOLInfo.value = parseInt(getUFSEOLInfoRes, 16);
			if (getUFSLifeTimeEstimationARes) bDeviceLifeTimeEstA.value = parseInt(getUFSLifeTimeEstimationARes, 16);
			if (getUFSLifeTimeEstimationBRes) bDeviceLifeTimeEstB.value = parseInt(getUFSLifeTimeEstimationBRes, 16);
		}
	};
	onMounted(() => {
		nextTick(() => {
		  fetchData(); // 确保 UI 先渲染，再执行耗时操作
		});
	});

	return {
		bPreEOLInfo,
        correctedPreEOLStatus,
		bDeviceLifeTimeEstA,
		deviceLifeTimeEstA,
		bDeviceLifeTimeEstB,
		deviceLifeTimeEstB,
		isShow,
	};
}
