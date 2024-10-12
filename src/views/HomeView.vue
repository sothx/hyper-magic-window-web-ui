<script setup lang="tsx">
import TheWelcome from '../components/TheWelcome.vue'
import { ref, h, onMounted, type VNode, type VNodeChild, reactive, watch } from 'vue'
import type MergeRuleItem from "@/types/MergeRuleItem";
import $to from 'await-to-js'
import ErrorModal from '@/components/ErrorModal.vue';
import EmbeddedAppDrawer from '@/components/EmbeddedAppDrawer.vue';
// @ts-ignore
import { exec } from 'kernelsu';
import { NButton, createDiscreteApi, type DataTableColumns, type MessageApi } from 'naive-ui'
import * as ksuApi from '@/apis/ksuApi'
import { useDeviceStore } from '@/stores/device';
import * as xmlFormat from '@/utils/xmlFormat';
import axios from 'axios';
import { useEmbeddedStore } from '@/stores/embedded';
type EmbeddedAppDrawerInstance = InstanceType<typeof EmbeddedAppDrawer>;

const deviceStore = useDeviceStore()
const embeddedStore = useEmbeddedStore()
const addEmbeddedApp = ref<EmbeddedAppDrawerInstance | null>(null);
const updateEmbeddedApp = ref<EmbeddedAppDrawerInstance | null>(null);
const { message } = createDiscreteApi(['message'])
const testMsg = ref<any>({})
const testXml = ref<any>('')
const columns = createColumns({
  play(row: MergeRuleItem) {
    message.info(`暂未开放`)
  }
})
const activeDrawer = ref(false)
const sourceEmbeddedRulesList = ref<string>()
const showErrorModal = ref(false)

watch(
  () => embeddedStore.isNeedShowErrorModal,   // 监听的值
  (newValue, oldValue) => { // 回调函数，值变化时执行
    if (newValue) {
      showErrorModal.value = true
    }
  },
  { immediate: false }  // 默认是 false，不需要设置，确保不会在初始时执行
);

const reloadPage = () => {
  window.location.reload();
};

const pagination = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  onChange: (page: number) => {
    pagination.page = page
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
  }
})

const openAddEmbeddedApp = async () => {
  if (addEmbeddedApp.value) {
    const [addEmbeddedAppErr,addEmbeddedAppRes] = await $to(addEmbeddedApp.value.openDrawer())
    if (addEmbeddedAppErr) {
      console.log('操作取消:', addEmbeddedAppErr);
    } else {
      console.log('提交的结果:', addEmbeddedAppRes);
    }
  }
}

onMounted(async () => {
  // // 测试获取XML文件
  const [
    getCustomConfigEmbeddedRulesListErr,
    getCustomConfigEmbeddedRulesListRes,
  ] = await $to(ksuApi.getCustomConfigEmbeddedRulesList());
  if (!getCustomConfigEmbeddedRulesListErr) {
    testXml.value = xmlFormat.testXMLToObject<any>(
      getCustomConfigEmbeddedRulesListRes,
      'package_config',
      'package',
      true
    );
    // testXml.value = xml;
  }
  // const [sourceEmbeddedRulesListErr,sourceEmbeddedRulesListData] = await $to(ksuApi.getSourceEmbeddedRulesList())
  // if (sourceEmbeddedRulesListErr) {
  //   message.error(`报错了，呜呜呜`)
  // }
  // sourceEmbeddedRulesList.value = sourceEmbeddedRulesListData

})
function createColumns({
  play
}: {
  play: (row: MergeRuleItem) => void
}): DataTableColumns<MergeRuleItem> {
  return [
    {
      title: '应用包名',
      key: 'name'
    },
    {
      title: '规则来源',
      key: 'ruleMode',
      render(row) {
        if (row.ruleMode === 'custom') {
          return (
            <n-tag type="info">自定义规则</n-tag>
          )
        }
        return (
          <n-tag type="error">模块规则</n-tag>
        )
      }
    },
    {
      title: '当前规则',
      key: 'settingMode',
      render(row, index) {
        const modeMap = {
          embedded: {
            type: 'success',
            name: '平行窗口',
            onClick(row: MergeRuleItem, index: number) {
              message.info('功能尚未开放')
              testMsg.value = row;
            }
          },
          fullScreen: {
            type: 'info',
            name: '全屏',
            onClick(row: MergeRuleItem, index: number) {
              message.info('功能尚未开放')
              testMsg.value = row;
            }
          },
          fixedOrientation: {
            type: 'warning',
            name: '居中布局',
            onClick(row: MergeRuleItem, index: number) {
              message.info('功能尚未开放')
              testMsg.value = row;
            }
          },
          disabled: {
            type: 'error',
            name: '原始布局',
            onClick(row: MergeRuleItem, index: number) {
              message.info('功能尚未开放')
              testMsg.value = row;
            }
          }
        }
        return (
          <n-button size="small" strong dashed type={modeMap[row.settingMode].type} onClick={() => modeMap[row.settingMode].onClick(row, index)}>{modeMap[row.settingMode].name}</n-button>
        )
      }
    }
  ]
}
</script>

