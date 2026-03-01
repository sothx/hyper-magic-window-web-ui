<script setup lang="tsx">
import { RouterLink, RouterView, useRouter } from 'vue-router';
import HelloWorld from './components/HelloWorld.vue';
import { Sidebar } from './components/Sidebar';
import $to from 'await-to-js';
import ErrorModal from '@/components/ErrorModal.vue';
import SplashScreen from '@/components/SplashScreen.vue';
import * as deviceApi from '@/apis/deviceApi';
import { ref, onMounted, watch, watchEffect, computed, nextTick } from 'vue';
import { useDeviceStore } from '@/stores/device';
import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps } from 'naive-ui';
import { useEmbeddedStore } from '@/stores/embedded';
import { useFontStore } from '@/stores/font';
import { useDotBlackListStore } from '@/stores/dotBlackList';
import { useLogsStore } from '@/stores/logs';
import { usePatchMode } from '@/hooks/usePatchMode';
import { useAutoUIStore } from '@/stores/autoui';
import { useGameBoosterStore } from './stores/gameBooster';
import axios from 'axios';
import { decryptAesEcb, fetchAndDecryptJsonFile, generateKey } from './utils/joyoseConfig/decryptor';
import { compressJson, encryptAesEcb } from './utils/joyoseConfig/encryptor';
const deviceStore = useDeviceStore();
const logsStore = useLogsStore();
const router = useRouter();
const gameBoosterStore = useGameBoosterStore();
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
	theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
}));
const { message, modal } = createDiscreteApi(['message', 'modal'], {
	configProviderProps: configProviderPropsRef,
});

const embeddedStore = useEmbeddedStore();
const fontStore = useFontStore();
const autoUIStore = useAutoUIStore();
const patchModeHook = usePatchMode();
const dotBlackListStore = useDotBlackListStore();
const showErrorModal = ref(false);
const isSplashVisible = ref(true);

watchEffect(onCleanup => {
	// 检查 deviceStore.loading 和 embeddedStore.loading 是否都为 false
	if (!deviceStore.loading) {
		if (['tablet', 'fold'].includes(deviceStore.deviceType) && !embeddedStore.loading) {
			isSplashVisible.value = false; // 隐藏开屏页
		}
		if (['phone'].includes(deviceStore.deviceType)) {
			isSplashVisible.value = false; // 隐藏开屏页
		}
	}

	if (deviceStore.errorLogging.length || embeddedStore.errorLogging.length) {
		isSplashVisible.value = false; // 隐藏开屏页
	}

	// 清理函数，不再需要监听时执行
	onCleanup(() => {
		// 这里可以移除其他的副作用，如定时器等
	});
});

watch(
	() => fontStore.currentFont, // 监听的值
	(newValue, oldValue) => {
		// 回调函数，值变化时执行
		if (newValue) {
			document.documentElement.style.setProperty('--global-font-family', fontStore.currentFontFamily);
		}
	},
	{ immediate: true }, // 默认是 false，不需要设置，确保不会在初始时执行
);

watch(
	() => deviceStore.isNeedShowErrorModal, // 监听的值
	(newValue, oldValue) => {
		// 回调函数，值变化时执行
		if (newValue) {
			showErrorModal.value = true;
		}
	},
	{ immediate: false }, // 默认是 false，不需要设置，确保不会在初始时执行
);

function getCurrentTheme() {
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? true : false;
}

// 使用 watchEffect 来监听 prefers-color-scheme 的变化
watchEffect(onCleanup => {
	const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
	if (deviceStore.rhythmMode === 'autoRhythm') {
		deviceStore.isDarkMode = getCurrentTheme(); // 初始化主题
	}

	const handler = (event: MediaQueryListEvent) => {
		if (deviceStore.rhythmMode === 'autoRhythm') {
			deviceStore.isDarkMode = event.matches; // 直接使用 boolean 值
		}
	};

	// 添加监听器
	mediaQueryList.addEventListener('change', handler);

	// 清理函数
	onCleanup(() => {
		mediaQueryList.removeEventListener('change', handler);
	});
});

