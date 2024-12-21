<script setup lang="tsx">
import { useDeviceStore } from '@/stores/device';
const deviceStore = useDeviceStore();
</script>
<template>
  <div class="splash-screen">
    <div class="flex h-full flex-col items-center justify-center">
        <div class="mt-[61px] bg-gradient-to-t from-[#242424] to-[#262626] bg-clip-text text-center text-[40px] font-[600] leading-[53px] text-black/50 mix-blend-color-burn tablet:mt-[75px] tablet:text-[64px] tablet:leading-[85px]">完美横屏应用计划</div>
        <div class="mt-12 bg-gradient-to-t from-[#242424] to-[#262626] bg-clip-text text-center text-[20px] font-[600] leading-[27px] text-black/50 mix-blend-color-burn tablet:mt-[23px] tablet:text-[24px] tablet:font-[600] tablet:leading-[32px]">正在加载中，请稍等……</div>
    </div>
  </div>
  </template>
  
  <style scoped>
    .splash-screen{
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255,255,255,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        background-image: url('/images/ai_cover_pc.png');
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
    }
    .theme-dark-mode{
      .splash-screen {
        background-image: url('/images/ai_cover_dark_bg.webp');
      }
    }
  </style>
  