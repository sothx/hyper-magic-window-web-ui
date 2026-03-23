import { ref, computed, onMounted, nextTick } from 'vue';
import { useDeviceStore } from '@/stores/device';
import $to from 'await-to-js';
import {
	NButton,
	createDiscreteApi,
	darkTheme,
	lightTheme,
	type ConfigProviderProps,
	type DataTableColumns,
	type NInput,
} from 'naive-ui';
import * as deviceApi from '@/apis/deviceApi';

export function useProjectTrebleMaxFreeformCount() {
	const deviceStore = useDeviceStore();
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

	const isInit = ref<boolean>(false);

	const isLoading = ref<boolean>(false);

	const isEditDefaultDesktopModeMaxFreeformCount = ref<boolean>(false);

	const isEditMiuiDesktopModeMaxFreeformCount = ref<boolean>(false);

	const isEditSplitScreenModeMaxFreeformCount = ref<boolean>(false);

	const currentSplitScreenModeMaxFreeformCount = ref<number>(1);

	const currentDefaultDesktopModeMaxFreeformCount = ref<number>(2);

	const currentMiuiDesktopModeMaxFreeformCount = ref<number>(4);

	const isSupportDefaultDesktopModeMaxFreeformCount = ref<boolean>(false);

	const isSupportSplitScreenModeMaxFreeformCount = ref<boolean>(false);

	const isSupportMiuiDesktopModeMaxFreeformCount = ref<boolean>(false);

	type DesktopModeType = 'DefaultDesktopMode' | 'MiuiDesktopMode' | 'SplitScreenMode';

	const changeMaxFreeformCount = async (type: DesktopModeType, countNum: number) => {
		const [putCurrenMaxFreeformCountResErr, putCurrenMaxFreeformCountRes] = await $to(
			type === 'DefaultDesktopMode'
				? deviceApi.putCurrentDefaultDesktopMaxFreeformCount(countNum)
				: type === 'SplitScreenMode'
					? deviceApi.putCurrentSplitScreenModeMaxFreeformCount(countNum)
					: deviceApi.putCurrentMiuiDesktopMaxFreeformCount(countNum),
		);
		if (putCurrenMaxFreeformCountResErr) {
			modal.create({
				title: '操作失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>修改失败，详情请查看日志记录~</p>,
				positiveText: '确定',
			});
		} else {
			if (type === 'DefaultDesktopMode') {
				currentDefaultDesktopModeMaxFreeformCount.value = countNum;
				isEditDefaultDesktopModeMaxFreeformCount.value = false;
			} else if (type === 'SplitScreenMode') {
				currentSplitScreenModeMaxFreeformCount.value = countNum;
				isEditSplitScreenModeMaxFreeformCount.value = false;
			} else {
				currentMiuiDesktopModeMaxFreeformCount.value = countNum;
				isEditMiuiDesktopModeMaxFreeformCount.value = false;
			}
			modal.create({
				title: '操作成功',
				type: 'success',
				preset: 'dialog',
				content: () => (
					<p>
						好耶w，已经成功修改
						{type === 'DefaultDesktopMode'
							? '默认桌面'
							: type === 'SplitScreenMode'
								? '分屏模式'
								: '工作台模式'}
						下的最大小窗数量~实际生效还需要重启系统界面作用域，确定要继续吗？
					</p>
				),
				positiveText: '立即重启作用域',
				negativeText: '稍后手动重启',
				onPositiveClick() {
					deviceApi
						.killAndroidSystemUI()
						.then(() => {
							modal.create({
								title: '重启系统界面成功',
								type: 'success',
								preset: 'dialog',
								content: () => <p>已经成功为你重启系统界面的作用域，请查看是否生效~</p>,
							});
						})
						.catch(err => {
							modal.create({
								title: '重启系统界面失败',
								type: 'error',
								preset: 'dialog',
								content: () => <p>发生异常错误，重启系统界面作用域失败QwQ，详细错误请查看日志~</p>,
								positiveText: '确定',
							});
							return;
						});
				},
			});
		}
	};

	const fetchData = async () => {
		isLoading.value = true;
		const [, getIsSupportMiuiDesktopMaxFreeformMaxNumRes] = await $to(
			deviceApi.getIsSupportMiuiDesktopMaxFreeformMaxNum(),
		);
		if (getIsSupportMiuiDesktopMaxFreeformMaxNumRes === 'true') {
			isSupportMiuiDesktopModeMaxFreeformCount.value = true;
		}
		const [, getIsSupportDefaultDesktopMaxFreeformMaxNumRes] = await $to(
			deviceApi.getIsSupportDefaultDesktopMaxFreeformMaxNum(),
		);
		if (getIsSupportDefaultDesktopMaxFreeformMaxNumRes === 'true') {
			isSupportDefaultDesktopModeMaxFreeformCount.value = true;
		}

		const [, getIsSupportSplitScreenModeMaxFreeformCountRes] = await $to(
			deviceApi.getIsSupportSplitScreenModeMaxFreeformCount(),
		);

		if (getIsSupportSplitScreenModeMaxFreeformCountRes === 'true') {
			isSupportSplitScreenModeMaxFreeformCount.value = true;
		}

		if (isSupportMiuiDesktopModeMaxFreeformCount.value) {
			const [, getCurrentMiuiDesktopMaxFreeformCountRes] = await $to(
				deviceApi.getCurrentMiuiDesktopMaxFreeformCount(),
			);
			if (
				Number(getCurrentMiuiDesktopMaxFreeformCountRes) &&
				Number(getCurrentMiuiDesktopMaxFreeformCountRes) >= 4
			) {
				currentMiuiDesktopModeMaxFreeformCount.value = Number(getCurrentMiuiDesktopMaxFreeformCountRes);
			} else {
				currentMiuiDesktopModeMaxFreeformCount.value = 4;
			}
		}

		if (isSupportDefaultDesktopModeMaxFreeformCount.value) {
			const [, getCurrentDefaultDesktopMaxFreeformCountRes] = await $to(
				deviceApi.getCurrentDefaultDesktopMaxFreeformCount(),
			);
			if (
				Number(getCurrentDefaultDesktopMaxFreeformCountRes) &&
				Number(getCurrentDefaultDesktopMaxFreeformCountRes) >= 2
			) {
				currentDefaultDesktopModeMaxFreeformCount.value = Number(getCurrentDefaultDesktopMaxFreeformCountRes);
			} else {
				currentDefaultDesktopModeMaxFreeformCount.value = 2;
			}
		}

		if (isSupportSplitScreenModeMaxFreeformCount.value) {
			const [, getCurrentSplitScreenModeMaxFreeformCountRes] = await $to(
				deviceApi.getCurrentSplitScreenModeMaxFreeformCount(),
			);
			if (
				Number(getCurrentSplitScreenModeMaxFreeformCountRes) &&
				Number(getCurrentSplitScreenModeMaxFreeformCountRes) >= 1
			) {
				currentSplitScreenModeMaxFreeformCount.value = Number(getCurrentSplitScreenModeMaxFreeformCountRes);
			} else {
				currentSplitScreenModeMaxFreeformCount.value = 1;
			}
		}

		isLoading.value = false;
		isInit.value = true;
	};

	onMounted(() => {
		setTimeout(() => {
			fetchData(); // 确保 UI 先渲染，再执行耗时操作
		}, 0);
	});

	return {
		isEditDefaultDesktopModeMaxFreeformCount,
		isEditMiuiDesktopModeMaxFreeformCount,
		isEditSplitScreenModeMaxFreeformCount,
		currentDefaultDesktopModeMaxFreeformCount,
		currentMiuiDesktopModeMaxFreeformCount,
		currentSplitScreenModeMaxFreeformCount,
		isSupportDefaultDesktopModeMaxFreeformCount,
		isSupportMiuiDesktopModeMaxFreeformCount,
		isSupportSplitScreenModeMaxFreeformCount,
		changeMaxFreeformCount,
		isInit,
		isLoading,
	};
}
