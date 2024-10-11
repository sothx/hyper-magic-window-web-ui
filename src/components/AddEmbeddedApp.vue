<script setup lang="ts">
import { ref } from 'vue';
import { useDeviceStore } from '@/stores/device';
import { useEmbeddedStore } from '@/stores/embedded';

// Refs and stores
const activeDrawer = ref(false); // Controls drawer visibility
const deviceStore = useDeviceStore();
const embeddedStore = useEmbeddedStore();

// Function to toggle the drawer
const openDrawer = () => {
  activeDrawer.value = true;
};
</script>

<template>
  <!-- Button Slot -->
  <slot v-bind="{ openDrawer }" @click="openDrawer"></slot>

  <!-- Drawer -->
  <n-drawer v-model:show="activeDrawer" :width="502" placement="right">
    <n-drawer-content title="添加应用" closable>
        这是一个抽屉
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>
</style>