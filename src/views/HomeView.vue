<script setup lang="tsx">
import TheWelcome from '../components/TheWelcome.vue'
import { ref, h, onMounted, type VNode, type VNodeChild, reactive, watch } from 'vue'
import type EmbeddedMergeRuleItem from "@/types/EmbeddedMergeRuleItem";
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
const { message, modal } = createDiscreteApi(['message', 'modal'])
const testMsg = ref<any>({})
const testXml = ref<any>('')
const columns = createColumns()
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
    const [addEmbeddedAppErr, addEmbeddedAppRes] = await $to(addEmbeddedApp.value.openDrawer())
    if (addEmbeddedAppErr) {
      console.log('操作取消:', addEmbeddedAppErr);
    } else {
      if (addEmbeddedAppRes.settingMode === 'fullScreen') {
        embeddedStore.customConfigEmbeddedRulesList[addEmbeddedAppRes.name] = {
          name: addEmbeddedAppRes.name,
          fullRule: addEmbeddedAppRes.modePayload.fullRule
        }
        embeddedStore.customConfigFixedOrientationList[addEmbeddedAppRes.name] = {
          name: addEmbeddedAppRes.name,
          ...(addEmbeddedAppRes.modePayload.isShowDivider) ? { isShowDivider: true } : {},
          ...(addEmbeddedAppRes.modePayload.skipSelfAdaptive) ? { disable: true } : {},
          ...(addEmbeddedAppRes.modePayload.supportFullSize) ? { supportFullSize: true } : {}
        }
      }
      if (addEmbeddedAppRes.settingMode === 'fixedOrientation') {
        embeddedStore.customConfigFixedOrientationList[addEmbeddedAppRes.name] = {
              name: addEmbeddedAppRes.name,
              ...(addEmbeddedAppRes.modePayload.ratio !== undefined) ? {
                ratio: addEmbeddedAppRes.modePayload.ratio
              } : {}
        }
      }
      if (addEmbeddedAppRes.settingMode === 'disabled') {
        embeddedStore.customConfigFixedOrientationList[addEmbeddedAppRes.name] = {
          name: addEmbeddedAppRes.name,
          disable: true
        }
      }
      const [submitAddEmbeddedAppErr, submitAddEmbeddedAppRes] = await $to(ksuApi.updateEmbeddedApp({
        customEmbeddedRulesListXML: xmlFormat.objectToXML(embeddedStore.customConfigEmbeddedRulesList),
        customFixedOrientationListXML: xmlFormat.objectToXML(embeddedStore.customConfigFixedOrientationList),
        settingConfigXML: xmlFormat.objectToXML(embeddedStore.embeddedSettingConfig),
        switchAction: {
          name: addEmbeddedAppRes.name,
          action: ['embedded', 'fullScreen'].includes(addEmbeddedAppRes.settingMode) ? 'enable' : 'disable'
        }
      }))
      if (submitAddEmbeddedAppErr) {
        message.error('发生错误')
        addEmbeddedAppRes.loadingCallback && addEmbeddedAppRes.loadingCallback()
      } else {
        message.info('添加成功')
        embeddedStore.updateMergeRuleList()
        addEmbeddedAppRes.loadingCallback && addEmbeddedAppRes.loadingCallback()
        addEmbeddedAppRes.closeCallback && addEmbeddedAppRes.closeCallback()
      }
    }
  }
}

