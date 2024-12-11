<script setup lang="tsx">
import { RouterLink, RouterView } from 'vue-router';
import HelloWorld from './components/HelloWorld.vue';
import { Sidebar } from './components/Sidebar';
import ErrorModal from '@/components/ErrorModal.vue';
import SplashScreen from '@/components/SplashScreen.vue';
import { ref, onMounted, watch, watchEffect, computed } from 'vue';
import { useDeviceStore } from '@/stores/device';
import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps } from 'naive-ui';
import { useEmbeddedStore } from '@/stores/embedded';
import { useFontStore } from '@/stores/font';
import { useDotBlackListStore } from '@/stores/dotBlackList';
import { useLogsStore } from '@/stores/logs';
import { useAutoUIStore } from '@/stores/autoui';
import { useGameBoosterStore } from './stores/gameBooster';
const deviceStore = useDeviceStore();
const logsStore = useLogsStore();
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
const dotBlackListStore = useDotBlackListStore();
const showErrorModal = ref(false);
const isSplashVisible = ref(true);

watchEffect((onCleanup) => {
  // 检查 deviceStore.loading 和 embeddedStore.loading 是否都为 false
  if (!deviceStore.loading && !embeddedStore.loading) {
    isSplashVisible.value = false;  // 隐藏开屏页
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

onMounted(async () => {
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
	await deviceStore.initDefault();
	if (deviceStore.androidTargetSdk && deviceStore.androidTargetSdk === 30) {
		modal.create({
			title: '不适配说明',
			type: 'error',
			preset: 'dialog',
			content: () => <p>Web UI 未对Android 11做适配，无法使用~</p>,
			negativeText: '确定',
		});
	} else {
		if (deviceStore.androidTargetSdk && deviceStore.androidTargetSdk <= 33 && !deviceStore.skipConfirm.lowWebViewVersion) {
			modal.create({
				title: '不兼容说明',
				type: 'warning',
				preset: 'dialog',
				content: () => <div>
					<p>Web UI 强依赖部分较新内核的JavaScript API实现，为了确保模块正常工作，Android 13/12的小米设备可能需要升级系统内置WebView版本，请通过Google Play商店升级！</p>
					<p>下载地址:https://play.google.com/store/apps/details?id=com.google.android.webview</p>
					<p>如果下载的是Beta/Dev/Canary版本的WebView，则需要前往[开发者选项-WebView实现]进行切换~</p>
				</div>,
				positiveText: '复制下载链接到剪切板',
				negativeText: '已升级，不再提醒',
				onPositiveClick: () => {
					navigator.clipboard.writeText(`https://play.google.com/store/apps/details?id=com.google.android.webview`)
				},
				onNegativeClick: () => {
						deviceStore.skipConfirm.lowWebViewVersion = true;
				},
			});
		}
		embeddedStore.initDefault();
		autoUIStore.initDefault();
		gameBoosterStore.initDefault();
		if (deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 1) {
			dotBlackListStore.initDefault();
		}
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
	<div class="app-container h-full" :class="`${deviceStore.isDarkMode ? 'bg-zinc-900' : 'bg-white'}`">
		<n-config-provider :theme="deviceStore.isDarkMode ? darkTheme : undefined">
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
