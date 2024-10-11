<script setup lang="ts">
import { ref } from 'vue';
import { useDeviceStore } from '@/stores/device';
import { useEmbeddedStore } from '@/stores/embedded';
import { createDiscreteApi } from 'naive-ui';

// Refs and stores
const activeDrawer = ref(false); // Controls drawer visibility
const deviceStore = useDeviceStore();
const embeddedStore = useEmbeddedStore();
const { message } = createDiscreteApi(['message'])

// Function to toggle the drawer
const openDrawer = () => {
    deviceStore.androidTargetSdk = 35
 if (deviceStore.androidTargetSdk && (deviceStore.androidTargetSdk > 34 || deviceStore.androidTargetSdk < 32)) {
    message.warning('该功能暂时未兼容Android 11或Android 15+，请等待后续消息~')
 }  else {
    activeDrawer.value = true;
 }
};
</script>

<template>
  <!-- Button Slot -->
  <slot v-bind="{ openDrawer }" @click="openDrawer"></slot>

  <!-- Drawer -->
  <n-drawer v-model:show="activeDrawer" :width="502" placement="right">
    <n-drawer-content title="添加应用" closable>
        该功能尚在开发中，请期待后续消息~
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>
</style>