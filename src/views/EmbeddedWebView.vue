<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const route = useRoute();
const url = ref(route.query.url as string); // 使用 ref 包装 url
const iframeRef = ref<HTMLIFrameElement | null>(null);

// 加载完成后的处理
const onLoad = () => {
  console.log('网页加载完成');
  adjustIframeHeight(); // 加载完成后调整高度
};

// 调整 iframe 高度的函数
const adjustIframeHeight = () => {
  if (iframeRef.value) {
    const iframeDocument = iframeRef.value.contentDocument || iframeRef.value.contentWindow?.document;
    if (iframeDocument) {
      const height = iframeDocument.body.scrollHeight; // 设置最小高度
      iframeRef.value.style.height = `${height}px`;
    }
  }
};

// 窗口调整大小时的处理
const onResize = () => {
  adjustIframeHeight(); // 窗口大小改变时调整高度
};

// 添加和移除事件监听器
onMounted(() => {
  window.addEventListener('resize', onResize);
});

// 监视 URL 的变化
watch(() => route.query.url, (newUrl) => {
  url.value = newUrl as string; // 更新 url
  if (iframeRef.value) {
    iframeRef.value.src = url.value; // 刷新 iframe 内容
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
});
</script>

<template>
  <div class="webview-container">
    <iframe
      ref="iframeRef"
      :src="url"
      frameborder="0"
      class="webview"
      @load="onLoad"
    ></iframe>
  </div>
</template>

<style scoped>
.webview-container {
  position: relative;
  width: 100%;
  height: 100%; /* 确保容器占满父元素的高度 */
  overflow: hidden; /* 确保没有外部的滚动条 */
}

.webview {
  width: 100%;
  border: none;
  height: auto; /* 允许高度自适应 */
  min-height: 100vh; /* 设置最小高度，确保 iframe 不会小于视口高度 */
}

/* 隐藏滚动条 */
.webview::-webkit-scrollbar {
  display: none; /* 隐藏滚动条 */
}

/* 确保 html 和 body 不会干扰 iframe 的高度 */
html, body {
  margin: 0; /* 确保没有默认的边距 */
  padding: 0; /* 确保没有默认的内边距 */
  overflow: hidden; /* 确保内容不会溢出 */
}
</style>
