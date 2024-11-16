import "./assets/fonts.css";
import "./assets/main.css";
import "./style.css";
// 通用字体
import "vfonts/Lato.css";
// 等宽字体
import "vfonts/FiraCode.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import {
  // create naive ui
  create,
  // component
  NButton,
  NDrawer,
  NDrawerContent,
  NSwitch,
  NTable,
  NDataTable,
  NMessageProvider,
  NTag,
  NTab,
  NTabs,
  NTabPane,
  NInput,
  NInputGroup,
  darkTheme,
  NSpin,
  NSpace,
  NCard,
  NWatermark,
  NModal,
  NAlert,
  NRadioGroup,
  NRadioButton,
  NInputGroupLabel,
  NInputNumber,
  NDropdown,
  NSlider,
  NAvatar,
  NBreadcrumb,
  NBreadcrumbItem,
  NSkeleton,
  NCheckboxGroup,
  NCheckbox,
  NGi,
  NStatistic,
  NThemeEditor,
  NGrid,
  NPageHeader,
  NConfigProvider,
  NLog
} from "naive-ui";

import App from "./App.vue";
import router from "./router";

const naive = create({
  components: [
    NButton,
    NDrawer,
    NDrawerContent,
    NTable,
    NDataTable,
    NPageHeader,
    NMessageProvider,
    NDropdown,
    NSwitch,
    NTag,
    NInputGroup,
    NInput,
    NSpin,
    NStatistic,
    NSpace,
    NModal,
    NAlert,
    NCard,
    NTab,
    NTabs,
    NTabPane,
    NRadioGroup,
    NRadioButton,
    NInputGroupLabel,
    NInputNumber,
    darkTheme,
    NSlider,
    NThemeEditor,
    NAvatar,
    NBreadcrumb,
    NBreadcrumbItem,
    NConfigProvider,
    NWatermark,
    NCheckboxGroup,
    NLog,
    NCheckbox,
    NSkeleton,
    NGi,
    NGrid
  ],
});

const app = createApp(App);
// enableDarkMode({});
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate)
app.use(pinia);
app.use(naive);
app.use(router);
app.mount("#app");
