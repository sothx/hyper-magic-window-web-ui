<script setup lang="ts">
  import { RouterLink, RouterView } from 'vue-router';
  import HelloWorld from './components/HelloWorld.vue';
  import { Sidebar } from './components/Sidebar';
  import ErrorModal from '@/components/ErrorModal.vue';
  import { ref, onMounted, watch } from 'vue';
  import { useDeviceStore } from '@/stores/device';
  import { useEmbeddedStore } from '@/stores/embedded';
  import { useAutoUIStore } from '@/stores/autoui';

  const deviceStore = useDeviceStore();
  const embeddedStore = useEmbeddedStore();
  const autoUIStore = useAutoUIStore();
  const showErrorModal = ref(false);

  watch(
    () => deviceStore.isNeedShowErrorModal, // 监听的值
    (newValue, oldValue) => {
      // 回调函数，值变化时执行
      if (newValue) {
        showErrorModal.value = true;
      }
    },
    { immediate: false } // 默认是 false，不需要设置，确保不会在初始时执行
  );

  onMounted(async () => {
    deviceStore.initDefault();
    embeddedStore.initDefault();
    autoUIStore.initDefault();
  });
</script>

<template>
  <!-- <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header> -->
  <Sidebar>
    <RouterView />
  </Sidebar>
  <ErrorModal
    v-model="showErrorModal"
    :errorLogging="deviceStore.errorLogging"
  />
</template>

<style scoped>
  /* header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
} */
</style>
