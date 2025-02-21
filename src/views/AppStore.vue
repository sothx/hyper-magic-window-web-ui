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
              <p>兼容性:  Hyper OS 2 / Hyper OS 1 / MIUI14</p>
              <p>注意事项:  需要同时安装 超级小爱 和 小米澎湃AI引擎，Hyper OS 1和MIUI 14需要安装对应文件夹内的版本，否则存在无法使用的问题！</p>
              <n-button class="mt-2" strong secondary type="error" @click="() => getAppDownload('超级小爱', 'https://caiyun.139.com/m/i?135CmDfhvmaxV', 'system')">获取超级小爱</n-button>
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert
              title="小米主题壁纸 - 萌宠系列动态壁纸"
              type="warning"
            >
            <template #icon>
              <img src="/images/apps/mi_theme.webp" />
            </template>
            <p>小米主题 2025 年 新春上新啦~</p>
            <p>全新萌宠系列动态壁纸，让你萌动整个新春~</p>
            <p>注意事项:  如需动态壁纸自动循环播放，需要前往[模块设置-动态壁纸循环播放]进行配置~</p>
              <n-button class="mt-2" strong secondary type="warning" @click="() => getAppDownload('小米萌宠系列动态壁纸', 'https://caiyun.139.com/m/i?135CmTzk7BYsS', 'original')">获取小米主题壁纸 - 萌宠系列动态壁纸</n-button>
            </n-alert>
          </div>
          <div v-if="deviceStore.deviceCharacteristics === 'tablet'" class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert
              title="小米平板系统应用补全模块 - 传送门/悬浮球"
              type="info"
            >
            <template #icon>
              <img src="/images/icons/miui_content_extension_app.webp" />
            </template>
              <p>传送门是小米的一个系统应用，可以方便地识别屏幕上的文字和图片，触发系统的分词、识图、搜索、复制、翻译等能力。</p>
              <p>悬浮球是小米的一个系统应用，可以通过单手手势提升日常的使用体验。</p>
              <p>兼容性:  MIUI14 / Hyper OS 1 / Hyper OS 2</p>
              <p>注意事项:  Magisk模块请通过对应的 ROOT管理器 进行安装！传送门管理入口位于[模块设置]，悬浮球管理入口位于[系统设置-更多设置-悬浮球]。</p>
              <n-button class="mt-2" strong secondary type="info" @click="() => getAppDownload('传送门/悬浮球补全模块', 'https://caiyun.139.com/m/i?135Ce8FLLcLm8', 'magisk')">获取传送门/悬浮球补全模块</n-button>
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert
              title="小米平板系统功能补全模块"
              type="success"
            >
            <template #icon>
              <img src="/images/apps/magisk.webp" />
            </template>
              <p>支持对小米平板/小米折叠屏设备进行以下功能的补全:</p>
              <ul>
                <li class="ml-3">ZRAM:RAM=1:1优化(Hyper OS 2+，仅部分机型支持)</li>
                <li class="ml-3">启用dm设备映射器(Hyper OS 2+，仅部分机型支持)</li>
                <li class="ml-3">启用多档高刷(仅部分机型支持)</li>
                <li class="ml-3">补全120hz高刷(仅部分机型支持)</li>
                <li class="ml-3">强开小米平板工作台模式(仅部分机型支持)</li>
                <li class="ml-3">解除GMS区域限制</li>
                <li class="ml-3">PC级WPS字体目录自动创建(仅小米/红米平板机型支持)</li>
                <li class="ml-3">解锁熄屏挂机/熄屏听剧</li>
                <li class="ml-3">解锁视频工具箱智能刷新率</li>
                <li class="ml-3">解锁节律护眼(Hyper OS 1+，仅部分机型支持)</li>
                <li class="ml-3">开启屏幕旋转建议提示按钮</li>
                <li class="ml-3">开启极致模式</li>
                <li class="ml-3">开启进游戏三倍速(部分腾讯系游戏)</li>
                <li class="ml-3">解锁游戏工具箱狂暴引擎UI界面(仅UI效果)</li>
                <li class="ml-3">解锁游戏音质优化开关</li>
                <li class="ml-3">隐藏/优化手势提示线(部分机型效果可能不佳)</li>
                <li class="ml-3">开启平滑圆角</li>
                <li class="ml-3">开启高级材质(最高支持到高级材质3.0，部分被阉割了大文件夹模糊的机型，可以自行通过Hyper Ceiler强制启用桌面大文件夹的模糊)</li>
              </ul>
              <p>注意事项: Magisk模块请通过对应的 ROOT管理器 进行安装！高级材质在[显示与亮度-高级材质]，极致模式在[开发者选项-极致模式]。</p>
              <n-button class="mt-2" strong secondary type="success" @click="() => getAppDownload('小米平板系统功能补全模块', 'https://caiyun.139.com/m/i?135Ce7Jx2e5nZ', 'magisk')">获取小米平板系统功能补全模块</n-button>
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
          <div class="px-4 flex sm:grid sm:px-0 mt-5" v-if="deviceStore.MIOSVersion && deviceStore.MIOSVersion === 2 && deviceStore.androidTargetSdk === 35 && deviceStore.deviceCharacteristics === 'tablet'">
            <n-alert
              title="小米平板系统桌面 - Android 15 Hyper OS 2"
              type="error"
            >
            <template #icon>
              <img src="/images/apps/mi_home.png" />
            </template>
              <p>小米 Hyper OS 系统桌面！该版本提取自小米平板7 Pro，包含九宫格、优化后的动画效果和全新超级小爱Dock便捷入口！</p>
              <p>兼容性:  Android 15 Hyper OS 2</p>
              <p>注意事项:  如提示系统应用无法安装请从文件管理安装</p>
              <n-button class="mt-2" strong secondary type="error" @click="() => getAppDownload('小米平板系统桌面', 'https://caiyun.139.com/m/i?135CmXZPQXz3d', 'system')">获取小米平板系统桌面</n-button>
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5" v-if="deviceStore.MIOSVersion && deviceStore.MIOSVersion === 2 && deviceStore.androidTargetSdk === 34 && deviceStore.deviceCharacteristics === 'tablet'">
            <n-alert
              title="小米平板系统桌面 - Android 14 Hyper OS 2"
              type="error"
            >
            <template #icon>
              <img src="/images/apps/mi_home.png" />
            </template>
              <p>小米 Hyper OS 系统桌面！该版本提取自小米平板6，去除部分低端机型的模糊阉割！</p>
              <p>兼容性:  Android 14 Hyper OS 2</p>
              <p>注意事项:  如提示系统应用无法安装请从文件管理安装</p>
              <n-button class="mt-2" strong secondary type="error" @click="() => getAppDownload('小米平板系统桌面', 'https://caiyun.139.com/m/i?135ClUAurszLD', 'system')">获取小米平板系统桌面</n-button>
            </n-alert>
          </div>
          <div v-if="deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2  && deviceStore.androidTargetSdk >= 35 && deviceStore.deviceCharacteristics === 'tablet'" class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert
              title="WinPlay Mobile"
              type="info"
            >
            <template #icon>
              <img src="/images/icons/win_play_mobile.webp" />
            </template>
              <p>「WinPlay Mobile」是为小米平板量身定做的「游戏虚拟机」，可以运行市面上常见的 Windows 游戏。</p>
              <p>兼容性:  小米平板6S Pro - Hyper OS 2</p>
              <p>注意事项:  需要同时安装 AI百宝箱 和 WAE Display，当前仅兼容小米平板6S Pro，且需要运行在最新版的Hyper OS 2.0，[模块设置-WinPlay Mobile]可以快捷打开小米平板的「游戏虚拟机」界面~(其他基于小米平板6S Pro Hyper OS 2.0的移植包，且作者表明内置了winplay的机型也可以使用！)</p>
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
          <div class="px-4 flex sm:grid sm:px-0 mt-5" v-if="deviceStore.deviceCharacteristics === 'tablet'">
            <n-alert
              title="UU远程"
              type="info"
            >
            <template #icon>
              <img src="/images/apps/uu_remote.jpg" />
            </template>
              <p>网易出品的专为游戏打造的超低延迟远程工具</p>
              <p>最高支持4K 蓝光 144帧</p>
              <p>针对键鼠/手柄/多点触控进行针对优化</p>
              <n-button class="mt-2" strong secondary type="info" @click="() => getAppDownload('UU远程', 'https://caiyun.139.com/m/i?135Cm9zLiXM7U', 'original')">获取UU远程</n-button>
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
          <div class="px-4 flex sm:grid sm:px-0 mt-5" v-if="deviceStore.deviceCharacteristics === 'tablet'">
            <n-alert
              title="小米远程控制"
              type="info"
            >
            <template #icon>
              <img src="/images/apps/mi_remote.png" />
            </template>
              <p>Xiaomi Pad/Phone/Fold 与 Windows PC间的远程控制客户端</p>
              <p>兼容性: Hyper OS 1 / Hyper OS 2 / MIUI 14</p>
              <n-button class="mt-2" strong secondary type="info" @click="() => getAppDownload('小米远程控制', 'https://caiyun.139.com/m/i?135Cmo1bvo1XC', 'original')">获取小米远程控制</n-button>
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5" v-if="deviceStore.deviceCharacteristics === 'tablet'">
            <n-alert
              title="QQ音乐 HD"
              type="success"
            >
            <template #icon>
              <img src="/images/apps/qq_music.jpg" />
            </template>
              <p>QQ 音乐 HD 6.0，全新版本已增加对平板的大屏适配！</p>
              <n-button class="mt-2" strong secondary type="success" @click="() => getAppDownload('QQ音乐 HD', 'https://caiyun.139.com/m/i?135CmomGWJWB1', 'original')">获取QQ音乐 HD</n-button>
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert
              title="流舟文件"
              type="info"
            >
            <template #icon>
              <img src="/images/apps/liuzhoufile.png" />
            </template>
            <p>流舟文件是功能强大且免费的本地&网络文件管理器，帮助你高效的管理文件以及应用。</p>
            <p>支持将「文件夹」或者「文件」映射到「桌面快捷方式」，弥补小米平板文件管理的功能缺失！</p>
              <n-button class="mt-2" strong secondary type="info" @click="() => getAppDownload('流舟文件', 'https://caiyun.139.com/m/i?135CmlYwYWyCJ', 'original')">获取流舟文件</n-button>
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert
              title="盖世游戏"
              type="default"
            >
            <template #icon>
              <img src="/images/apps/egggame.png" />
            </template>
            <p>支持本地运行 3A 游戏，盖世小鸡「盖世游戏」App 开启公测</p>
            <p>现提供三种游戏模式，包括：串流游戏、本地游戏和云游戏。除云游戏外，其他游戏模式均免费。其中串流游戏支持 PC Link 官方串流和 PS Link 官方串流；本地游戏提供游戏下载运行功能。</p>
            <p>目前适配骁龙 865 及以上的安卓手机和安卓掌机，苹果因为系统封闭不支持，天玑和麒麟芯片，目前因为 GPU 驱动问题不支持，之后会部分支持。目前应用已适配盖世小鸡本品牌手柄。</p>
            <p>需要注意的是，目前「盖世游戏」App 暂不支持登录 Steam 下载游戏，官方称“会在后续版本支持一键下载 Steam 游戏和运行，当前版本需要导入游戏”。</p>
              <n-button class="mt-2" strong secondary type="default" @click="() => getAppDownload('盖世游戏', 'https://caiyun.139.com/m/i?135ClWBEBfVxW', 'original')">获取盖世游戏</n-button>
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
          <div class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert
              title="自由笔记"
              type="default"
            >
            <template #icon>
              <img src="/images/apps/freenote.png" />
            </template>
              <p>无纸化记笔记，重塑笔记体验！</p>
              <p>修改系统日期为 2025-2-14 上午 10:30 分即可领取永久的自由笔记免费使用资格！</p>
              <n-button class="mt-2" strong secondary type="default" @click="() => getAppDownload('自由笔记', 'https://caiyun.139.com/m/i?135Clo5BWejq9', 'original')">获取自由笔记</n-button>
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
          <div class="px-4 flex sm:grid sm:px-0 mt-5" v-if="deviceStore.deviceCharacteristics === 'tablet'">
            <n-alert
              title="网易爆米花"
              type="warning"
            >
            <template #icon>
              <img src="/images/apps/filmlytv.webp" />
            </template>
              <p>网易出品的智能媒体库，完全免费，无广告！</p>
              <p>支持本地目录、WebDAV、SMB、中国移动云盘、阿里云盘等方式轻松导入你所有来源的影片！</p>
              <n-button class="mt-2" strong secondary type="warning" @click="() => getAppDownload('网易爆米花', '链接:  https://caiyun.139.com/m/i?135ClnUmBJ1EA', 'original')">获取网易爆米花</n-button>
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
              <p>注意事项:  没有PC版，如果需要跨PC端书签同步可能需要搭配"三星浏览器"插件。</p>
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
              title="随身乐队"
              type="info"
            >
            <template #icon>
              <img src="/images/apps/pianoperfect.webp" />
            </template>
              <p>随身乐队是一款为手机/平板设计的支持多音轨录音，乐器弹奏的APP。</p>
              <p>支持键盘、吉他、架子鼓、电子鼓、贝斯多种乐器，并且带有多音轨录音功能。</p>
              <p>注意事项: 建议关闭该应用的联网权限，可以避免出现广告。</p>
              <n-button class="mt-2" strong secondary type="info" @click="() => getAppDownload('随身乐队', 'https://caiyun.139.com/m/i?135Cdn7Uss9KJ', 'original')">获取随身乐队</n-button>
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert
              title="FlipaClip"
              type="default"
            >
            <template #icon>
              <img src="/images/apps/flipaclip.png" />
            </template>
            <p>用动画把你的梦想带进现实！</p>
            <p>FlipaClip 强大而有趣的工具可以让你一帧一帧地轻松制作动画，无论你是要打草稿、做脚本、做动画或者至少想要学习，FlipaClip足以实现您的创意。</p>
              <n-button class="mt-2" strong secondary type="default" @click="() => getAppDownload('FlipaClip', 'https://caiyun.139.com/m/i?135Ce7Ou7DwWV', 'original')">获取FlipaClip</n-button>
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
              title="机核"
              type="default"
            >
            <template #icon>
              <img src="/images/apps/gamecores.webp" />
            </template>
            <p>次世代游戏文化社区，机核从2010年开始一直致力于分享游戏玩家的生活，以及深入探讨游戏相关的文化。</p>
            <p>完美横屏应用计划已为机核通过应用横屏布局适配大屏，欢迎体验！</p>
              <n-button class="mt-2" strong secondary type="default" @click="() => getAppDownload('机核', 'https://caiyun.139.com/m/i?135CmUfDZ6yV8', 'original')">获取机核</n-button>
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
            <p>完美横屏应用计划已为有诗通过应用横屏布局适配大屏，欢迎体验！</p>
              <n-button class="mt-2" strong secondary type="default" @click="() => getAppDownload('有诗', 'https://caiyun.139.com/m/i?135CmCz8VCpu0', 'original')">获取有诗</n-button>
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert
              title="少数派"
              type="error"
            >
            <template #icon>
              <img src="/images/apps/sspai.png" />
            </template>
            <p>高效工作，品质生活，少数派是一个帮你发现优质 App 和数字产品、学习有效方法论，从而大大提高效率和生活品质的内容平台。</p>
            <p>完美横屏应用计划已为少数派通过应用横屏布局和第三方应用横屏优化适配大屏，欢迎体验！</p>
              <n-button class="mt-2" strong secondary type="error" @click="() => getAppDownload('少数派', 'https://caiyun.139.com/m/i?135Clqi1SPjAp', 'original')">获取少数派</n-button>
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert
              title="小睡眠"
              type="info"
            >
            <template #icon>
              <img src="/images/apps/brainmusic.jpg" />
            </template>
            <p>小睡眠提供白噪音、冥想练习、爱豆哄睡、睡眠监测、梦话录音和智能闹钟等功能。</p>
            <p>专业、全面和暖心的睡眠服务，帮您睡得更好睡得更香。</p>
            <p>完美横屏应用计划已为小睡眠通过应用横屏布局适配大屏，欢迎体验！</p>
              <n-button class="mt-2" strong secondary type="info" @click="() => getAppDownload('小睡眠', 'https://caiyun.139.com/m/i?135ClnqRKur1n', 'original')">获取小睡眠</n-button>
            </n-alert>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>

<style></style>
