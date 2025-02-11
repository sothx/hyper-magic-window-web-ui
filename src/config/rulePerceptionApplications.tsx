import { renderApplicationName } from '@/utils/common';
import { type ConfigProviderProps, darkTheme, lightTheme, createDiscreteApi, NCode } from 'naive-ui';
import { computed, h } from 'vue';
import { useDeviceStore } from '@/stores/device';
import type EmbeddedMergeRuleItem from '@/types/EmbeddedMergeRuleItem';
// 定义每个应用的类型
interface EmbeddedPerceptionApplications {
    isShow: () => boolean;
    onClick: (row: EmbeddedMergeRuleItem) => void;
}
export const embeddedPerceptionApplications: Record<string, EmbeddedPerceptionApplications> = {
    'com.coolapk.market': {
        isShow() {
            const deviceStore = useDeviceStore();
            if (deviceStore.deviceCharacteristics === 'tablet' && deviceStore.MIOSVersion && deviceStore.MIOSVersion === 2 && deviceStore.androidTargetSdk >= 35) {
                return true;
            }
            return false;
        },
        onClick (row: EmbeddedMergeRuleItem) {
            const deviceStore = useDeviceStore();
            const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
                theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
            }));
            const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
                configProviderProps: configProviderPropsRef,
            });
             const code = 'eNqtVk1zGjEM/S977GQ8mfZC6IlC6SWkBBJ61noFq8Fre2wvDM3kv1deEj5mgDVpLra8q2dZsp6sl0xDhVk3k6YS0hgFdikqcEsM2U0mKxuy7tebDKus+3JR1S/JTlHNewXYQCvWC65G/m4VhQkEMln3Vnx7+zAGcpNand5NrAjXLJMWIx56kvejsOl+uTmnW3t0qzvxzNPUgsTZXQJImwLFYMNOkXxgeQwLTIB5BCdLMa0tG2vkCfpahQRoDh7FlCqrsKdsCQmQOWIhhjwMMACpd8SscwED1lag2Rsnnu3CQYGj7TLR3qojKnaIpnVeURCjvZywwYHxnrXphuMVNhcYnb0nn2JLGh1ABjF0hPpqEGifCNmfzShl1uxXSiBUXlcNqhela0yNNgNaUHiC/AB1AbQwpvCM+hXnY1SSW2OSoXaYCCs2JWfIYFMm6ucgl7WNyuLHTkzAVeg9J4/olxAC6cU1bJmgVZtjyrQn/TbHI3zWSaofgeYkY2nT4uFgkXrQ5pB7ZS6i8La4tjSetbMGpSxwpWr+WpKizzPf93FsPl5K/rOQXBGg8wXZKvBckJspVXtYKzWVDlH3ilbMigo0YhbHbdwOM7gtAjGffurgQPO71GlF2dIEIx4nfX6RUk2cStw2zGONPibrEwXVbqipMA2F+w4h4LDWTyVz0rf7g64i7yNHxo5WINsvdI15M9+bRUKKK242xD0PrZrnCsqHykkLyLg1uHjvrPoOYYLHNPAU4x4p7j+F45/AtGtz6GORTKPzpaBzBMlPS7MeUOSk2zWZtbXGhYbU9HfXe84VLGKMHfJTN3bYj08/aXTdy+wbx3HG69bDSm4IUMb73JJjt+RWmIV3/Pfsre8dkf5DRSiz7t3t7Suf0LT11Sf9LchDrrDF/dMtOVsNGxvtYZVjUWDBVgpckYzfLMRlxcXnWCGU5IoxOM5ma3/zdlVjaA7K4+s/HRabjA=='
            modal.create({
                title: '应用规则感知',
                type: 'info',
                preset: 'dialog',
                content () {
                    const NCodeTemplate = (code:string) => {
                        return h(NCode,{
                            code: code,
                            class: 'my-5 overflow-y-auto line-clamp-6',
                            language: 'Base64',
                            wordWrap: true
                        })
                    }
                    return (
                        <div>
                            <p>
                                模块已为{' '}
                                <span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
                                    {renderApplicationName(row.name, row.applicationName)}
                                </span>{' '}
                                {' '}进行了更详尽的应用规则适配，您可以将此自定义规则通过{' '}
                                <span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
                                    [应用横屏布局-从分享口令导入]
                                </span>{' '}
                                进行导入~
                            </p>
                            <n-button>223</n-button>
                            <p>Tips: 此规则需要搭配最新版的Hyper OS 2.0，老版本的 OS 2 可能由于小米BUG存在崩溃的问题。</p>
                            { NCodeTemplate && NCodeTemplate(code) }
                        </div>
                    )
                },
                positiveText: '复制自定义规则到剪贴板',
                negativeText: '取消',
                onPositiveClick: () => {
                    navigator.clipboard.writeText(code);
                },
                onNegativeClick: () => {},
            });
        },
    },
    'tv.danmaku.bili': {
        isShow() {
            const deviceStore = useDeviceStore();
            if (deviceStore.deviceCharacteristics === 'tablet' && deviceStore.MIOSVersion && deviceStore.MIOSVersion === 2 && deviceStore.androidTargetSdk >= 35) {
                return true;
            }
            return false;
        },
        onClick (row: EmbeddedMergeRuleItem) {
            const deviceStore = useDeviceStore();
            const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
                theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
            }));
            const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
                configProviderProps: configProviderPropsRef,
            });
             const code = 'eNqVVd1v2kAM/1/StwndVjRpU95SUKtJoFFSdc9H4oDFfe3uAmNV//fZR4BCC13zkrPP/tnnz6fMSA1ZnsWVqKXRctmKGSrMelmlXczyfi8DneVP5+VqDHKmoAQTrM/y6FvoZcEpjCM0MLCKudnVbfryq+tv19+vi6wTmcqINsu/iK+9DEO5sOshrrCGA1DrnPXxtlWqxL9whD+R6KetesMtMZZoiioSVtw89vNPvcrqdJNuA0hfLYQmIXFDDJYuE2+nc6oxc6oNorFK2TWaucIQxe8Wq6WorAmtBnHP1GBLvEA5daxFwe+ztV0bZWUtHpkadtSIcM+5QD/WvgMDXqrLJhq5sh4jiNvucGP/XNbgWPTFLxmrxUhG8B/24khKOiechwY8mApCCvLkQF9Sk21cWB+crIANFYksmTyntc1m/3I6qeBkR/xXyRybqKxqtWF/aogSlUAt5yAGif2Dz48I60PUThyMbY1WVGAosKmQCGiQqAlRLw2/DnaytEroYgw1youWbIVSUZ+IsJAeyG+foshRKZkzBAVzyu/H1O/vixBelGbSipxKE7kBDFT819oa8YbkHp96mV6hbU0ZEJwfXNG/ExXFlvEA2u3UKWvRSxOQpoThvIX3E3d6HXQQpQ4jO0czpOfZ+bksRwBDwfaBPEzvftgxxsQ41n2rh8hRzlKRflvxB/a+OZeu3UFxHAjAW7ol4x6CbT01wI1CsyTj044xohlB4+cDaAlhSqdzj+Yaa2SIi83MYy1mytuWClOUxRCpC2kenPP+RJPqgFqDxoK4o1Ux2FE73S+Uy0bJOWfQQxuA5sFeKH932Drut5m360AG6HEjnC/izZY+PI1tWIrThFaGl7gvw9dV8/nivArRejaY+mZ7HstUCnvEZzZ1cTF2q4trhx/d0ArrkQpdLNGVoJqilo7QuqVGgHHjGAr0DOoaal6u1PoV85xkkgvzWCAu0NcT6eOmcO4nwem0JRupAjz/AySS7HI='
            modal.create({
                title: '应用规则感知',
                type: 'info',
                preset: 'dialog',
                content () {
                    const NCodeTemplate = (code:string) => {
                        return h(NCode,{
                            code: code,
                            class: 'my-5 overflow-y-auto line-clamp-6',
                            language: 'Base64',
                            wordWrap: true
                        })
                    }
                    return (
                        <div>
                            <p>
                                小米已为{' '}
                                <span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
                                    {renderApplicationName(row.name, row.applicationName)}
                                </span>{' '}
                                {' '}适配了应用布局优化，您可以将此自定义规则通过{' '}
                                <span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
                                    [应用横屏布局-从分享口令导入]
                                </span>{' '}
                                进行导入并开启{' '}
                                <span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
                                    {renderApplicationName(row.name, row.applicationName)}
                                </span>{' '}在{' '}
                                <span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
                                    应用布局优化
                                </span>{' '}的开关，即可体验~
                            </p>
                            <p>Tips: 此规则需要搭配最新版的Hyper OS 2.0，老版本的 OS 2 可能由于小米BUG存在较为严重的内存泄露问题，会导致系统越来越卡顿。</p>
                            { NCodeTemplate && NCodeTemplate(code) }
                        </div>
                    )
                },
                positiveText: '复制自定义规则到剪贴板',
                negativeText: '取消',
                onPositiveClick: () => {
                    navigator.clipboard.writeText(code);
                },
                onNegativeClick: () => {},
            });
        },
    }
};