const loadRoutes = async () => {
	let module;
	if (deviceStore.deviceType === 'tablet') {
		module = await import('./router/device_routes/tablet');
	} else if (deviceStore.deviceType === 'fold') {
		module = await import('./router/device_routes/fold');
	} else {
		module = await import('./router/device_routes/phone');
	}

	// 确保路由全部添加完成
	module.default.forEach(item => {
		router.addRoute(item);
	});
	// **等待 Vue Router 解析完成**
	await router.isReady();

	// **获取当前路径**
	const currentPath = router.currentRoute.value.path;

	// 获取上次访问的url
	const lastPath = deviceStore.lastVisitedPath;

	if (lastPath && typeof lastPath === 'string') {
		const resolved = router.resolve(lastPath);
		const routeExists = resolved.matched.length > 0;

		if (routeExists) {
			router.replace(lastPath);
			return; // 成功跳转后直接 return，避免后续逻辑干扰
		}
		router.replace('/');
		return;
	}

	// **如果当前路径是 `/`，才执行 redirect**
	const firstRouteRedirect = module.default[0]?.redirect as string | undefined;
	if (currentPath === '/' && firstRouteRedirect) {
		router.replace(firstRouteRedirect);
	} else {
		// **确保 Vue Router 重新解析当前路径**
		router.replace({ path: currentPath, replace: true });
	}
};

function downloadEncryptedFile(encryptedBytes: Uint8Array, fileName = 'encrypted.json') {
	const blob = new Blob([encryptedBytes], { type: 'application/octet-stream' });
	const url = URL.createObjectURL(blob);

	const a = document.createElement('a');
	a.href = url;
	a.download = fileName;
	a.style.display = 'none';

	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);

	URL.revokeObjectURL(url); // 清理 blob URL

	console.log(`📦 加密文件已下载为：${fileName}`);
}

async function testEncryptDecryptConsistency() {
	// 1. 解密原始加密文件
	const result = await fetchAndDecryptJsonFile('./data/joyose/encrypt_default_cloud.json');

	console.log('✅ 解密后的 JSON 数据:', result.data);

	// 2. 压缩 JSON 为单行字符串（用于加密）
	const compressed = compressJson(JSON.stringify(result.data));
	console.log('✅ 压缩后的 JSON 字符串:', compressed);

	// 3. 再次加密为 Uint8Array
	const key = generateKey();
	const encryptedBytes = encryptAesEcb(compressed, key);

	console.log('✅ 重新加密完成，长度:', encryptedBytes.length);

	// 4. 再次解密为字符串
	const decryptedAgain = decryptAesEcb(encryptedBytes.buffer, key);
	console.log('✅ 再次解密字符串:', decryptedAgain);

	// 5. 尝试解析为 JSON
	let parsed;
	try {
		parsed = JSON.parse(decryptedAgain);
		console.log('✅ 二次解密后 JSON 解析成功');
	} catch (e) {
		console.error('❌ 二次解密后 JSON 解析失败');
	}

	// 6. 检查是否与第一次解密的内容一致
	const original = JSON.stringify(result.data);
	const afterCycle = JSON.stringify(parsed);

	if (original === afterCycle) {
		console.log('✅ 加解密过程一致 ✅');
		// ✅ 触发下载
		downloadEncryptedFile(encryptedBytes, result.fileName);
	} else {
		console.warn('⚠️ 加解密过程不一致 ❌');
		console.log('原始:', original);
		console.log('再解密:', afterCycle);
	}
}

