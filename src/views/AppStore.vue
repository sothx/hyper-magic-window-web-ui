<script setup lang="ts">
  import { useDeviceStore } from '@/stores/device';
  import { computed, type CSSProperties } from 'vue';
  import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps } from 'naive-ui';
  const deviceStore = useDeviceStore();
  const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
      theme: deviceStore.isDarkMode ? darkTheme : lightTheme
  }))
  const { message } = createDiscreteApi(['message'],{
configProviderProps: configProviderPropsRef
  });
</script>
<template>
  <div class="setting">
    <div class="mt-5">
      <div class="px-4 sm:px-0">
        <h3 :class="`text-base font-semibold leading-7 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`" >
          精选应用
        </h3>
        <p :class="`mt-1 max-w-2xl text-sm leading-6  ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
          这里罗列了一些适配大屏良好的应用作为精选推荐应用
        </p>
        <p :class="`mt-1 max-w-2xl text-sm leading-6  ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
          部分增强小米平板的系统体验的大屏应用也罗列在此
        </p>
      </div>
      <div class="mt-6 border-gray-100">
        <dl class="divide-gray-100 mb-5">
          <div>开发中，尚未上线</div>
          <!-- <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">模块版本号</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">暂定</dd>
          </div> -->
          <!-- <div class="px-4 flex sm:grid sm:px-0">
            <n-alert
              title="[已完成] 应用横屏配置-Android 13 - Android 14"
              type="success"
            >
              已适配 Android 13 - Android
              14，提供一定程度的可视化添加/修改任意应用的布局并管理自定义规则
            </n-alert>
          </div>
          <div class="px-4 flex sm:grid sm:px-0 mt-5">
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
