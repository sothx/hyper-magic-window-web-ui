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
    },
    'com.bilibili.app.in': {
        isShow() {
            const deviceStore = useDeviceStore();
            if (deviceStore.deviceCharacteristics === 'tablet') {
                return true;
            }
            return true;
        },
        onClick (row: EmbeddedMergeRuleItem) {
            const deviceStore = useDeviceStore();
            const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
                theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
            }));
            const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
                configProviderProps: configProviderPropsRef,
            });
             const code = deviceStore.androidTargetSdk <35 ? 'eNqVVW1vGjEM/i/XbxXKRlVp0+3TAWo1CTTaq7rP4c5wVvO2JAdjVf/77ADlpUBbJEhs/Bb7sf2cGakhy7PKajFBhfwV0jmBJutklXYxy7udDHSWP5+XrTHIiYISTLA+y6NvoZMFpzAO0UDfKuZmFzfpk190v3W/dwvSw1A2djHAOdaw1Wudsz7etEqV+A/2zN3LiDbLv4rr607mlKygsSrpZnEuamm0fGpTgGIk0RRVJNtx+XiV7wUeQPqquRKaZESPOCxcJuZGJVt7HEv0962C9z1cdo74OOfiUGPiVBvE1CplF2hmCkMUf1qsnkRlTWg1iDum+itix8phYC0Kzqit7cIoK2vxyNRgTQ3J7qkQ6GDtWzDgpTrvYirn1mMEcbO+9Ozf8xqciyvxW8aqGcoI/tNRvEGf8zAFD6aCkJI83tLn1GQbG+uDI/ywoyKRJZOntD6AmPySMCPXxBoyezYqq1pt2GENUaISqOUMRD+xf/L9EWGxTctBBLGt0YoKDGUuIYUM9RM1JmoXjG+zmTzNk3UxghrlWU+2Qqmo9URopAeK26c08bNL5gxAwYwK+Dn1u7sihB3sJa3ItTKREW6g4lNra8QRyVf7NB7oFdrWlGLBBcA5nWtRUawYD6DdcfXUGZRN65ei5N/UHB+UffDSEGwIYXFnUETmIk0mw2UPh3X/SAEOuyXoIEodhnaGZkDptLPtpNmPMQIYsu0DZSTl+WHDGBFjX/dYU1LoHFSRjpV4euX0FDw2F8V5JwPe0r/k3EOwraeO6ik0T+T8fs0Y0tChefYJa8nCPd1OPZpTOpUhNsuJx1pMlLctNYIoiwFSfWjAnIr+QJNwR61Ic0bc0oLrb6iN7leq7lTJGdfUQxuABsyrUP7u9Hbc3xNvF4Ec0OOGOGtib0Vvn/aDnVhK1JjWnpe4hdaRfTtRLXw5OwcZruw3tevqPpIJEa92X9jhO1udZOLS8b+gJ1DXUPOiJwxXzHOSSYbcvkBs0Ndj6eOycO6Xi6jTCp9KFeDlP/g2JXE=' : 'eNqVVm1v2kAM/i/ptwnd1mrSJvYpgFpNohptqu7zkTjE6r3t7gJjVf/77COUlwItSJCz47ezH9s8Z0ZqyPpZabWYokL+CumcQJP1slK7mPWvehnorP98WrbCIKcKCjDB+qwffQu9LDiFcYwGhlYxN7u4Tp/+xeW3y++XOelhKBq7GOEcK9jotc5ZH69bpQr8Bzvm7mVEm/W/iK+9zClZQmNVUs3iXFTSaPnUpvjErUSTl5FMx+XjVX8n7gDSl43QJCIGxGDZIvHWGlnnbyLR37cK3nfwqXemi32NqVNtELVVyi7QzBSGKP60WD6J0prQahB3TA1XxJaV/cBaFJxPW9mFUVZW4pGpUUeNye6xEOjB2jdgwEt12kUt59ZjBHHdHQb272kNzsWV+C1j2YxlBH92FG+w5zzU4MGUEFKSJxv6lJpsY2N9cAQfdpQnsmDymNaqmleny0mYkR3RQWbHRmlVqw07rCBKVAK1nIEYJvZPPj8iLDZp2YsgthVaUYKhzCWkkKFhoiZEbYPxbTaTp3myLm6hQnnSky1RKmo8ERrpgeL2KU187YI5I1AwowKep353l4ewhb2kFblWJjLCDZT81NoacUDy1T4NB7qFthWlWHABcE7PTlTkK8YDaHdYPXUGZdP6pSj4NzXHB2UfvDQEG0JY3BoUkblIc8lw2cN+3T9SgP1uCTqIQoexnaEZUTrtbDNpdmOMAIZs+0AZSXl+WDNuibGre6gpKXQOKk+PlXi6ZX0MHuuD4ryTAW/pLTn3EGzrqaMGCs0TOb/vGGMaOjTPzrCWLNzT6dilOaW1DLFZTj1WYqq8bakRRJGPkOpDA+ZY9HuahDtqRZoz4obW23BNrXW/UHVrJWdcUw9tABowr0L9d6e34/6eersI5IAuN8ZZEwcrenO1H+zEUqImtPS8xA20DmzbqWrh88k5yHBlv6ldV+dbmRDxaveFHb6707s1zDDi+9e0jnukRi+e0BWg6rySjix2C5qMxqVjc6CnUFVQ8f8CAn3JPCeZZIzuCsQGfTWRPi5z536ROZ02fi1VgJf/awo2nA=='
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
                                部分版本的{' '}
                                <span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
                                    {renderApplicationName(row.name, row.applicationName)}
                                </span>{' '}
                                {' '}可能需要单独的规则才能正常触发应用冷启动分屏，您可以将此自定义规则通过{' '}
                                <span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
                                    [应用横屏布局-从分享口令导入]
                                </span>{' '}
                                进行导入~
                            </p>
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