onMounted(async () => {
	// testEncryptDecryptConsistency();

	window.onerror = function (message, source, lineno, colno, error) {
		if (logsStore) {
			logsStore.error('[JavaScript Error]', message.toString());
		}
	};

	window.addEventListener('unhandledrejection', function (event: PromiseRejectionEvent) {
		if (logsStore) {
			logsStore.error('[JavaScript Promise Error]', event.reason.toString());
		}
	});
	if (!deviceStore.canUsePackageInfo() && import.meta.env.MODE !== 'development') {
		modal.create({
			title: 'Web UI 升级提醒',
			type: 'error',
			preset: 'dialog',
			closeOnEsc: false,
			zIndex:9999,
			show: true,
			maskClosable: false,
			closable: false,
			content: () => (
				<div>
					<p>
						您当前运行的 Web UI 管理器版本较低，会导致模块功能显示不全，请安装全新独立版本的
						「KsuWebUI」，并授予root权限，否则模块将无法正常工作。
					</p>
					{/* <p class="whitespace-wrap">
						您也可前往
						<p>/data/adb/modules/Hyper_MagicWindow/common/apks</p>
						目录下，找到名为KsuWebUI.apk的安装包，安装后同样可以解决问题。
					</p> */}
					<p class="mt-2">下载地址:https://caiyun.139.com/m/i?135CljmnAbpAy</p>
				</div>
			),
			positiveText: '复制下载链接到剪切板',
			onPositiveClick: () => {
				navigator.clipboard.writeText(`https://caiyun.139.com/m/i?135CljmnAbpAy`);
				deviceApi.openChinaMobileMCloud()
				return false;
			},
		});
		return;
	}
	await deviceStore.initDefault();
	await loadRoutes();
	if (
		deviceStore.androidTargetSdk === 33 &&
		deviceStore.MIOSVersion &&
		deviceStore.MIOSVersion === 1 &&
		!deviceStore.skipConfirm.needReloadSystemModuleVer
	) {
		modal.create({
			title: '模块额外说明',
			type: 'warning',
			preset: 'dialog',
			content: () => (
				<div>
					<p>
						基于Android 13 的 Hyper OS 1
						存在系统异常问题，可能导致「应用横屏布局」和「应用布局优化」的相关修改需要手动重启设备才会生效，请知悉此异常问题~
					</p>
				</div>
			),
			positiveText: '确定',
			negativeText: '已知悉，不再提醒',
			onNegativeClick: () => {
				deviceStore.skipConfirm.needReloadSystemModuleVer = true;
			},
		});
	}
	if (['tablet', 'fold'].includes(deviceStore.deviceType)) {
		embeddedStore.initDefault().then(() => {
			if (embeddedStore.isNeedShowReloadPathModeDialog) {
				patchModeHook.showReloadModal();
			}
		});
		autoUIStore.initDefault();
		gameBoosterStore.initDefault();
		if (deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 1) {
			dotBlackListStore.initDefault();
		}
	}
	// 获取更新信息
	if (deviceStore.moduleInfo?.updateJson) {
		deviceApi.getModuleUpdateMsg(deviceStore.moduleInfo.updateJson).then(res => {
			deviceStore.moduleUpdateInfo = res;
			const changeLogURL = deviceStore.moduleUpdateInfo?.changelog;
			if (changeLogURL) {
				deviceApi.getModuleChangelog(changeLogURL).then(res => {
					console.log(res, 'res');
					deviceStore.changeLogMsg = res;
				});
			}
			if (
				deviceStore.moduleInfo &&
				deviceStore.moduleUpdateInfo?.versionCode &&
				deviceStore.moduleUpdateInfo.versionCode > deviceStore.moduleInfo?.versionCode &&
				deviceStore.moduleUpdateInfo.versionCode > deviceStore.skipConfirm.needUpdateModuleVer
			) {
				const currentUpdateVer = deviceStore.moduleUpdateInfo.version;
				const currentChinaMobileMCloudUrl = deviceStore.moduleUpdateInfo.chinaMobileMCloudUrl;
				modal.create({
					title: '发现模块存在新版本',
					type: 'info',
					preset: 'dialog',
					content: () => (
						<div>
							<p>
								完美横屏应用计划已更新至 {currentUpdateVer}，您可以从网盘或者Github获取最新版本的模块。
							</p>
							<p>下载地址:{currentChinaMobileMCloudUrl}</p>
						</div>
					),
					positiveText: '复制下载链接到剪切板',
					negativeText: '跳过当前版本的更新',
					onPositiveClick: () => {
						navigator.clipboard.writeText(currentChinaMobileMCloudUrl);
						deviceApi.openChinaMobileMCloud();
					},
					onNegativeClick: () => {
						if (deviceStore.moduleUpdateInfo) {
							deviceStore.skipConfirm.needUpdateModuleVer = deviceStore.moduleUpdateInfo.versionCode;
						}
					},
				});
			}
		});
	}
});
</script>

<template>
	<!-- <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header> -->
	<div class="app-container h-full" :class="`${deviceStore.isDarkMode ? 'theme-dark-mode bg-zinc-900' : 'bg-white'}`">
		<n-config-provider :theme="deviceStore.isDarkMode ? darkTheme : lightTheme">
			<Sidebar>
				<RouterView />
			</Sidebar>
			<ErrorModal v-model="showErrorModal" :errorLogging="deviceStore.errorLogging" />
			<SplashScreen v-if="isSplashVisible" />
		</n-config-provider>
	</div>
</template>

<style scoped>
/* header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
} */
</style>