const openUpdateEmbeddedApp = async (row: EmbeddedMergeRuleItem, index: number) => {
  if (updateEmbeddedApp.value) {
    const [updateEmbeddedAppErr, updateEmbeddedAppRes] = await $to(updateEmbeddedApp.value.openDrawer(row))
    if (updateEmbeddedAppErr) {
      console.log('操作取消:', updateEmbeddedAppErr);
    } else {
      if (row.settingMode !== updateEmbeddedAppRes.settingMode) {
        if (updateEmbeddedAppRes.settingMode === 'fullScreen') {
          if (embeddedStore.customConfigEmbeddedRulesList[row.name]) {
            embeddedStore.customConfigEmbeddedRulesList[row.name].fullRule = updateEmbeddedAppRes.modePayload.fullRule
            const hasDefaultSettings = embeddedStore.sourceEmbeddedRulesList[row.name].hasOwnProperty('defaultSettings')
            if (hasDefaultSettings) {
              embeddedStore.sourceEmbeddedRulesList[row.name].defaultSettings = true
            }
          } else {
            embeddedStore.customConfigEmbeddedRulesList[row.name] = {
              name: row.name,
              fullRule: updateEmbeddedAppRes.modePayload.fullRule
            }
          }
          if (embeddedStore.customConfigFixedOrientationList[row.name]) {
            embeddedStore.customConfigFixedOrientationList[row.name].isShowDivider = updateEmbeddedAppRes.modePayload.isShowDivider
            embeddedStore.customConfigFixedOrientationList[row.name].disable = updateEmbeddedAppRes.modePayload.skipSelfAdaptive
            embeddedStore.customConfigFixedOrientationList[row.name].supportFullSize = updateEmbeddedAppRes.modePayload.supportFullSize
          } else {
            embeddedStore.customConfigFixedOrientationList[row.name] = {
              name: row.name,
              ...(updateEmbeddedAppRes.modePayload.isShowDivider) ? { isShowDivider: true } : {},
              ...(updateEmbeddedAppRes.modePayload.skipSelfAdaptive) ? { disable: true } : {},
              ...(updateEmbeddedAppRes.modePayload.supportFullSize) ? { supportFullSize: true } : {}
            }
          }
        }
        if (updateEmbeddedAppRes.settingMode === 'fixedOrientation') {
          if (embeddedStore.customConfigFixedOrientationList[row.name]) {
            const hasDisable = embeddedStore.customConfigFixedOrientationList[row.name].hasOwnProperty('disable')
            if (hasDisable) {
              delete embeddedStore.customConfigFixedOrientationList[row.name].disable
            }
            if (updateEmbeddedAppRes.modePayload.ratio !== undefined) {
              embeddedStore.customConfigFixedOrientationList[row.name].ratio = updateEmbeddedAppRes.modePayload.ratio
            }
          } else {
            embeddedStore.customConfigFixedOrientationList[row.name] = {
              name: row.name,
              ...(updateEmbeddedAppRes.modePayload.ratio !== undefined) ? {
                ratio: updateEmbeddedAppRes.modePayload.ratio
              } : {}
            }
          }
        }
        if (updateEmbeddedAppRes.settingMode === 'disabled') {
          if (embeddedStore.customConfigFixedOrientationList[row.name]) {
            embeddedStore.customConfigFixedOrientationList[row.name].disable = true
          } else {
            embeddedStore.customConfigFixedOrientationList[row.name] = {
              name: row.name,
              disable: true
            }
          }
        }
        if (updateEmbeddedAppRes.settingMode === 'embedded') {
          if (row.ruleMode === 'custom' && row.isSupportEmbedded) {
            delete embeddedStore.customConfigEmbeddedRulesList[row.name]
            const hasDefaultSettings = embeddedStore.sourceEmbeddedRulesList[row.name].hasOwnProperty('defaultSettings')
            if (hasDefaultSettings) {
              embeddedStore.sourceEmbeddedRulesList[row.name].defaultSettings = true
            }
          }
        }
      }
      const [submitUpdateEmbeddedAppErr, submitUpdateEmbeddedAppRes] = await $to(ksuApi.updateEmbeddedApp({
        customEmbeddedRulesListXML: xmlFormat.objectToXML(embeddedStore.customConfigEmbeddedRulesList),
        customFixedOrientationListXML: xmlFormat.objectToXML(embeddedStore.customConfigFixedOrientationList),
        settingConfigXML: xmlFormat.objectToXML(embeddedStore.embeddedSettingConfig),
        switchAction: {
          name: row.name,
          action: ['embedded', 'fullScreen'].includes(updateEmbeddedAppRes.settingMode) ? 'enable' : 'disable'
        }
      }))
      if (submitUpdateEmbeddedAppErr) {
        message.error('发生错误')
        updateEmbeddedAppRes.loadingCallback && updateEmbeddedAppRes.loadingCallback()
      } else {
        message.info('更新成功')
        embeddedStore.updateMergeRuleList()
        updateEmbeddedAppRes.loadingCallback && updateEmbeddedAppRes.loadingCallback()
        updateEmbeddedAppRes.closeCallback && updateEmbeddedAppRes.closeCallback()
      }

    }
  }
}

const testAction = async () => {
  const [err, res] = await $to(ksuApi.updateEmbeddedApp({
    customEmbeddedRulesListXML: xmlFormat.objectToXML(embeddedStore.sourceEmbeddedRulesList),
    customFixedOrientationListXML: xmlFormat.objectToXML(embeddedStore.sourceFixedOrientationList),
    settingConfigXML: '',
    switchAction: {
      name: 'com.tencent.mobileqq',
      action: 'disable'
    }
  }))

  if (err) {
    errorTest.value = err;
  } else {
    successTest.value = res;
  }

  message.info('成功了')

}

