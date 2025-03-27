<script setup lang="tsx">
import { useDeviceStore } from '@/stores/device';
const deviceStore = useDeviceStore();
</script>
<template>
    <main :class="`grid min-h-screen place-items-center ${deviceStore.isDarkMode ? 'bg-zinc-900' : 'bg-white'} px-6 py-24 sm:py-32 lg:px-8`">
      <div class="text-center">
        <p :class="`text-base font-semibold ${deviceStore.isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`">404</p>
        <h1 :class="`mt-4 text-3xl font-semibold tracking-tight text-balance ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-600'} sm:text-4xl`">
          访问的页面不存在
        </h1>
        <p class="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
          您似乎访问了一片荒漠QwQ~
        </p>
        <div class="mt-10 flex items-center justify-center gap-x-6">
          <router-link
            to="/"
            class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            返回首页
          </router-link>
        </div>
      </div>
    </main>
  </template>