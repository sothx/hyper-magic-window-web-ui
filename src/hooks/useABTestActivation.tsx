import { computed, ref } from 'vue';
import { useDeviceStore } from '@/stores/device';
import { createDiscreteApi, darkTheme, lightTheme, useModal, type ConfigProviderProps } from 'naive-ui'; // 假设你用的是 Naive UI 的 modal

export function useABTestActivation() {
	const deviceStore = useDeviceStore();
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));
	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});
	const loading = ref(false);

	function activateABTest(activateABTestRuleContent: Record<string, any>) {
		loading.value = true;

		if (activateABTestRuleContent.OS2_PAD_EMBEDDED_APP_MANAGER) {
			deviceStore.ABTestInfo.OS2_PAD_EMBEDDED_APP_MANAGER = true;
			modal.create({
				title: '操作成功',
				type: 'success',
				preset: 'dialog',
				content: () => (
					<div>
						<p>
							已成功参与OS2{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								应用横屏配置 For Web UI
							</span>{' '}
							的Beta测试w。由于小米在OS2新开发的{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								应用横屏布局
							</span>{' '}
							存在较多BUG，模块强制劫持了所有配置，仅能通过Web UI去调整应用横屏适配，在{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								平板专区
							</span>{' '}
							所做的相关修改会在重启后丢失。
						</p>
						<p>
							开发Hyper OS 2.0模块的Web
							UI真的消耗了我大量的个人时间和精力QwQ(特别是在小米的BUG加持下)，如果对{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								完美横屏应用计划感到满意
							</span>{' '}
							，求个随缘打赏。(打赏入口在Web UI侧边栏)
						</p>
					</div>
				),
				negativeText: '确定',
			});
		} else if (activateABTestRuleContent.Hyper_OS_DOT_BLACK_LIST_MANAGER) {
			deviceStore.ABTestInfo.Hyper_OS_DOT_BLACK_LIST_MANAGER = true;
			modal.create({
				title: '操作成功',
				type: 'success',
				preset: 'dialog',
				content: () => (
					<div>
						<p>
							已成功参与Hyper OS{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								窗口控制器 For Web UI
							</span>{' '}
							的Beta测试w。该功能可能会随{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								小米云控
							</span>{' '}
							下发导致失效，失效时可以前往界面查看失效状态，并且选择{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								热重载应用配置
							</span>{' '}
							来恢复模块对窗口控制器的控制权。
						</p>
						<p>
							开发Hyper OS 模块的Web UI真的消耗了我大量的个人时间和精力QwQ，如果对{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								完美横屏应用计划感到满意
							</span>{' '}
							，求个随缘打赏。(打赏入口在Web UI侧边栏)
						</p>
					</div>
				),
				negativeText: '确定',
			});
		} else if (activateABTestRuleContent.GAME_BOOSTER_RADIO_MANAGER) {
			deviceStore.ABTestInfo.GAME_BOOSTER_RADIO_MANAGER = true;
			modal.create({
				title: '操作成功',
				type: 'success',
				preset: 'dialog',
				content: () => (
					<div>
						<p>
							已成功参与{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								游戏显示布局 2.0
							</span>{' '}
							的Beta测试w。该功能调整后会改变游戏的显示比例，获得更大的游戏视野，但并非所有游戏都兼容游戏显示比例调整，且部分游戏可能会对游戏显示比例的修改作为风控管理，可能导致游戏账号被封禁，调整游戏显示布局前，即认可并了解这些须知。
						</p>
						<p>
							开发Hyper OS 模块的Web UI真的消耗了我大量的个人时间和精力QwQ，如果对{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								完美横屏应用计划感到满意
							</span>{' '}
							，求个随缘打赏。(打赏入口在Web UI侧边栏)
						</p>
					</div>
				),
				negativeText: '确定',
			});
		} else if (activateABTestRuleContent.GAME_BOOSTER_CUSTOM_RATIO) {
      if (!deviceStore.ABTestInfo.GAME_BOOSTER_RADIO_MANAGER) {
        modal.create({
          title: '激活自定义游戏比例失败',
          type: 'error',
          preset: 'dialog',
          content: () => <p>激活自定义游戏比例失败了QwQ，请先激活游戏显示布局2.0的Beta测试！</p>,
          negativeText: '确定',
        });
        return;
      }
      deviceStore.ABTestInfo.GAME_BOOSTER_CUSTOM_RATIO = true;
      modal.create({
				title: '操作成功',
				type: 'success',
				preset: 'dialog',
				content: () => (
					<div>
						<p>
							已成功激活{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								游戏显示布局 2.0
							</span>{' '}
							的自定义游戏比例。自定义游戏比例存在使用风险，如果配置了不恰当的自定义游戏比例，可能会触发部分游戏风控导致游戏账号被封，激活该功能即认可并了解这些须知。
						</p>
						<p>
							开发Hyper OS 模块的Web UI真的消耗了我大量的个人时间和精力QwQ，如果对{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								完美横屏应用计划感到满意
							</span>{' '}
							，求个随缘打赏。(打赏入口在Web UI侧边栏)
						</p>
					</div>
				),
				negativeText: '确定',
			});
    } else {
			modal.create({
				title: '解析激活口令失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>解析激活口令失败了QwQ，请检查激活口令是否有误</p>,
				negativeText: '确定',
			});
		}

		loading.value = false;
	}

	return { activateABTest, loading };
}
