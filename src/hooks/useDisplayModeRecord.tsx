import { ref, computed, onMounted, reactive, h, renderSlot, type CSSProperties } from 'vue';
import { useDeviceStore } from '@/stores/device';
import * as deviceApi from '@/apis/deviceApi';
import $to from 'await-to-js';
import { type ConfigProviderProps, darkTheme, lightTheme, createDiscreteApi, NSwitch } from 'naive-ui';

export interface DisplayModeItem {
	id: number;
	width: number;
	height: number;
	fps: number;
	vsync?: number;
	synthetic?: boolean;
	alternativeRefreshRates: number[];
	supportedHdrTypes?: number[];
}

export function useDisplayModeRecord() {
	const autoEnableID = ref<number>();

	const propIsSupportIdleDefaultFps = ref<boolean>(false);

	const isSupportIdleDefaultFps = computed(() => {
		return (
			propIsSupportIdleDefaultFps.value &&
			propIdleDefaultFps.value &&
			fpsList.value.includes(propIdleDefaultFps.value)
		);
	});

	const propDisableIdleFps = ref<boolean>(true);

	const propDisableIdleFpsThreshold = ref<number>(0);

	const propIdleDefaultFps = ref<number>();

	const currentIdleDefaultFps = ref<number>();

	const smartPenIdleEnable = ref<boolean>(true);

	const smartPenVVRFps = ref<boolean>(true);

	const isDisabledSysSmartPenOptimize = computed(() => {
		return !smartPenIdleEnable.value && !smartPenVVRFps.value
	})

	const loading = ref<boolean>(true);

	const isInit = ref<boolean>(false);
	const railStyle = ({ focused, checked }: { focused: boolean; checked: boolean }) => {
		const style: CSSProperties = {};
		if (checked) {
			style.background = '#2080f0';
			if (focused) {
				style.boxShadow = '0 0 0 2px #2080f040';
			}
		} else {
			style.background = '#d03050';
			if (focused) {
				style.boxShadow = '0 0 0 2px #d0305040';
			}
		}
		return style;
	};
	const deviceStore = useDeviceStore();

	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

	const changeDisabledSysSmartPenOptimize = async (value: boolean) => {
		const [negativeRes, positiveRes] = await $to(
			new Promise((resolve, reject) => {
				modal.create({
					title: value ? '想禁用手写笔刷新率优化吗？' : '想恢复手写笔刷新率优化吗？',
					type: 'info',
					preset: 'dialog',
					content: () => (
						<div>
							<p>{value ? '禁用' : `恢复`}手写笔刷新率优化需要设备重启后才会生效，是否继续？</p>
						</div>
					),
					positiveText: '确定',
					negativeText: '取消',
					onPositiveClick: () => {
						resolve('positiveClick');
					},
					onNegativeClick: () => {
						reject('negativeClick');
					},
				});
			}),
		);
		if (positiveRes) {
			const [removeSmartPenIdleEnableErr] = await $to(deviceApi.removeSmartPenIdleEnable());
			if (removeSmartPenIdleEnableErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>无法修改模块配置文件，详情请查看日志记录~</p>,
					negativeText: '确定',
				});
				return;
			}
			const [removeSmartPenVVRFpsErr] = await $to(deviceApi.removeSmartPenVVRFps());
			if (removeSmartPenVVRFpsErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>无法修改模块配置文件，详情请查看日志记录~</p>,
					negativeText: '确定',
				});
				return;
			}
			if (value) {
				const [addSmartPenIdleEnableIsFalseErr] = await $to(deviceApi.addSmartPenIdleEnableIsFalse());
				if (addSmartPenIdleEnableIsFalseErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>无法修改模块配置文件，详情请查看日志记录~</p>,
						negativeText: '确定',
					});
					return;
				}
				const [addSmartPenVVRFpsIsFalseErr] = await $to(deviceApi.addSmartPenVVRFpsIsFalse());
				if (addSmartPenIdleEnableIsFalseErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>无法修改模块配置文件，详情请查看日志记录~</p>,
						negativeText: '确定',
					});
					return;
				}
			}
			smartPenIdleEnable.value = value ? false : true;
			smartPenVVRFps.value = value ? false : true
			modal.create({
				title: '操作成功',
				type: 'success',
				preset: 'dialog',
				content: () => (
					<p>
						好耶w，已经成功
						{value ? `禁用` : '恢复'}手写笔刷新率优化~实际生效还需要重启设备，确定要重启吗？
					</p>
				),
				positiveText: '立即重启',
				negativeText: '稍后手动重启',
				onPositiveClick() {
					deviceApi.rebootDevice().catch(err => {
						modal.create({
							title: '操作失败',
							type: 'error',
							preset: 'dialog',
							content: () => <p>无法重启设备，详情请查看日志记录~</p>,
							negativeText: '确定',
						});
						return;
					});
				},
			});
		}
	};

	const changeIdleDefaultFps = async (fps: number) => {
		const isRemove = Boolean(fps === currentIdleDefaultFps.value);
		const [negativeRes, positiveRes] = await $to(
			new Promise((resolve, reject) => {
				modal.create({
					title: isRemove ? '想移除并重置该默认闲置刷新率吗？' : '想应用该默认闲置刷新率吗？',
					type: 'info',
					preset: 'dialog',
					content: () => (
						<div>
							<p>
								{isRemove ? '移除并重置默认闲置刷新率' : `应用 ${fps} Hz 作为默认闲置刷新率`}
								需要设备重启后才会生效，是否继续？
							</p>
						</div>
					),
					positiveText: '确定',
					negativeText: '取消',
					onPositiveClick: () => {
						resolve('positiveClick');
					},
					onNegativeClick: () => {
						reject('negativeClick');
					},
				});
			}),
		);
		if (positiveRes) {
			const [removeIdleDefaultFpsErr] = await $to(deviceApi.removeIdleDefaultFps());
			if (removeIdleDefaultFpsErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>无法修改模块配置文件，详情请查看日志记录~</p>,
					negativeText: '确定',
				});
				return;
			}
			if (!isRemove) {
				const [addIdleDefaultFpsErr] = await $to(deviceApi.addIdleDefaultFps(fps));
				if (addIdleDefaultFpsErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>无法修改模块配置文件，详情请查看日志记录~</p>,
						negativeText: '确定',
					});
					return;
				}
			}
			currentIdleDefaultFps.value = isRemove ? undefined : fps;
			modal.create({
				title: '操作成功',
				type: 'success',
				preset: 'dialog',
				content: () => (
					<p>
						好耶w，已经成功
						{isRemove ? `移除并重置该默认闲置刷新率配置` : `应用 ${fps}Hz 作为默认闲置刷新率配置`}
						~实际生效还需要重启设备，确定要重启吗？
					</p>
				),
				positiveText: '立即重启',
				negativeText: '稍后手动重启',
				onPositiveClick() {
					deviceApi.rebootDevice().catch(err => {
						modal.create({
							title: '操作失败',
							type: 'error',
							preset: 'dialog',
							content: () => <p>无法重启设备，详情请查看日志记录~</p>,
							negativeText: '确定',
						});
						return;
					});
				},
			});
		}
	};

	const supportHDRTypes = computed(() => {
		if (Array.isArray(deviceStore.displayModeList) && deviceStore.displayModeList.length) {
			return deviceStore.displayModeList[0].supportedHdrTypes;
		}

		return [];
	});

	const formatDisplayModeList = computed(() => {
		const modeList = deviceStore.displayModeList.map(item => ({
			...item,
			fps: Math.round(item.fps), // 将 fps 转换为整数
			alternativeRefreshRates: item.alternativeRefreshRates.map(rate => Math.round(rate)), // 将 alternativeRefreshRates 转换为整数数组
		}));

		console.log(modeList, 'modeList');

		return modeList;
	});

	const fpsList = computed(() => {
		return Array.from(new Set(formatDisplayModeList.value.map(item => item.fps))).sort((a, b) => b - a);
	});

	const selectDisplayMode = async (data: DisplayModeItem) => {
		const switchRender = () =>
			h(
				NSwitch, // 目标组件
				{
					class: 'mt-2',
					railStyle: railStyle,
				},
				{
					checked: () => '开机自启动', // checked 插槽的内容
					unchecked: () => '仅本次生效', // unchecked 插槽的内容
				},
			);
		modal.create({
			title: '想应用该配置吗?',
			type: 'info',
			preset: 'dialog',
			content: () => (
				<div>
					应用后设备分辨率将配置为{data.width}x{data.height}，刷新率将配置为{data.fps}
					Hz，在设备下次重启前将一直维持该配置，该功能可能受触控笔和其他第三方模块影响不一定生效，如需恢复系统设置内的默认分辨率及刷新率配置，请手动重启设备。
					{deviceStore.deviceType === 'tablet' && (
						<span>
							连接触控笔蓝牙期间，为了确保触控笔正常工作，系统也会强行重置该配置，断开触控笔蓝牙后需要重新配置，
						</span>
					)}
					确定要继续应用该配置么？
				</div>
			),
			negativeText: '取消',
			positiveText: '确定',
			onPositiveClick() {
				setDisplayMode(data.id - 1);
			},
		});
	};

	const selectAutoEnable = async (data: DisplayModeItem) => {
		if (data.id === autoEnableID.value) {
			modal.create({
				title: '想移除该配置的开机自启吗?',
				type: 'info',
				preset: 'dialog',
				content: () => (
					<div>
						移除该配置的开机自启后，将恢复系统设置内的默认分辨率及刷新率配置，需要设备重启后才会生效，确定要继续移除该配置的开机自启么？
					</div>
				),
				negativeText: '取消',
				positiveText: '确定',
				async onPositiveClick() {
					const [removeDisplayModeRecordAutoEnableIDErr, removeDisplayModeRecordAutoEnableIDRes] = await $to(
						deviceApi.removeDisplayModeRecordAutoEnableID(),
					);
					if (removeDisplayModeRecordAutoEnableIDErr) {
						modal.create({
							title: '操作失败',
							type: 'error',
							preset: 'dialog',
							content: () => <p>修改失败，详情请查看日志记录~</p>,
							negativeText: '确定',
						});
						return;
					}
					autoEnableID.value = undefined;
				},
			});
		} else {
			modal.create({
				title: '想应用该配置的开机自启吗?',
				type: 'info',
				preset: 'dialog',
				content: () => (
					<div>
						应用后设备分辨率将配置为{data.width}x{data.height}，刷新率将配置为{data.fps}
						Hz，每次设备开机后会自行启动该配置，该功能可能受触控笔和其他第三方模块影响不一定生效，如需恢复系统设置内的默认分辨率及刷新率配置，请移除该配置的开机自启并手动重启设备。
						{deviceStore.deviceType === 'tablet' && (
							<span>
								连接触控笔蓝牙期间，为了确保触控笔正常工作，系统也会强行重置该配置，断开触控笔蓝牙后需要重新配置，
							</span>
						)}
						确定要继续应用该配置的开机自启么？
					</div>
				),
				negativeText: '取消',
				positiveText: '确定',
				async onPositiveClick() {
					const [removeDisplayModeRecordAutoEnableIDErr, removeDisplayModeRecordAutoEnableIDRes] = await $to(
						deviceApi.removeDisplayModeRecordAutoEnableID(),
					);
					if (removeDisplayModeRecordAutoEnableIDErr) {
						modal.create({
							title: '操作失败',
							type: 'error',
							preset: 'dialog',
							content: () => <p>修改失败，详情请查看日志记录~</p>,
							negativeText: '确定',
						});
						return;
					}
					const [addDisplayModeRecordAutoEnableIDErr, addDisplayModeRecordAutoEnableIDRes] = await $to(
						deviceApi.addDisplayModeRecordAutoEnableID(data.id),
					);
					if (addDisplayModeRecordAutoEnableIDErr) {
						modal.create({
							title: '操作失败',
							type: 'error',
							preset: 'dialog',
							content: () => <p>修改失败，详情请查看日志记录~</p>,
							negativeText: '确定',
						});
						return;
					}
					setDisplayMode(data.id - 1);
					autoEnableID.value = data.id;
				},
			});
		}
	};

	const setDisplayMode = async (displayModeID: number) => {
		const [setDisplayModeErr, setDisplayModeRes] = await $to(deviceApi.setDisplayMode(displayModeID));
		if (setDisplayModeErr) {
			modal.create({
				title: '操作失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>修改失败，详情请查看日志记录~</p>,
				negativeText: '确定',
			});
		}
		if (setDisplayModeRes) {
			modal.create({
				title: '操作成功',
				type: 'success',
				preset: 'dialog',
				content: () => (
					<p>
						已成功应用该分辨率及刷新率配置，在设备下次重启前将一直维持该配置，如需恢复系统设置内的默认分辨率及刷新率配置，请手动重启设备。
					</p>
				),
				negativeText: '确定',
			});
		}
	};

	const fetchData = async () => {
		const [getDisplayModeRecordAutoEnableIDErr, getDisplayModeRecordAutoEnableIDRes] = await $to<string, string>(
			deviceApi.getDisplayModeRecordAutoEnableID(),
		);
		if (getDisplayModeRecordAutoEnableIDRes) {
			if (Number(getDisplayModeRecordAutoEnableIDRes) > 0) {
				autoEnableID.value = Number(getDisplayModeRecordAutoEnableIDRes);
			} else {
				autoEnableID.value = undefined;
			}
		} else {
			autoEnableID.value = undefined;
		}
		const [getSmartPenIdleEnableErr, getSmartPenIdleEnableRes] = await $to<string, string>(
			deviceApi.getSmartPenIdleEnable(),
		);
		if (getSmartPenIdleEnableRes && getSmartPenIdleEnableRes === 'false') {
			smartPenIdleEnable.value = false;
		} else {
			smartPenIdleEnable.value = true;
		}
		const [getSmartPenVVRFpsErr,getSmartPenVVRFpsRes] = await $to<string,string>(
			deviceApi.getSmartPenVVRFps()
		)
		if (getSmartPenVVRFpsRes && getSmartPenVVRFpsRes === 'false') {
			smartPenVVRFps.value = false;
		} else {
			smartPenVVRFps.value = true;
		}
		const [getOdmIsSupportIdleDefaultFpsErr, getOdmIsSupportIdleDefaultFpsRes] = await $to<string, string>(
			deviceApi.getOdmIsSupportIdleDefaultFps(),
		);
		if (getOdmIsSupportIdleDefaultFpsRes && getOdmIsSupportIdleDefaultFpsRes === 'true') {
			propIsSupportIdleDefaultFps.value = true;
		} else {
			propIsSupportIdleDefaultFps.value = false;
		}
		if (!propIsSupportIdleDefaultFps.value) {
			const [getVendorIsSupportIdleDefaultFpsErr, getVendorIsSupportIdleDefaultFpsRes] = await $to<string, string>(
				deviceApi.getVendorIsSupportIdleDefaultFps(),
			);
			if (getVendorIsSupportIdleDefaultFpsRes && getVendorIsSupportIdleDefaultFpsRes === 'true') {
				propIsSupportIdleDefaultFps.value = true;
			} else {
				propIsSupportIdleDefaultFps.value = false;
			}
		}
		const [getOdmIdleDefaultFpsErr, getOdmIdleDefaultFpsRes] = await $to<string, string>(
			deviceApi.getOdmIdleDefaultFps(),
		);
		if (getOdmIdleDefaultFpsRes && Number(getOdmIdleDefaultFpsRes) > 0) {
			propIdleDefaultFps.value = Number(getOdmIdleDefaultFpsRes);
		} else {
			propIdleDefaultFps.value = undefined;
		}
		if (!propIdleDefaultFps.value) {
			const [getVendorIdleDefaultFpsErr, getVendorIdleDefaultFpsRes] = await $to<string, string>(
				deviceApi.getVendorIdleDefaultFps(),
			);
			if (getVendorIdleDefaultFpsRes && Number(getVendorIdleDefaultFpsRes) > 0) {
				propIdleDefaultFps.value = Number(getVendorIdleDefaultFpsRes);
			} else {
				propIdleDefaultFps.value = undefined;
			}
		}
		const [getIdleDefaultFpsErr, getIdleDefaultFpsRes] = await $to<string, string>(deviceApi.getIdleDefaultFps());
		if (getIdleDefaultFpsRes && Number(getIdleDefaultFpsRes) > 0) {
			currentIdleDefaultFps.value = Number(getIdleDefaultFpsRes);
		} else {
			currentIdleDefaultFps.value = undefined;
		}
		const [getDisableIdleFpsErr, getDisableIdleFpsRes] = await $to<string, string>(deviceApi.getDisableIdleFps());
		if (getDisableIdleFpsRes && getDisableIdleFpsRes === 'true') {
			propDisableIdleFps.value = true;
		} else {
			propDisableIdleFps.value = false;
		}
		const [getDisableIdleFpsThresholdErr, getDisableIdleFpsThresholdRes] = await $to<string, string>(deviceApi.getDisableIdleFpsThreshold());
		if (getDisableIdleFpsThresholdRes && Number(getDisableIdleFpsThresholdRes) > 0) {
			propDisableIdleFpsThreshold.value = Number(getDisableIdleFpsThresholdRes);
		} else {
			propDisableIdleFpsThreshold.value = 0;
		}
		isInit.value = true;
		loading.value = false;
	};

	onMounted(async () => {
		setTimeout(() => {
			fetchData(); // 确保 UI 先渲染，再执行耗时操作
		}, 0);
	});

	return {
		isInit,
		loading,
		autoEnableID,
		supportHDRTypes,
		formatDisplayModeList,
		setDisplayMode,
		selectDisplayMode,
		selectAutoEnable,
		propIsSupportIdleDefaultFps,
		isSupportIdleDefaultFps,
		propIdleDefaultFps,
		currentIdleDefaultFps,
		changeIdleDefaultFps,
		changeDisabledSysSmartPenOptimize,
		propDisableIdleFps,
		propDisableIdleFpsThreshold,
		isDisabledSysSmartPenOptimize,
		fpsList,
	};
}
