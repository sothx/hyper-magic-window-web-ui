<script setup lang="tsx">
  import { useDeviceStore } from '@/stores/device';
  import { computed, type CSSProperties } from 'vue';
  import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps } from 'naive-ui';
  const deviceStore = useDeviceStore();
  const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
      theme: deviceStore.isDarkMode ? darkTheme : lightTheme
  }))
  const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
	configProviderProps: configProviderPropsRef,
});
  const getAppDownload = async (title:string,url:string, type: 'system' | 'revision' | 'original' | 'magisk') => {
	modal.create({
		title: `获取${title}`,
		type: 'info',
		preset: 'dialog',
		content: () => (
			<div>
        <p>确定要下载{title}么？请注意核对部分应用的兼容性。
        { type === 'system' && <span>（Tips: 系统应用无法通过小米自带的应用包管理器安装，请通过MT管理器安装！）</span> }
        { type === 'revision' && <span>（Tips: 修改版需搭配核心破解并通过MT管理器安装）</span> }
        { type === 'magisk' && <span>（Tips: Magisk模块请通过ROOT管理器进行安装）</span> }
      </p>
				<p>下载地址:</p>
        <p>{url}</p>
			</div>
		),
		positiveText: '复制下载链接到剪切板',
		negativeText: '取消',
		onPositiveClick: () => {
			navigator.clipboard.writeText(`${url}`);
		},
		onNegativeClick: () => {},
	});
};
</script>
<template>
  <div class="setting">
    <div class="mt-5">
      <div class="px-4 sm:px-0">
				<h3 :class="`text-base font-semibold leading-7`">
					<span
						class="animated-bg bg-clip-text font-semibold text-transparent"
						style="
							background-image: linear-gradient(
								101.22deg,
								rgb(255, 182, 133) -18.32%,
								rgb(255, 111, 29) 7.01%,
								rgb(252, 181, 232) 41.59%,
								rgb(135, 148, 255) 70.98%,
								rgb(60, 112, 255) 91.35%,
								rgb(60, 112, 255) 110.17%
							);
						"
						>精选应用</span
					>
				</h3>
        <p :class="`mt-1 max-w-2xl text-sm leading-6  ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
          这里罗列了一些适配大屏良好的应用作为精选推荐应用
        </p>
        <p :class="`mt-1 max-w-2xl text-sm leading-6  ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
          部分增强小米大屏系统体验的大屏应用也罗列在此
        </p>
      </div>
      <div class="mt-6 border-gray-100">
        <dl class="divide-gray-100 mb-5">
          <div class="px-4 flex sm:grid sm:px-0">
            <n-alert
              title="超级小爱"
              type="error"
            >
            <template #icon>
              <img src="/images/icons/ai_icon.png" />
            </template>
              <p>超级小爱，全生态 AI 智能助手！超级小爱已经在小米平板全面公测，安装后即可体验超级小爱！</p>
              <p>兼容性:  Hyper OS 1 / Hyper OS 2</p>
              <p>注意事项:  需要同时安装 超级小爱 和 小米澎湃AI引擎</p>
              <n-button class="mt-2" strong secondary type="error" @click="() => getAppDownload('超级小爱', 'https://caiyun.139.com/m/i?135CmDfhvmaxV', 'system')">获取超级小爱</n-button>
            </n-alert>
          </div>
          <div v-if="deviceStore.deviceCharacteristics === 'tablet'" class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert
              title="小米平板系统应用补全 - 传送门/悬浮球"
              type="info"
            >
            <template #icon>
              <img src="/images/icons/miui_content_extension_app.webp" />
            </template>
              <p>传送门是小米的一个系统应用，可以方便地识别屏幕上的文字和图片，触发系统的分词、识图、搜索、复制、翻译等能力。</p>
              <p>悬浮球是小米的一个系统应用，可以通过单手手势提升日常的使用体验。</p>
              <p>兼容性:  MIUI14 / Hyper OS 1 / Hyper OS 2</p>
              <p>注意事项:  Magisk模块请通过对应的 ROOT管理器 进行安装！传送门管理入口位于[模块设置]，悬浮球管理入口位于[系统设置-更多设置-悬浮球]。</p>
              <n-button class="mt-2" strong secondary type="info" @click="() => getAppDownload('WinPlay Mobile', 'https://caiyun.139.com/m/i?135Ce8FLLcLm8', 'system')">获取WinPlay Mobile</n-button>
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5" v-if="deviceStore.MIOSVersion && deviceStore.MIOSVersion === 1 && deviceStore.deviceCharacteristics === 'tablet'">
            <n-alert
              title="小米平板系统桌面 - Hyper OS 1"
              type="error"
            >
            <template #icon>
              <img src="/images/apps/mi_home.png" />
            </template>
              <p>小米 Hyper OS 系统桌面！该版本提取自小米平板6S Pro，包含新的打断动画和部分动画效果改变！</p>
              <p>兼容性:  Hyper OS 1</p>
              <p>注意事项:  小米平板6 推荐安装去模糊阉割版，需搭配核心破解，会补全被阉割的 Dock 栏模糊！</p>
              <n-button class="mt-2" strong secondary type="error" @click="() => getAppDownload('小米平板系统桌面', 'https://caiyun.139.com/m/i?135ClZdWPAYZk', 'system')">获取小米平板系统桌面</n-button>
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5" v-if="deviceStore.MIOSVersion && deviceStore.MIOSVersion === 2 && deviceStore.deviceCharacteristics === 'tablet'">
            <n-alert
              title="小米平板系统桌面 - Hyper OS 2"
              type="error"
            >
            <template #icon>
              <img src="/images/apps/mi_home.png" />
            </template>
              <p>小米 Hyper OS 系统桌面！该版本提取自小米平板7 Pro，包含九宫格、优化后的动画效果和全新超级小爱Dock便捷入口！</p>
              <p>兼容性:  Hyper OS 2</p>
              <p>注意事项:  如提示系统应用无法安装请从文件管理安装</p>
              <n-button class="mt-2" strong secondary type="error" @click="() => getAppDownload('小米平板系统桌面', 'https://caiyun.139.com/m/i?135CmXZPQXz3d', 'system')">获取小米平板系统桌面</n-button>
            </n-alert>
          </div>
          <div v-if="deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.deviceCharacteristics === 'tablet'" class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert
              title="WinPlay Mobile"
              type="info"
            >
            <template #icon>
              <img src="/images/icons/win_play_mobile.webp" />
            </template>
              <p>「WinPlay Mobile」是为小米平板量身定做的「游戏虚拟机」，可以运行市面上常见的 Windows 游戏。</p>
              <p>兼容性:  小米平板6S Pro - Hyper OS 2</p>
              <p>注意事项:  需要同时安装 AI百宝箱 和 WAE Display，当前仅兼容小米平板6S Pro，且需要运行在最新版的Hyper OS 2.0</p>
              <n-button class="mt-2" strong secondary type="info" @click="() => getAppDownload('WinPlay Mobile', 'https://caiyun.139.com/m/i?135CdoBoOMICY', 'system')">获取WinPlay Mobile</n-button>
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert
              title="小米笔记 - Hyper AI"
              type="warning"
            >
            <template #icon>
              <img src="/images/apps/mi_note.png" />
            </template>
            <p>小米笔记，一个好用的文本创作工具</p>
            <p>使用 AI 写作进行文本摘要、扩写、润色纠错等功能，还可以输入写作需求让AI帮您创作</p>
            <p>兼容性:  Hyper OS 1 / Hyper OS 2</p>
            <p>注意事项:  解锁 Hyper AI，需要核心破解并搭配MT管理器安装。</p>
            <n-button class="mt-2" strong secondary type="warning" @click="() => getAppDownload('小米笔记', 'https://caiyun.139.com/m/i?135Ce9CtGXcVc', 'revision')">获取小米笔记</n-button>
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert
              title="小米录音机 - Hyper AI"
              type="error"
            >
            <template #icon>
              <img src="/images/apps/mi_soundrecorder.webp" />
            </template>
            <p>简单好用的录音应用</p>
            <p>兼容性:  Hyper OS 1 / Hyper OS 2</p>
            <p>注意事项:  解锁 Hyper AI 全功能 AI 识音和转录，需要核心破解并搭配MT管理器安装。</p>
            <n-button class="mt-2" strong secondary type="error" @click="() => getAppDownload('小米录音机', 'https://caiyun.139.com/m/i?135Ce9CYAY0YN', 'revision')">获取小米录音机</n-button>
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert
              title="StarNote"
              type="info"
            >
            <template #icon>
              <img src="/images/apps/starNote.webp" />
            </template>
              <p>笔尖所到，文星高照！文石出品的平板笔记软件，截止 2025-2-1 前登录账号即可领取永久的笔记Pro会员！</p>
              <p>兼容性:  Hyper OS 1 / Hyper OS 2 / MIUI 14</p>
              <p>注意事项:  领取会员的位置比较隐蔽，位于首页左上角~</p>
              <n-button class="mt-2" strong secondary type="info" @click="() => getAppDownload('StarNote', 'https://yun.139.com/sharewap/#/m/i?135CmrnDyIHP2', 'original')">获取StarNote</n-button>
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5" v-if="deviceStore.deviceCharacteristics === 'tablet'">
            <n-alert
              title="小米音乐(平板端)"
              type="success"
            >
            <template #icon>
              <img src="/images/apps/mi_music.png" />
            </template>
              <p>小米音乐 X QQ音乐！该版本小米已经去除反向适配的平行窗口，拥有更好的大屏体验！</p>
              <p>注意事项:  如提示系统应用无法安装请从文件管理安装</p>
              <n-button class="mt-2" strong secondary type="success" @click="() => getAppDownload('小米音乐', 'https://caiyun.139.com/m/i?135CmXllwKaxM', 'system')">获取小米音乐</n-button>
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert
              title="三星浏览器"
              type="info"
            >
            <template #icon>
              <img src="/images/apps/samsung_browser.png" />
            </template>
              <p>三星出品的安全、私密且经优化的移动网络浏览器！</p>
              <p>注意事项:  没有PC版，如果需要跨PC端书签同步可能需要搭配第三方插件。</p>
              <n-button class="mt-2" strong secondary type="info" @click="() => getAppDownload('三星浏览器', 'https://caiyun.139.com/m/i?135CmXZb9D6PP', 'original')">获取三星浏览器</n-button>
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5" v-if="deviceStore.deviceCharacteristics === 'tablet'">
            <n-alert
              title="波点音乐"
              type="success"
            >
            <template #icon>
              <img src="/images/apps/bodian.webp" />
            </template>
              <p>酷我出品的音乐APP(腾讯音乐娱乐集团旗下)，全新版本已增加对平板的大屏适配！</p>
              <n-button class="mt-2" strong secondary type="success" @click="() => getAppDownload('波点音乐', 'https://caiyun.139.com/m/i?135CmXWNtw2yy', 'original')">获取波点音乐</n-button>
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5" v-if="deviceStore.deviceCharacteristics === 'tablet'">
            <n-alert
              title="荣耀音乐"
              type="error"
            >
            <template #icon>
              <img src="/images/apps/honor_music.png" />
            </template>
              <p>荣耀音乐 X 网易云音乐，跟普通网易云音乐不同的大屏适配体验！</p>
              <p>注意事项:  请使用绑定了网易云音乐的手机账号登录，必须安装荣耀基础服务，荣耀应用市场方便追踪应用更新。</p>
              <n-button class="mt-2" strong secondary type="error" @click="() => getAppDownload('荣耀音乐', 'https://caiyun.139.com/m/i?135CmrVUbH2y3', 'original')">获取荣耀音乐</n-button>
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5" v-if="deviceStore.deviceCharacteristics === 'tablet'">
            <n-alert
              title="像素习惯"
              type="info"
            >
            <template #icon>
              <img src="/images/apps/habicat.webp" />
            </template>
              <p>像素习惯是一款像素风的游戏化习惯养成打卡软件，你可以在里面通过培养习惯来抽装备，集成就，强化数值装备自己，不断进步。</p>
              <p>注意事项:  完美横屏应用计划已为像素习惯通过应用布局优化适配大屏，请确保你安装的模块版本和系统版本支持应用布局优化。</p>
              <n-button class="mt-2" strong secondary type="info" @click="() => getAppDownload('像素习惯', 'https://caiyun.139.com/m/i?135Ce9wkd3aKT', 'original')">获取像素习惯</n-button>
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert
              title="Redmi Pad Pro X 哈利·波特 联动主题"
              type="warning"
            >
            <template #icon>
              <img src="/images/apps/mi_theme.webp" />
            </template>
            <p>换上巫师袍，想象霍格沃茨在召唤你入学！</p>
            <p>主题以霍格沃茨开学场景为背景，深度定制桌面背景和图标。</p>
            <p>经典的魔法元素设计和场景呈现，带你重回哈利·波特的魔法世界！</p>
            <p>注意事项:  需要搭配 LSPosed 模块主题破解进行食用，[模块设置-导入个性化]可以快捷打开小米平板的主题导入界面~</p>
              <n-button class="mt-2" strong secondary type="warning" @click="() => getAppDownload('Redmi Pad Pro X 哈利·波特 联动主题', 'https://caiyun.139.com/m/i?135CltA2z1VvD', 'original')">获取Redmi Pad Pro X 哈利波特 联动主题</n-button>
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert
              title="有诗"
              type="default"
            >
            <template #icon>
              <img src="/images/apps/youshi.webp" />
            </template>
            <p>生活不止眼前的苟且，还有诗和远方的田野。</p>
            <p>有诗，你的口袋诗库，这里收录了数十万首传统诗词与现代诗词，每日自动推荐最适合您的作品，让您在忙碌的生活中也能轻松欣赏诗词之美。我们希望，所有渴望被触碰心灵的、真实而纯粹的灵魂，在诗歌里获得片刻自由，远方未远，诗歌正好，让我们一起拥抱诗意生活。</p>
              <n-button class="mt-2" strong secondary type="default" @click="() => getAppDownload('有诗', 'https://caiyun.139.com/m/i?135CmCz8VCpu0', 'original')">获取有诗</n-button>
            </n-alert>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>

<style></style>