<template>
  <n-spin :show="embeddedStore.loading">
    <template v-if="embeddedStore.isNeedShowErrorModal" #description>
      发生错误，无法加载
    </template>
    <main>
      <div>
        <!-- <p class="text-blue-600 text-2xl text-center text-indigo-600">完美横屏应用计划 Web UI 管理后台正在开发中，敬请期待~</p>
      <div class="text-center mt-10 mb-10">
        <n-button @click="activeDrawer = true">
          这是一个测试用的抽屉~内容是小米的往年标语~
        </n-button>
      </div> -->
        <n-drawer v-model:show="activeDrawer" :width="502" placement="right">
          <n-drawer-content title="测试抽屉" closable>
            <p>获取设备信息</p>
            <p>{{ deviceStore.deviceCharacteristics }}</p>
            <p>获取设备Android Target</p>
            <p>{{ deviceStore.androidTargetSdk }}</p>
            <p>获取设备Soc类型</p>
            <p>{{ deviceStore.deviceSocModel }}</p>
            <p>获取设备Soc名称</p>
            <p>{{ deviceStore.deviceSocName }}</p>
            <p>点击获取到的信息</p>
            <p>{{ testMsg }}</p>
            <p>测试xml</p>
            <p>{{ testXml }}</p>
            <p>错误信息收集</p>
            <p>{{ embeddedStore.errorLogging }}</p>
            <p>自定义平行窗口配置</p>
            <p>{{ embeddedStore.customConfigEmbeddedRulesList }}</p>
            <p>自定义信息模式配置</p>
            <p>{{ embeddedStore.customConfigFixedOrientationList }}</p>
            <!-- <p>{{ embeddedStore.customConfigEmbeddedRulesList }}</p> -->
            <p>模块平行窗口配置</p>
            <p>{{ embeddedStore.sourceEmbeddedRulesList }}</p>
            <p>模块信箱模式配置</p>
            <p>{{ embeddedStore.sourceFixedOrientationList }}</p>
            <p>模块横屏配置</p>
            <p>{{ embeddedStore.embeddedSettingConfig }}</p>
            <p>模块合并配置</p>
            <p>{{ embeddedStore.mergeRuleList }}</p>
          </n-drawer-content>
        </n-drawer>
      </div>
      <n-card title="操作栏" size="small">
        <n-button class="mt-5 mb-5" type="info" @click="openAddEmbeddedApp">
              添加应用
            </n-button>
        <n-button class="mt-5 ml-5 mb-5 mr-5" type="success" @click="() => reloadPage()">
          刷新 Web UI
        </n-button>
        <n-button @click="activeDrawer = true">
          测试专用按钮
        </n-button>
        <n-input-group>
          <n-input size="large" v-model:value="embeddedStore.searchName" placeholder="搜索应用包名" autosize style="min-width: 80%" />
          <n-button size="large" type="primary" ghost @click="() => embeddedStore.searchName = ''">
            清空
          </n-button>
        </n-input-group>
      </n-card>
      <n-data-table :columns="columns" :data="embeddedStore.filterMergeRuleList" :pagination="pagination" />
    </main>
    <ErrorModal v-model="showErrorModal" :errorLogging="embeddedStore.errorLogging" />
    <EmbeddedAppDrawer ref="addEmbeddedApp" type="add" title="添加应用" />
    <EmbeddedAppDrawer ref="updateEmbeddedApp" type="update" title="更新应用" />
  </n-spin>
</template>
