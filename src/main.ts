import "./assets/fonts.css";
import "./assets/main.css";
import "./style.css";
import "./assets/iconfont.js";
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
  NSplit,
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
  NBadge,
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
  NIcon,
  NStatistic,
  NThemeEditor,
  NCode,
  NGrid,
  NPageHeader,
  NConfigProvider,
  NLog,
  NCollapse,
  NCollapseItem,
  NCollapseTransition
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
    NSplit,
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
    NGrid,
    NIcon,
    NBadge,
    NCollapse,
    NCollapseItem,
    NCollapseTransition,
    NCode
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
