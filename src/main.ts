import "./assets/main.css";
import "./style.css";
// 通用字体
import "vfonts/Lato.css";
// 等宽字体
import "vfonts/FiraCode.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
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
  NTabs,
  NTabPane,
  NInput,
  NInputGroup,
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
    NMessageProvider,
    NDropdown,
    NSwitch,
    NTag,
    NInputGroup,
    NInput,
    NSpin,
    NSpace,
    NModal,
    NAlert,
    NCard,
    NTabs,
    NTabPane,
    NRadioGroup,
    NRadioButton,
    NInputGroupLabel,
    NInputNumber,
    NSlider,
    NAvatar,
    NBreadcrumb,
    NBreadcrumbItem,
    NWatermark,
    NSkeleton
  ],
});

const app = createApp(App);

app.use(naive);

app.use(createPinia());
app.use(router);

app.mount("#app");
