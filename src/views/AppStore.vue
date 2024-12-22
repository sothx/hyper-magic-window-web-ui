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
  const getAppDownload = async (title:string,url:string, type: 'system' | 'revision' | 'original') => {
	modal.create({
		title: `获取${title}`,
		type: 'info',
		preset: 'dialog',
		content: () => (
			<div>
        <p>确定要下载{title}么？请注意核对部分应用的兼容性。</p>
        { type === 'system' && <p>（Tips: 系统应用无非通过小米自带的应用包管理器安装，请通过MT管理器安装！）</p> }
        { type === 'revision' && <p>（Tips: 修改版需搭配核心破解并通过MT管理器安装）</p> }
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
          <div class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert
              title="StarNote"
              type="info"
            >
            <template #icon>
              <img src="/images/apps/starNote.webp" />
            </template>
              <p>笔尖所到，文星高照！文石出品的平板笔记软件，截止 2025-1-1 前登录账号即可领取永久的笔记Pro会员！</p>
              <p>兼容性:  Hyper OS 1 / Hyper OS 2 / MIUI 14</p>
              <p>注意事项:  领取会员的位置比较隐蔽，位于首页左上角~</p>
              <n-button class="mt-2" strong secondary type="info" @click="() => getAppDownload('StarNote', 'https://yun.139.com/sharewap/#/m/i?135CmrnDyIHP2', 'original')">获取StarNote</n-button>
            </n-alert>
          </div>
          <!-- <div class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert title="[已完成] 应用布局优化" type="success">
              供可视化简易适配应用的布局规则，支持模块预设规则及自定义规则，可以随意开关应用的布局优化规则
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert title="[已完成] 定制模式" type="success">
              定制模式下模块会以您设备的整体应用情况修剪模块应用适配列表
              ，以解决老机型由于系统优化不佳而导致的卡顿、掉帧等问题
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert title="[已完成] 自定义规则分享口令" type="success">
              自定义规则允许分享和导入，提供快捷的"分享口令"导入入口~
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert title="[已完成] 模块设置" type="success">
              开发中，提供可视化展示部分设备信息、模块信息并且可视化控制"游戏显示布局"、"旋转建议提示按钮"开关的选项。
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert title="[已完成] 深色模式" type="success">
              适配 Web UI 深色模式，优化深色模式下的使用体验
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert
              title="[待定] 应用横屏配置- Hyper OS 2.0(Android 15+)"
              type="warning"
            >
              待定，支持Android 15 配置允许使用的适配选项，支持配置自定义比例
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5">
            <n-alert
              title="[远期规划] 可视化配置平行窗口自定义规则"
              type="default"
            >
              远期可能性需求规划，待讨论，不一定做。通过JSON可视化编辑的方式，提供可视化修改平行窗口自定义规则的功能，包含所有小米提供的反向适配参数。
              <span class="hidden">(技术栈暂定vue3-ts-jsoneditor)</span>
            </n-alert>
          </div> -->
        </dl>
      </div>
    </div>
  </div>
</template>

<style></style>
