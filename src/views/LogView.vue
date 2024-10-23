<script setup lang="ts">
  import { useDeviceStore } from '@/stores/device';
  import {
    nextTick,
    onMounted,
    watchEffect,
    ref,
    type CSSProperties,
  } from 'vue';
  import hljs from 'highlight.js/lib/core';
  import { useLogsStore } from '@/stores/logs';
  import { createDiscreteApi, type LogInst } from 'naive-ui';
  const logsStore = useLogsStore();
  const { message } = createDiscreteApi(['message']);

  const customLanguage = {
    name: 'log',
    contains: [
      {
        className: 'webui-log !text-green-600',
        begin: '\\[success\\]',
        end: '$',
        relevance: 10,
      },
      {
        className: 'webui-log !text-sky-600',
        begin: '\\[info\\]',
        end: '$',
        relevance: 10,
      },
      {
        className: 'webui-log !text-red-600',
        begin: '\\[error\\]',
        end: '$',
        relevance: 10,
      },
    ],
  };

  hljs.registerLanguage('webui-log', () => customLanguage);

  const logInstRef = ref<LogInst | null>(null);

  const scrollToBottom = () => {
    logInstRef.value?.scrollTo({ position: 'bottom', silent: true });
    message.info('已到达日志底部~');
  };

  const scrollToTop = () => {
    logInstRef.value?.scrollTo({ position: 'top', silent: true });
    message.info('已到达日志顶部~');
  };

  const cleanLogs = () => {
    logsStore.content = '';
    message.success('清空日志成功~');
  };

  onMounted(() => {
    watchEffect(() => {
      if (logsStore.content) {
        nextTick(() => {
          logInstRef.value?.scrollTo({ position: 'bottom', silent: true });
        });
      }
    });
  });
</script>
<template>
  <div class="setting">
    <div class="mt-5">
      <div class="px-4 sm:px-0">
        <h3 class="text-base font-semibold leading-7 text-gray-900">
          日志记录
        </h3>
        <p class="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
          在这里可以查看本次 Web UI 运行中产生的日志
        </p>
        <p class="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
          若有影响使用的问题可以通过酷安/Github/模块反馈群上进行反馈
        </p>
      </div>
      <n-card :bordered="true" title="操作栏" class="mt-3" size="small">
        <div class="flex">
          <n-button
            class="mr-3"
            type="info"
            @click="
              () => {
                scrollToTop();
              }
            "
          >
            回到顶部
          </n-button>
          <n-button
            class="mr-3"
            type="error"
            @click="
              () => {
                scrollToBottom();
              }
            "
          >
            回到底部
          </n-button>
          <n-button
            class="mr-3"
            type="success"
            @click="
              () => {
                cleanLogs();
              }
            "
          >
            清空日志
          </n-button>
        </div>
        <div class="mt-6 border-t border-gray-100">
          <n-space vertical>
            <n-log
              :hljs="hljs"
              ref="logInstRef"
              :row="20"
              line-height="2"
              font-size="12"
              :log="logsStore.content"
              language="webui-log"
              trim
            />
          </n-space>
        </div>
      </n-card>
    </div>
  </div>
</template>

<style>
  .hljs-webui-log {
    color: rgb(22 163 74);
  }
</style>
