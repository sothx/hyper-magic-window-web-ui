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
</script>
<template>
	<div class="mt-5 bg-[#313569]">
		<img src="/images/happy_new_year_banner.jpg" />
		<div class="min-h-[100vh] h-full text-white lg:text-lg md:text-md text-sm text-center mx-2 pb-20">
			<p class="mt-8">年从节换，新岁已至，转眼已经迎来了<span class="text-[#E9D1A1] font-bold">「2025」</span>年。</p>
			<p class="mt-8"><span class="text-[#E9D1A1] font-bold">「2024年3月31日」</span>，我正式接手<span class="text-[#E9D1A1] font-bold">「完美横屏应用计划」</span></p>
			<p class="mt-8">至今，新版<span class="text-[#E9D1A1] font-bold">「完美横屏应用计划」</span>共陪伴了大家<span class="text-[#E9D1A1] font-bold">「246」</span>天。</p>
			<p class="mt-8">诞生了<span class="text-[#E9D1A1] font-bold">「2907」</span>个提交和<span class="text-[#E9D1A1] font-bold">「683」</span>个版本。</p>
			<p class="mt-8">你们对<span class="text-[#E9D1A1] font-bold">「完美横屏应用计划」</span>的认可，也是我维护下去的动力！</p>
			<p class="mt-8">不管何时何地，<span class="text-[#E9D1A1] font-bold">「遇见你们都是我最美好的事」</span>，感谢大家的一路相伴。</p>
			<p class="mt-8">愿<span class="text-[#E9D1A1] font-bold">「新年胜旧年」</span>，多喜乐，长安宁。</p>
			<p class="mt-8">年年皆胜意，岁岁皆欢愉，祝大家<span class="text-[#E9D1A1] font-bold">「新年快乐」</span>！</p>
			<p class="mt-8">十分感谢所有给<span class="text-[#E9D1A1] font-bold">「完美横屏应用计划」</span>打赏给予认可的酷友。</p>
			<p class="mt-8">最后感谢<span class="text-[#E9D1A1] font-bold">「柚稚」</span>、<span class="text-[#E9D1A1] font-bold">「Kirara」</span>和<span class="text-[#E9D1A1] font-bold">「御坂初琴」</span>给我提供了不少的帮助！</p>
			<p class="mt-20"><span class="text-[#E9D1A1] font-bold">「2025年1月1日」 By 做梦书 致辞</span></p>
		</div>
	</div>
</template>

<style></style>