const successTest = ref<any>([]);

const errorTest = ref<any>([]);

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

const handleRuleMode = (row: EmbeddedMergeRuleItem, index: number, ruleMode: EmbeddedMergeRuleItem["ruleMode"]) => {
  if (ruleMode === 'module') {
    modal.create({
      title: '模块规则说明',
      type: 'warning',
      preset: 'dialog',
      content: () => (<p>模块已对 <span class="font-bold text-gray-600">{row.name}</span> 配置了合适的适配规则，且不可被移除，仅有自定义规则可以被移除哦~</p>)
    })
  }

  if (ruleMode === 'custom') {
    modal.create({
      title: '想清除自定义规则吗？',
      type: 'warning',
      preset: 'dialog',
      content: () => (<p>清除自定义规则后，你对 <span class="font-bold text-gray-600">{row.name}</span> 所做的所有自定义配置将丢失，如果该应用同时还存在 <span class="font-bold text-gray-600">模块规则</span> ，将会还原回模块自身的适配规则。确定要继续吗？</p>),
      positiveText: '确定清除',
      negativeText: '我再想想',
      onPositiveClick: () => {
        message.info('该功能尚在开发中，请等待后续消息')
      }
    })
  }
}


function createColumns(): DataTableColumns<EmbeddedMergeRuleItem> {
  return [
    {
      title: '应用包名',
      key: 'name'
    },
    {
      title: '规则来源',
      key: 'ruleMode',
      render(row, index) {
        if (row.ruleMode === 'custom') {
          return (
            <n-button size="small" dashed type="info" onClick={() => handleRuleMode(row, index, 'custom')}>自定义规则</n-button>
          )
        }
        return (
          <n-button size="small" dashed type="error" onClick={() => handleRuleMode(row, index, "module")}>模块规则</n-button>
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
            onClick(row: EmbeddedMergeRuleItem, index: number) {
              openUpdateEmbeddedApp(row, index)
              testMsg.value = row;
            }
          },
          fullScreen: {
            type: 'info',
            name: '全屏',
            onClick(row: EmbeddedMergeRuleItem, index: number) {
              openUpdateEmbeddedApp(row, index)
              testMsg.value = row;
            }
          },
          fixedOrientation: {
            type: 'warning',
            name: '居中布局',
            onClick(row: EmbeddedMergeRuleItem, index: number) {
              openUpdateEmbeddedApp(row, index)
              testMsg.value = row;
            }
          },
          disabled: {
            type: 'error',
            name: '原始布局',
            onClick(row: EmbeddedMergeRuleItem, index: number) {
              openUpdateEmbeddedApp(row, index)
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
    <main class="mb-10">
      <div>
        <!-- <p class="text-blue-600 text-2xl text-center text-indigo-600">完美横屏应用计划 Web UI 管理后台正在开发中，敬请期待~</p>
      <div class="text-center mt-10 mb-10">
        <n-button @click="activeDrawer = true">
          这是一个测试用的抽屉~内容是小米的往年标语~
        </n-button>
      </div> -->
        <n-drawer v-model:show="activeDrawer" :width="502" placement="right">
          <n-drawer-content title="测试抽屉" closable>
            <p>测试成功信息</p>
            {{ successTest }}
            <p>测试失败信息</p>
            {{ errorTest }}
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
      <div class="mt-5">
        <div class="px-4 sm:px-0 mb-5">
          <h3 class="text-base font-semibold leading-7 text-gray-900">应用横屏配置</h3>
          <p class="mt-1 max-w-2xl text-sm leading-6 text-gray-500">在这里可以快速管理平板在横屏应用下的配置</p>
        </div>
      </div>
      <n-card title="操作栏" size="small">
        <n-button class="mb-3 mr-3" type="info" @click="openAddEmbeddedApp">
          添加应用
        </n-button>
        <n-button class="mb-3 mr-3" type="success" @click="() => reloadPage()">
          刷新 Web UI
        </n-button>
        <n-button class="mb-3 mr-3" @click="activeDrawer = true">
          测试专用按钮
        </n-button>
        <n-button class="mb-3" @click="testAction">
          测试提交
        </n-button>
        <n-input-group>
          <n-input size="large" v-model:value="embeddedStore.searchKeyWord" placeholder="搜索应用包名" autosize
            style="min-width: 80%" />
          <n-button size="large" type="primary" @click="() => embeddedStore.searchKeyWord = ''">
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
