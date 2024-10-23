<script setup lang="ts">
  import { ref } from 'vue';
  import WelcomeItem from './WelcomeItem.vue';
  import DocumentationIcon from './icons/IconDocumentation.vue';
  import ToolingIcon from './icons/IconTooling.vue';
  import EcosystemIcon from './icons/IconEcosystem.vue';
  import CommunityIcon from './icons/IconCommunity.vue';
  import SupportIcon from './icons/IconSupport.vue';
  const activeDrawer = ref(false);
</script>

<template>
  <div>
    <p class="text-blue-600 text-2xl text-center text-indigo-600">
      完美横屏应用计划 Web UI 管理后台正在建设中，敬请期待~
    </p>
    <div class="text-center mt-10">
      <n-button @click="activeDrawer = true">
        这是一个测试用的抽屉~内容是小米的往年标语~
      </n-button>
    </div>
    <n-drawer v-model:show="activeDrawer" :width="502" placement="right">
      <n-drawer-content title="测试抽屉" closable>
        <p>永远相信美好的事情即将发生！！！</p>
        <p>让每个人都能享受科技的乐趣！！！</p>
        <p>优秀的公司赚取利润，伟大的公司赢得人心！！！</p>
        <p>小米为发烧而生！！！</p>
        <p>我所有的向往！！！</p>
      </n-drawer-content>
    </n-drawer>
  </div>
  <!-- <WelcomeItem>
    <template #icon>
      <DocumentationIcon />
    </template>
    <template #heading>Notice</template>
    完美横屏应用计划 Web UI 管理后台正在建设中，敬请期待~
  </WelcomeItem> -->
  <!-- <WelcomeItem>
    <template #icon>
      <DocumentationIcon />
    </template>
    <template #heading>Documentation</template>

    Vue’s
    <a href="https://vuejs.org/" target="_blank" rel="noopener">official documentation</a>
    provides you with all information you need to get started.
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <ToolingIcon />
    </template>
    <template #heading>Tooling</template>

    This project is served and bundled with
    <a href="https://vitejs.dev/guide/features.html" target="_blank" rel="noopener">Vite</a>. The
    recommended IDE setup is
    <a href="https://code.visualstudio.com/" target="_blank" rel="noopener">VSCode</a> +
    <a href="https://github.com/johnsoncodehk/volar" target="_blank" rel="noopener">Volar</a>. If
    you need to test your components and web pages, check out
    <a href="https://www.cypress.io/" target="_blank" rel="noopener">Cypress</a> and
    <a href="https://on.cypress.io/component" target="_blank" rel="noopener"
      >Cypress Component Testing</a
    >.

    <br />

    More instructions are available in <code>README.md</code>.
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <EcosystemIcon />
    </template>
    <template #heading>Ecosystem</template>

    Get official tools and libraries for your project:
    <a href="https://pinia.vuejs.org/" target="_blank" rel="noopener">Pinia</a>,
    <a href="https://router.vuejs.org/" target="_blank" rel="noopener">Vue Router</a>,
    <a href="https://test-utils.vuejs.org/" target="_blank" rel="noopener">Vue Test Utils</a>, and
    <a href="https://github.com/vuejs/devtools" target="_blank" rel="noopener">Vue Dev Tools</a>. If
    you need more resources, we suggest paying
    <a href="https://github.com/vuejs/awesome-vue" target="_blank" rel="noopener">Awesome Vue</a>
    a visit.
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <CommunityIcon />
    </template>
    <template #heading>Community</template>

    Got stuck? Ask your question on
    <a href="https://chat.vuejs.org" target="_blank" rel="noopener">Vue Land</a>, our official
    Discord server, or
    <a href="https://stackoverflow.com/questions/tagged/vue.js" target="_blank" rel="noopener"
      >StackOverflow</a
    >. You should also subscribe to
    <a href="https://news.vuejs.org" target="_blank" rel="noopener">our mailing list</a> and follow
    the official
    <a href="https://twitter.com/vuejs" target="_blank" rel="noopener">@vuejs</a>
    twitter account for latest news in the Vue world.
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <SupportIcon />
    </template>
    <template #heading>Support Vue</template>

    As an independent project, Vue relies on community backing for its sustainability. You can help
    us by
    <a href="https://vuejs.org/sponsor/" target="_blank" rel="noopener">becoming a sponsor</a>.
  </WelcomeItem> -->
</template>
