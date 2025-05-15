import { renderApplicationName } from '@/utils/common';
import {
	type ConfigProviderProps,
	darkTheme,
	lightTheme,
	createDiscreteApi,
	NCode,
	NButton,
	type ButtonProps,
} from 'naive-ui';
import { computed, h } from 'vue';
import { useDeviceStore } from '@/stores/device';
import type EmbeddedMergeRuleItem from '@/types/EmbeddedMergeRuleItem';
import pako from 'pako';
import { arrayBufferToBase64 } from '@/utils/format';
// 定义每个应用的类型
interface EmbeddedPerceptionApplications {
	isShow: () => boolean;
	onClick: (row: EmbeddedMergeRuleItem) => void;
}
export const embeddedPerceptionApplications: Record<string, EmbeddedPerceptionApplications> = {
	'com.coolapk.market': {
		isShow() {
			const deviceStore = useDeviceStore();
			return deviceStore.androidTargetSdk > 33;
		},
		onClick(row: EmbeddedMergeRuleItem) {
			const deviceStore = useDeviceStore();
			const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
				theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
			}));
			const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
				configProviderProps: configProviderPropsRef,
			});
			modal.create({
				title: '应用规则感知',
				type: 'info',
				preset: 'dialog',
				content() {
					const NButtonTemplate = (
						text: string,
						type: ButtonProps['type'],
						onClick: ButtonProps['onClick'],
					) => {
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
					const handleClickFullRule = () => {
						const deviceStore = useDeviceStore();
						const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
							theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
						}));
						const { message, modal, notification } = createDiscreteApi(
							['message', 'modal', 'notification'],
							{
								configProviderProps: configProviderPropsRef,
							},
						);
						const shareContent = {
							name: 'com.coolapk.market',
							cmpt:
								deviceStore.MIOSVersion &&
								deviceStore.MIOSVersion >= 2 &&
								deviceStore.androidTargetSdk >= 35
									? 2
									: 1,
							em: {
								name: 'com.coolapk.market',
								...(deviceStore.MIOSVersion &&
								deviceStore.MIOSVersion >= 2 &&
								deviceStore.androidTargetSdk >= 35
									? {
											skipSelfAdaptive: true,
										}
									: undefined),
								splitPairRule: 'com.coolapk.market.view.main.MainActivity:*',
								activityRule: 'com.coolapk.market.view.main.MainActivity',
								transitionRules: 'com.coolapk.market.view.main.MainActivity',
								clearTop: false,
								splitMinWidth: 1800,
							},
							fo: {
								name: 'com.coolapk.market',
								disable: true,
								isShowDivider: true,
								...(deviceStore.MIOSVersion &&
								deviceStore.MIOSVersion >= 2 &&
								deviceStore.androidTargetSdk >= 35
									? {
											skipSelfAdaptive: true,
										}
									: undefined),
								supportFullSize: true,
							},
							type: 'embedded',
							device: deviceStore.deviceType === 'tablet' ? 'pad' : 'fold',
							mode: 'embedded',
							...(deviceStore.MIOSVersion &&
							deviceStore.MIOSVersion >= 2 &&
							deviceStore.androidTargetSdk >= 35
								? {
										thirdPartyAppOptimize: false,
									}
								: undefined),
						};
						const jsonString = JSON.stringify(shareContent);
						const deflate = pako.deflate(jsonString, {
							level: 9,
							memLevel: 9,
							windowBits: 15,
						});
						const compressedData = new Uint8Array(deflate);
						const base64String: string = arrayBufferToBase64(compressedData);
						const code = base64String;
						modal.create({
							title: '获取自定义规则',
							type: 'info',
							preset: 'dialog',
							content() {
								const NCodeTemplate = (code: string) => {
									return h(NCode, {
										code: code,
										class: 'my-5 overflow-y-auto line-clamp-6',
										language: 'Base64',
										wordWrap: true,
									});
								};
								return (
									<div>
										<p>
											使用此自定义规则会使{' '}
											<span
												class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
												{renderApplicationName(row.name, row.applicationName)}
											</span>{' '}
											在所有界面全屏显示，且不会进入{' '}
											<span
												class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
												平行窗口
											</span>{' '}
											,您可以将此自定义规则通过{' '}
											<span
												class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
												[应用横屏布局-从分享口令导入]
											</span>{' '}
											进行导入~
										</p>
										{NCodeTemplate && NCodeTemplate(code)}
									</div>
								);
							},
							positiveText: '复制自定义规则到剪贴板',
							negativeText: '取消',
							onPositiveClick: () => {
								navigator.clipboard.writeText(code);
							},
							onNegativeClick: () => {},
						});
					};
					const handleClickEmbeddedRule = () => {
						const deviceStore = useDeviceStore();
						const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
							theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
						}));
						const { message, modal, notification } = createDiscreteApi(
							['message', 'modal', 'notification'],
							{
								configProviderProps: configProviderPropsRef,
							},
						);
						const shareContent = {
							name: 'com.coolapk.market',
							cmpt:
								deviceStore.MIOSVersion &&
								deviceStore.MIOSVersion >= 2 &&
								deviceStore.androidTargetSdk >= 35
									? 2
									: 1,
							em: {
								name: 'com.coolapk.market',
								skipSelfAdaptive: true,
								splitRatio: deviceStore.deviceType === 'tablet' ? 0.3 : 0.5,
								splitPairRule:
									'com.coolapk.market.view.main.MainActivity:*,com.coolapk.market.view.userv9.UserSpaceV9Activity:*,com.coolapk.market.view.node.DynamicNodePageActivity:*,com.coolapk.market.view.search.SuperSearchResultActivity:*,com.coolapk.market.view.base.SimpleAlphaActivity:*,com.coolapk.market.view.feed.FeedDetailActivityV8:*,com.coolapk.market.view.appmanager.UpgradeManagerActivity:*,com.coolapk.market.view.feedv8.multiSubmit.MultiSubmitActivity:*,com.coolapk.market.view.appmanager.AppManagerActivity:*,com.coolapk.market.view.user.UserFeedListActivity:*,com.coolapk.market.view.contact.FriendListActivity:*,com.coolapk.market.view.contact.FansListActivity:*,com.coolapk.market.view.user.UserFollowAppActivity:*,com.coolapk.market.view.album.UserAlbumListActivity:*,com.coolapk.market.view.user.MyDigitTabListActivit:*,com.coolapk.market.view.goods.MyGoodsTabListActivity:*,com.coolapk.market.view.user.UserPictureListActivity:*,com.coolapk.market.view.dyhv8.DyhListActivity:*,com.coolapk.market.view.backupList.BackupListActivity:*,com.coolapk.market.view.message.ChattingActivity:*,com.coolapk.market.view.feed.FeedReplyDetailActivity:*,com.coolapk.market.view.feedv8.SubmitFeedV8Activity:*,com.coolapk.market.view.notification.NotificationActivity:*,com.coolapk.market.view.feed.ReplyActivity:*',
								activityRule:
									'com.coolapk.market.view.main.MainActivity,com.coolapk.market.view.wallpaper.coolpic.CoolPicDetailActivity,com.coolapk.market.view.appmanager.UpgradeManagerActivity,com.coolapk.market.view.feedv8.multiSubmit.MultiSubmitActivity,com.coolapk.market.view.feed.ReplyActivity,com.coolapk.market.view.splash.SplashActivity,com.coolapk.market.view.splash.FullScreenAdActivity,com.coolapk.market.view.video.VideoDetailListActivity,com.coolapk.market.view.feedv8.FeedEntranceV8Activity,com.coolapk.market.view.photo.QRCodeActivity,com.coolapk.market.view.feedv8.SubmitFeedV8Activity,com.coolapk.market.view.feedv8.QuestionTitleActivity,com.coolapk.market.view.goodsList.CreateFunThingsActivity,com.coolapk.market.view.permission.PrivacyActivity,com.coolapk.market.view.webview.LoginActivity,com.coolapk.market.view.live.LiveActivity,com.coolapk.market.view.message.ChattingActivity,com.coolapk.market.view.feed.FeedReplyDetailActivity,com.coolapk.market.view.feed.ForwardEntityActivity',
								transitionRules:
									'com.coolapk.market.view.main.MainActivity,com.coolapk.market.view.feedv8.multiSubmit.MultiSubmitActivity,com.coolapk.market.view.feedv8.SubmitFeedV8Activity,com.coolapk.market.view.message.ChattingActivity,com.coolapk.market.view.feed.ReplyActivity,com.coolapk.market.view.feed.FeedReplyDetailActivity',
								isShowDivider: true,
								supportFullSize: true,
								flags: 'reusePreContainer:com.coolapk.market.view.photo.PhotoViewActivity,com.coolapk.market.view.collectionList.CollectionSelectActivity;',
								...(deviceStore.deviceType === 'tablet'
									? {
											splitMinWidth: 900,
										}
									: undefined),
							},
							...(deviceStore.deviceType === 'tablet'
								? {
										fo: {
											name: 'com.coolapk.market',
											isShowDivider: true,
											disable: true,
											supportFullSize: true,
											...(deviceStore.MIOSVersion &&
											deviceStore.MIOSVersion >= 2 &&
											deviceStore.androidTargetSdk >= 35
												? {
														skipSelfAdaptive: true,
													}
												: undefined),
										},
									}
								: undefined),
							type: 'embedded',
							device: deviceStore.deviceType === 'tablet' ? 'pad' : 'fold',
							mode: 'embedded',
							...(deviceStore.MIOSVersion &&
							deviceStore.MIOSVersion >= 2 &&
							deviceStore.androidTargetSdk >= 35
								? {
										thirdPartyAppOptimize: false,
									}
								: undefined),
						};
						const jsonString = JSON.stringify(shareContent);
						const deflate = pako.deflate(jsonString, {
							level: 9,
							memLevel: 9,
							windowBits: 15,
						});
						const compressedData = new Uint8Array(deflate);
						const base64String: string = arrayBufferToBase64(compressedData);
						const code = base64String;
						modal.create({
							title: '获取自定义规则',
							type: 'info',
							preset: 'dialog',
							content() {
								const NCodeTemplate = (code: string) => {
									return h(NCode, {
										code: code,
										class: 'my-5 overflow-y-auto line-clamp-6',
										language: 'Base64',
										wordWrap: true,
									});
								};
								return (
									<div>
										<p>
											模块已为{' '}
											<span
												class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
												{renderApplicationName(row.name, row.applicationName)}
											</span>{' '}
											提供了更详尽的平行窗口自定义规则，您可以将此自定义规则通过{' '}
											<span
												class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
												[应用横屏布局-从分享口令导入]
											</span>{' '}
											进行导入~
										</p>
										<p>
											Tips: 此规则需要搭配最新版的Hyper OS 2.0，老版本的 OS 2
											可能由于小米BUG存在崩溃的问题。
										</p>
									</div>
								);
							},
							positiveText: '复制自定义规则到剪贴板',
							negativeText: '取消',
							onPositiveClick: () => {
								navigator.clipboard.writeText(code);
							},
							onNegativeClick: () => {},
						});
					};
					return (
						<div>
							<p>
								如果您希望{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									{renderApplicationName(row.name, row.applicationName)}
								</span>{' '}
								在所有界面全屏显示，且不会进入{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									平行窗口
								</span>{' '}
								,您可以将此自定义规则通过{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									[应用横屏布局-从分享口令导入]
								</span>{' '}
								进行导入~
								{NButtonTemplate &&
									NButtonTemplate('获取全局横屏自定义规则', 'info', () => handleClickFullRule())}
								{deviceStore.deviceType === 'tablet' &&
									deviceStore.MIOSVersion &&
									deviceStore.MIOSVersion === 2 &&
									deviceStore.androidTargetSdk >= 35 && (
										<div>
											<p>
												模块还为{' '}
												<span
													class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
													{renderApplicationName(row.name, row.applicationName)}
												</span>{' '}
												进行了更详尽的应用规则适配，您可以将此自定义规则通过{' '}
												<span
													class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
													[应用横屏布局-从分享口令导入]
												</span>{' '}
												进行导入~
											</p>
											<p>
												Tips: 此规则需要搭配最新版的Hyper OS 2.0，老版本的 OS 2
												可能由于小米BUG存在崩溃的问题。
											</p>
											<p>
												{NButtonTemplate &&
													NButtonTemplate('获取精适配平行窗口自定义规则', 'info', () =>
														handleClickEmbeddedRule(),
													)}
											</p>
										</div>
									)}
							</p>
						</div>
					);
				},
				negativeText: '关闭',
				onNegativeClick: () => {},
			});
		},
	},
	'tv.danmaku.bili': {
		isShow() {
			const deviceStore = useDeviceStore();
			if (
				deviceStore.deviceType === 'tablet' &&
				deviceStore.MIOSVersion &&
				deviceStore.MIOSVersion === 2 &&
				deviceStore.androidTargetSdk >= 35
			) {
				return true;
			}
			return false;
		},
		onClick(row: EmbeddedMergeRuleItem) {
			const deviceStore = useDeviceStore();
			const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
				theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
			}));
			const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
				configProviderProps: configProviderPropsRef,
			});
			const shareContent = {
				name: 'tv.danmaku.bili',
				cmpt:
					deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
						? 2
						: 1,
				em: {
					name: 'tv.danmaku.bili',
					disableSensor: true,
					splitLineColor: '#FFFFFF:#17181A',
					...(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
						? {
								skipSelfAdaptive: true,
							}
						: undefined),
					splitRatio: deviceStore.deviceType === 'tablet' ? 0.4 : 0.5,
					isShowDivider: true,
					supportFullSize: true,
					splitPairRule:
						'tv.danmaku.bili.MainActivityV2:*,com.bilibili.search.main.BiliMainSearchActivity:*,com.bilibili.bplus.followinglist.quick.consume.QuickConsumeActivity:*,tv.danmaku.bili.ui.videodownload.VideoDownloadListActivity:*,com.bilibili.lib.ui.GeneralActivity:*,tv.danmaku.bili.ui.favorite.FavoriteBoxActivity:*,tv.danmaku.bili.ui.main2.WatchLaterActivity:*,com.bilibili.lib.ui.GeneralActivity:*,com.bilibili.app.preferences.BiliPreferencesActivity:*,com.bilibili.app.authorspace.ui.AuthorSpaceActivity:*,com.bilibili.search2.main.BiliMainSearchActivity:*',
					activityRule:
						'tv.danmaku.bili.MainActivityV2,com.bilibili.column.ui.detail.image.ColumnImageViewerActivity,com.bilibili.studio.centerplus.ui.CenterPlusMainActivity,com.bilibili.lib.imageviewer.MediaViewerActivity,com.bilibili.socialize.share.core.ui.BiliShareDelegateActivity,com.bilibili.socialize.share.core.ui.QQAssistActivity,com.tencent.connect.common.AssistActivity,com.bilibili.upper.module.archive.activity.ArchiveTempActivity',
					transitionRules:
						'tv.danmaku.bili.MainActivityV2,tv.danmaku.bili.sms.SmsLoginDialogActivityV2,com.bilibili.teenagersmode.ui.TeenagersModeDialogActivity,tv.danmaku.bili.ui.answer.AnswerDialogTransferActivity,com.bilibili.bilibililive.ui.room.modresource.BlinkModResourceLoadingActivity,com.bilibili.bilibililive.ui.room.BlinkRoomActivityV2,com.bilibili.lib.fasthybrid.blrouter.SADispatcherActivity,com.bilibili.lib.fasthybrid.container.GameContainerActivity0',
					flags: 'reusePreContainer:com.bilibili.bplus.followinglist.page.browser.ui.LightBrowserActivityV2',
					forcePortraitActivity:
						'tv.danmaku.bili/com.bilibili.app.preferences.storage.BiliStorageManagerActivity',
				},
				...(deviceStore.deviceType === 'tablet'
					? {
							fo: {
								name: 'tv.danmaku.bili',
								...(deviceStore.MIOSVersion &&
								deviceStore.MIOSVersion >= 2 &&
								deviceStore.androidTargetSdk >= 35
									? {
											skipSelfAdaptive: true,
											supportModes: 'full,fo',
										}
									: undefined),
							},
						}
					: undefined),
				type: 'embedded',
				device: deviceStore.deviceType === 'tablet' ? 'pad' : 'fold',
				mode: 'embedded',
				...(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
					? {
							thirdPartyAppOptimize: false,
						}
					: undefined),
			};
			const jsonString = JSON.stringify(shareContent);
			const deflate = pako.deflate(jsonString, {
				level: 9,
				memLevel: 9,
				windowBits: 15,
			});
			const compressedData = new Uint8Array(deflate);
			const base64String: string = arrayBufferToBase64(compressedData);
			const code = base64String;
			modal.create({
				title: '应用规则感知',
				type: 'info',
				preset: 'dialog',
				content() {
					const NCodeTemplate = (code: string) => {
						return h(NCode, {
							code: code,
							class: 'my-5 overflow-y-auto line-clamp-6',
							language: 'Base64',
							wordWrap: true,
						});
					};
					return (
						<div>
							<p>
								小米已为{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									{renderApplicationName(row.name, row.applicationName)}
								</span>{' '}
								适配了应用布局优化，您可以将此自定义规则通过{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									[应用横屏布局-从分享口令导入]
								</span>{' '}
								进行导入并开启{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									{renderApplicationName(row.name, row.applicationName)}
								</span>{' '}
								在{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									应用布局优化
								</span>{' '}
								的开关，即可体验~
							</p>
							<p>
								Tips: 此规则需要搭配最新版的Hyper OS 2.0，老版本的 OS 2
								可能由于小米BUG存在较为严重的内存泄露问题，会导致系统越来越卡顿。
							</p>
							{NCodeTemplate && NCodeTemplate(code)}
						</div>
					);
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
			return true;
		},
		onClick(row: EmbeddedMergeRuleItem) {
			const deviceStore = useDeviceStore();
			const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
				theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
			}));
			const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
				configProviderProps: configProviderPropsRef,
			});
			const shareContent = {
				name: 'com.bilibili.app.in',
				cmpt:
					deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
						? 2
						: 1,
				em: {
					name: 'com.bilibili.app.in',
					disableSensor: true,
					splitLineColor: '#FFFFFF:#17181A',
					isShowDivider: true,
					supportFullSize: true,
					...(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
						? {
								skipSelfAdaptive: true,
							}
						: undefined),
					splitRatio: deviceStore.deviceType === 'tablet' ? 0.4 : 0.5,
					placeholder: 'tv.danmaku.bili.MainActivityV2:com.bilibili.search.main.BiliMainSearchActivity',
					splitPairRule:
						'tv.danmaku.bili.MainActivityV2:*,com.bilibili.search.main.BiliMainSearchActivity:*,com.bilibili.bplus.followinglist.quick.consume.QuickConsumeActivity:*,tv.danmaku.bili.ui.videodownload.VideoDownloadListActivity:*,com.bilibili.lib.ui.GeneralActivity:*,tv.danmaku.bili.ui.favorite.FavoriteBoxActivity:*,tv.danmaku.bili.ui.main2.WatchLaterActivity:*,com.bilibili.lib.ui.GeneralActivity:*,com.bilibili.app.preferences.BiliPreferencesActivity:*,com.bilibili.app.authorspace.ui.AuthorSpaceActivity:*,com.bilibili.search2.main.BiliMainSearchActivity:*',
					activityRule:
						'com.bilibili.column.ui.detail.image.ColumnImageViewerActivity,com.bilibili.studio.centerplus.ui.CenterPlusMainActivity,com.bilibili.lib.imageviewer.MediaViewerActivity,com.bilibili.socialize.share.core.ui.BiliShareDelegateActivity,com.bilibili.socialize.share.core.ui.QQAssistActivity,com.tencent.connect.common.AssistActivity,com.bilibili.upper.module.archive.activity.ArchiveTempActivity,com.bilibili.video.story.StoryTransparentActivity',
					transitionRules:
						'com.bilibili.lib.imageviewer.MediaViewerActivity,tv.danmaku.bili.sms.SmsLoginDialogActivityV2,com.bilibili.teenagersmode.ui.TeenagersModeDialogActivity,tv.danmaku.bili.ui.answer.AnswerDialogTransferActivity,com.bilibili.bilibililive.ui.room.modresource.BlinkModResourceLoadingActivity,com.bilibili.bilibililive.ui.room.BlinkRoomActivityV2,com.bilibili.lib.fasthybrid.blrouter.SADispatcherActivity,com.bilibili.lib.fasthybrid.container.GameContainerActivity0',
					flags: 'reusePreContainer:com.bilibili.bplus.followinglist.page.browser.ui.LightBrowserActivityV2;',
					forcePortraitActivity:
						'com.bilibili.app.blue/com.bilibili.app.preferences.storage.BiliStorageManagerActivity',
				},
				...(deviceStore.deviceType === 'tablet'
					? {
							fo: {
								name: 'com.bilibili.app.in',
								...(deviceStore.MIOSVersion &&
								deviceStore.MIOSVersion >= 2 &&
								deviceStore.androidTargetSdk >= 35
									? {
											skipSelfAdaptive: true,
											supportModes: 'full,fo',
										}
									: undefined),
							},
						}
					: undefined),
				type: 'embedded',
				device: deviceStore.deviceType === 'tablet' ? 'pad' : 'fold',
				mode: 'embedded',
				...(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
					? {
							thirdPartyAppOptimize: false,
						}
					: undefined),
			};
			const jsonString = JSON.stringify(shareContent);
			const deflate = pako.deflate(jsonString, {
				level: 9,
				memLevel: 9,
				windowBits: 15,
			});
			const compressedData = new Uint8Array(deflate);
			const base64String: string = arrayBufferToBase64(compressedData);
			const code = base64String;
			modal.create({
				title: '应用规则感知',
				type: 'info',
				preset: 'dialog',
				content() {
					const NCodeTemplate = (code: string) => {
						return h(NCode, {
							code: code,
							class: 'my-5 overflow-y-auto line-clamp-6',
							language: 'Base64',
							wordWrap: true,
						});
					};
					return (
						<div>
							<p>
								部分版本的{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									{renderApplicationName(row.name, row.applicationName)}
								</span>{' '}
								可能需要单独的规则才能正常触发应用冷启动分屏，您可以将此自定义规则通过{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									[应用横屏布局-从分享口令导入]
								</span>{' '}
								进行导入~
							</p>
							{NCodeTemplate && NCodeTemplate(code)}
						</div>
					);
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
	'com.bilibili.app.blue': {
		isShow() {
			const deviceStore = useDeviceStore();
			return true;
		},
		onClick(row: EmbeddedMergeRuleItem) {
			const deviceStore = useDeviceStore();
			const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
				theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
			}));
			const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
				configProviderProps: configProviderPropsRef,
			});
			const shareContent = {
				name: 'com.bilibili.app.blue',
				cmpt:
					deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
						? 2
						: 1,
				em: {
					name: 'com.bilibili.app.blue',
					disableSensor: true,
					splitLineColor: '#FFFFFF:#17181A',
					...(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
						? {
								skipSelfAdaptive: true,
							}
						: undefined),
					splitRatio: deviceStore.deviceType === 'tablet' ? 0.4 : 0.5,
					isShowDivider: true,
					supportFullSize: true,
					splitPairRule:
						'tv.danmaku.bili.MainActivityV2:*,com.bilibili.search.main.BiliMainSearchActivity:*,com.bilibili.bplus.followinglist.quick.consume.QuickConsumeActivity:*,tv.danmaku.bili.ui.videodownload.VideoDownloadListActivity:*,com.bilibili.lib.ui.GeneralActivity:*,tv.danmaku.bili.ui.favorite.FavoriteBoxActivity:*,tv.danmaku.bili.ui.main2.WatchLaterActivity:*,com.bilibili.lib.ui.GeneralActivity:*,com.bilibili.app.preferences.BiliPreferencesActivity:*,com.bilibili.app.authorspace.ui.AuthorSpaceActivity:*,com.bilibili.search2.main.BiliMainSearchActivity:*',
					activityRule:
						'tv.danmaku.bili.MainActivityV2,com.bilibili.column.ui.detail.image.ColumnImageViewerActivity,com.bilibili.studio.centerplus.ui.CenterPlusMainActivity,com.bilibili.lib.imageviewer.MediaViewerActivity,com.bilibili.socialize.share.core.ui.BiliShareDelegateActivity,com.bilibili.socialize.share.core.ui.QQAssistActivity,com.tencent.connect.common.AssistActivity,com.bilibili.upper.module.archive.activity.ArchiveTempActivity',
					transitionRules:
						'tv.danmaku.bili.MainActivityV2,tv.danmaku.bili.sms.SmsLoginDialogActivityV2,com.bilibili.teenagersmode.ui.TeenagersModeDialogActivity,tv.danmaku.bili.ui.answer.AnswerDialogTransferActivity,com.bilibili.bilibililive.ui.room.modresource.BlinkModResourceLoadingActivity,com.bilibili.bilibililive.ui.room.BlinkRoomActivityV2,com.bilibili.lib.fasthybrid.blrouter.SADispatcherActivity,com.bilibili.lib.fasthybrid.container.GameContainerActivity0',
					flags: 'reusePreContainer:com.bilibili.bplus.followinglist.page.browser.ui.LightBrowserActivityV2',
					forcePortraitActivity:
						'tv.danmaku.bili/com.bilibili.app.preferences.storage.BiliStorageManagerActivity',
				},
				...(deviceStore.deviceType === 'tablet'
					? {
							fo: {
								name: 'com.bilibili.app.blue',
								...(deviceStore.MIOSVersion &&
								deviceStore.MIOSVersion >= 2 &&
								deviceStore.androidTargetSdk >= 35
									? {
											skipSelfAdaptive: true,
											supportModes: 'full,fo',
										}
									: undefined),
							},
						}
					: undefined),
				type: 'embedded',
				device: deviceStore.deviceType === 'tablet' ? 'pad' : 'fold',
				mode: 'embedded',
				...(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
					? {
							thirdPartyAppOptimize: false,
						}
					: undefined),
			};
			const jsonString = JSON.stringify(shareContent);
			const deflate = pako.deflate(jsonString, {
				level: 9,
				memLevel: 9,
				windowBits: 15,
			});
			const compressedData = new Uint8Array(deflate);
			const base64String: string = arrayBufferToBase64(compressedData);
			const code = base64String;
			modal.create({
				title: '应用规则感知',
				type: 'info',
				preset: 'dialog',
				content() {
					const NCodeTemplate = (code: string) => {
						return h(NCode, {
							code: code,
							class: 'my-5 overflow-y-auto line-clamp-6',
							language: 'Base64',
							wordWrap: true,
						});
					};
					return (
						<div>
							<p>
								小米已为{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									{renderApplicationName(row.name, row.applicationName)}
								</span>{' '}
								适配了应用布局优化，您可以将此自定义规则通过{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									[应用横屏布局-从分享口令导入]
								</span>{' '}
								进行导入并开启{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									{renderApplicationName(row.name, row.applicationName)}
								</span>{' '}
								在{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									应用布局优化
								</span>{' '}
								的开关，即可体验~
							</p>
							<p>
								Tips: 此规则需要搭配最新版的Hyper OS 2.0，老版本的 OS 2
								可能由于小米BUG存在较为严重的内存泄露问题，会导致系统越来越卡顿。
							</p>
							{NCodeTemplate && NCodeTemplate(code)}
						</div>
					);
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
	'com.hexin.plat.android': {
		isShow() {
			const deviceStore = useDeviceStore();
			return true;
		},
		onClick(row: EmbeddedMergeRuleItem) {
			const deviceStore = useDeviceStore();
			const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
				theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
			}));
			const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
				configProviderProps: configProviderPropsRef,
			});
			modal.create({
				title: '应用规则感知',
				type: 'info',
				preset: 'dialog',
				content() {
					const NCodeTemplate = (code: string) => {
						return h(NCode, {
							code: code,
							class: 'my-5 overflow-y-auto line-clamp-6',
							language: 'Base64',
							wordWrap: true,
						});
					};
					return (
						<div>
							<p>
							{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									{renderApplicationName(row.name, row.applicationName)}
								</span>{' '}已自适配 Android 原生的平行视界，您可以前往{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									{renderApplicationName(row.name, row.applicationName)}
								</span>{' '}的{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									系统设置
								</span>{' '}
								通过{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									开启平行视窗模式
								</span>{' '}
								开关控制应用{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									全屏显示
								</span>{' '}
								还是{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									平行窗口
								</span>{' '}~
							</p>
						</div>
					);
				},
				positiveText: '确定'
			});
		}
	},
	'com.douban.frodo': {
		isShow() {
			const deviceStore = useDeviceStore();
			return true;
		},
		onClick(row: EmbeddedMergeRuleItem) {
			const deviceStore = useDeviceStore();
			const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
				theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
			}));
			const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
				configProviderProps: configProviderPropsRef,
			});
			modal.create({
				title: '应用规则感知',
				type: 'info',
				preset: 'dialog',
				content() {
					const NCodeTemplate = (code: string) => {
						return h(NCode, {
							code: code,
							class: 'my-5 overflow-y-auto line-clamp-6',
							language: 'Base64',
							wordWrap: true,
						});
					};
					return (
						<div>
							<p>
							{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									{renderApplicationName(row.name, row.applicationName)}
								</span>{' '}已自适配 Android 原生的平行视界，您可以前往{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									{renderApplicationName(row.name, row.applicationName)}
								</span>{' '}的{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									设置
								</span>{' '}
								通过{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									双屏模式
								</span>{' '}
								开关控制应用{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									全屏显示
								</span>{' '}
								还是{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									平行窗口
								</span>{' '}~
							</p>
						</div>
					);
				},
				positiveText: '确定'
			});
		}
	}
};
