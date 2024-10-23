<script setup lang="ts">
  import { useDeviceStore } from '@/stores/device';
  import {
    nextTick,
    onMounted,
    watchEffect,
    ref,
    type CSSProperties,
    computed,
  } from 'vue';
  import hljs from 'highlight.js/lib/core';
  import { useLogsStore } from '@/stores/logs';
  import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps, type LogInst } from 'naive-ui';
  import axios from 'axios';
  import sqioInstance from '@/utils/sqio';
  const logsStore = useLogsStore();
  const deviceStore = useDeviceStore();
  const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
      theme: deviceStore.isDarkMode ? darkTheme : lightTheme
  }))
  const { message } = createDiscreteApi(['message'], {
    configProviderProps: configProviderPropsRef
  });

  function escapeSpecialChars(str: string) {
    return str
      .replace(/\\/g, '\\\\') // 转义反斜杠
      .replace(/"/g, '\\"') // 转义双引号
      .replace(/'/g, "\\'"); // 转义单引号
  }

  onMounted(() => {
    sqioInstance(
      escapeSpecialChars(
        '@teg_config | .rules | .rule_content | sort_by(.rule_version-) | where(.rule_module == "booster_config") | .[0]'
      )
    ).then(
      res => {
        console.log(res, 'res');
      },
      err => {
        console.log(err, 'err');
      }
    );
  });
</script>
<template>
  <div class="game-turbo-config">
    <div class="mt-5">
      <div class="px-4 sm:px-0">
        <h3 :class="`text-base font-semibold leading-7 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
          游戏云控配置
        </h3>
        <p :class="`mt-1 max-w-2xl text-sm leading-6  ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
          在这里可以查看小米的部分云控节点配置
        </p>
      </div>
      <n-card :bordered="true" title="操作栏" class="mt-3" size="small">
        <div class="flex">
          <n-button class="mr-3" type="info">测试按钮1</n-button>
          <n-button class="mr-3" type="error">测试按钮2</n-button>
          <n-button class="mr-3" type="success">测试按钮3</n-button>
        </div>
        <div></div>
      </n-card>
    </div>
  </div>
</template>

<style>
  .hljs-webui-log {
    color: rgb(22 163 74);
  }
</style>
