import { computed, h, ref } from 'vue';
import { useDeviceStore } from '@/stores/device';
import { createDiscreteApi, darkTheme, lightTheme, NAlert, NButton, useModal, type AlertProps, type ButtonProps, type ConfigProviderProps } from 'naive-ui'; // 假设你用的是 Naive UI 的 modal
import * as deviceApi from '@/apis/deviceApi';

export function usePadSystemPatchAdditionalModule() {
	const deviceStore = useDeviceStore();
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));
	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});
	const loading = ref(false);

	const openDownloadModuleModal = () => {
         const NButtonTemplate = (text: string, type: ButtonProps['type'], onClick: ButtonProps['onClick']) => {
                    return h(
                        NButton,
                        {
                            type,
                            size: 'small',
                            class: 'my-3',
                            block: true,
                            dashed: true,
                            onClick,
                        },
                        text,
                    );
        };
        const NAlertTemplate = (text: string, showIcon: AlertProps['showIcon'],type: AlertProps['type']) => {
            return h(
                NAlert,
                {
                    showIcon,
                    type
                },
                text
            )
        }
		modal.create({
			title: '获取附加模块',
			type: 'info',
			preset: 'dialog',
			content: () => (
				<div class='space-y-4'>
					<p>
					    小米平板附加模块支持以下系统增强功能：
					</p>
                    {
                        NAlertTemplate && NAlertTemplate('任意应用无极小窗 · 强制上下分屏(仅Android 15) · 禁用分屏黑名单 · 自定义小窗数量 · 隐藏小窗小白条 · 窗口控制器 3.0',false,'info')
                    }
                    <p>每次更新 ROM 后，需要重新获取适合当前 ROM 版本的附加模块~模块修改了系统组件，所以请自备救砖模块，避免卡开机~</p>
					<p>请访问下面的 GitHub 仓库，阅读 README，自行构建最新模块：</p>
					<p>
                        <div class='mt-2'>
                            {NButtonTemplate &&
                                NButtonTemplate('通过 Github Action 构建模块', 'info', () => {
                                       navigator.clipboard.writeText(`https://github.com/sothx/xiaomi_pad_system_patch_additional_module`);
                                       deviceApi.openUrl('https://github.com/sothx/xiaomi_pad_system_patch_additional_module');
                                })}
                        </div>
					</p>
					<p>另外，也可以通过移动网盘下载成品模块，但版本可能不是最新：</p>
                        <div class='mt-2'>
                            {NButtonTemplate &&
                                NButtonTemplate('通过 移动网盘 下载', 'info', () => {
                                    navigator.clipboard.writeText(`https://caiyun.139.com/w/i/2oRhj2xw7kbu7`);
                                    deviceApi.openChinaMobileMCloud();
                                })}
                        </div>
				</div>
			),
			positiveText: '确定',
		});
	};

	return { openDownloadModuleModal };
}
