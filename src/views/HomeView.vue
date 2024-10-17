<script setup lang="tsx">
import { ref, reactive, watch } from 'vue'
import type EmbeddedMergeRuleItem from "@/types/EmbeddedMergeRuleItem";
import $to from 'await-to-js'
import ErrorModal from '@/components/ErrorModal.vue';
import EmbeddedAppDrawer from '@/components/EmbeddedAppDrawer.vue';
import { NButton, createDiscreteApi, type DataTableColumns, type NInput } from 'naive-ui'
import * as ksuApi from '@/apis/ksuApi'
import { useDeviceStore } from '@/stores/device';
import * as xmlFormat from '@/utils/xmlFormat';
import { useEmbeddedStore } from '@/stores/embedded';
type EmbeddedAppDrawerInstance = InstanceType<typeof EmbeddedAppDrawer>;
type SearchKeyWordInputInstance = InstanceType<typeof NInput>;

const deviceStore = useDeviceStore()
const embeddedStore = useEmbeddedStore()
const searchKeyWordInput = ref<SearchKeyWordInputInstance | null>(null);
const addEmbeddedApp = ref<EmbeddedAppDrawerInstance | null>(null);
const updateEmbeddedApp = ref<EmbeddedAppDrawerInstance | null>(null);
const { message, modal } = createDiscreteApi(['message', 'modal'])
const columns = createColumns()
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
  embeddedStore.initDefault()
};

const testBtn = () => {
  // ksuApi.getInstalledApps().then((res:any) => {
  //   modal.create({
  //     title: '兼容说明',
  //     type: 'warning',
  //     preset: 'dialog',
  //     content: () => (<p>{JSON.stringify(res)}</p>)
  //   })
  // }).catch((err) => {
  //   modal.create({
  //     title: '不兼容说明',
  //     type: 'warning',
  //     preset: 'dialog',
  //     content: () => (<p>{err}</p>)
  //   })
  // })
}

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
  if (deviceStore.deviceCharacteristics !== 'tablet') {
    modal.create({
      title: '不兼容说明',
      type: 'warning',
      preset: 'dialog',
      content: () => (<p>该功能仅兼容平板设备，暂时不兼容折叠屏设备，请等待后续更新情况！</p>)
    })
    return;
  }
  if (deviceStore.androidTargetSdk && ![32, 33, 34].includes(deviceStore.androidTargetSdk)) {
    modal.create({
      title: '不兼容说明',
      type: 'warning',
      preset: 'dialog',
      content: () => (<p>该功能尚未对 Android 11 或 Android 15+ 做兼容，请等待后续更新情况！</p>)
    })
    return;
  }
  if (addEmbeddedApp.value) {
    const [addEmbeddedAppCancel, addEmbeddedAppRes] = await $to(addEmbeddedApp.value.openDrawer())
    if (addEmbeddedAppCancel) {
      console.log('操作取消:', addEmbeddedAppCancel);
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
      embeddedStore.embeddedSettingConfig[addEmbeddedAppRes.name] = {
        name: addEmbeddedAppRes.name,
        embeddedEnable: ['embedded', 'fullScreen'].includes(addEmbeddedAppRes.settingMode) ? true : false
      }
      const [submitAddEmbeddedAppErr, submitAddEmbeddedAppRes] = await $to(ksuApi.updateEmbeddedApp({
        customEmbeddedRulesListXML: xmlFormat.objectToXML(embeddedStore.customConfigEmbeddedRulesList, 'package', undefined),
        customFixedOrientationListXML: xmlFormat.objectToXML(embeddedStore.customConfigFixedOrientationList, 'package', undefined),
        settingConfigXML: xmlFormat.objectToXML(embeddedStore.embeddedSettingConfig, 'setting', 'setting_rule'),
        switchAction: {
          name: addEmbeddedAppRes.name,
          action: ['embedded', 'fullScreen'].includes(addEmbeddedAppRes.settingMode) ? 'enable' : 'disable'
        }
      }))
      if (submitAddEmbeddedAppErr) {
        modal.create({
          title: '应用添加失败',
          type: 'error',
          preset: 'dialog',
          content: () => (<p>发生异常错误，添加失败了QwQ，该功能尚在测试阶段，尚不稳定，出现异常请及时反馈~</p>)
        })
        addEmbeddedAppRes.loadingCallback && addEmbeddedAppRes.loadingCallback()
      } else {
        modal.create({
          title: '应用添加成功',
          type: 'success',
          preset: 'dialog',
          content: () => (
            <p>好耶w， <span class="font-bold text-gray-600">{addEmbeddedAppRes.name}</span> 的应用配置添加成功了OwO~如果应用添加后的规则不生效，可以尝试重启平板并且在 <span class="font-bold text-gray-600">平板专区-平行窗口</span> 内 <span class="font-bold text-gray-600">{['embedded', 'fullScreen'].includes(addEmbeddedAppRes.settingMode) ? '打开' : '关闭'}</span> 该应用的开关再做尝试~</p>
          )
        })
        embeddedStore.updateMergeRuleList()
        addEmbeddedAppRes.loadingCallback && addEmbeddedAppRes.loadingCallback()
        addEmbeddedAppRes.closeCallback && addEmbeddedAppRes.closeCallback()
      }
    }
  }
}

const openUpdateEmbeddedApp = async (row: EmbeddedMergeRuleItem, index: number) => {
  if (updateEmbeddedApp.value) {
    const [updateEmbeddedAppCancel, updateEmbeddedAppRes] = await $to(updateEmbeddedApp.value.openDrawer(row))
    if (updateEmbeddedAppCancel) {
      console.log('操作取消:', updateEmbeddedAppCancel);
    } else {
      if (updateEmbeddedAppRes.settingMode === 'fullScreen') {
        if (embeddedStore.customConfigEmbeddedRulesList[row.name]) {
          embeddedStore.customConfigEmbeddedRulesList[row.name].fullRule = updateEmbeddedAppRes.modePayload.fullRule
          const hasDefaultSettings = embeddedStore.sourceEmbeddedRulesList[row.name]?.hasOwnProperty('defaultSettings')
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
          if (updateEmbeddedAppRes.modePayload.hasOwnProperty('isShowDivider')) {
            embeddedStore.customConfigFixedOrientationList[row.name].isShowDivider = updateEmbeddedAppRes.modePayload.isShowDivider
          }
          if (updateEmbeddedAppRes.modePayload.hasOwnProperty('skipSelfAdaptive')) {
            embeddedStore.customConfigFixedOrientationList[row.name].disable = updateEmbeddedAppRes.modePayload.skipSelfAdaptive
          }
          if (updateEmbeddedAppRes.modePayload.hasOwnProperty('supportFullSize')) {
            embeddedStore.customConfigFixedOrientationList[row.name].supportFullSize = updateEmbeddedAppRes.modePayload.supportFullSize
          }
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
          const hasIsScale = embeddedStore.customConfigFixedOrientationList[row.name].hasOwnProperty('isScale')
          if (hasIsScale) {
            delete embeddedStore.customConfigFixedOrientationList[row.name].isScale
          }
          if (updateEmbeddedAppRes.modePayload.ratio !== undefined) {
            embeddedStore.customConfigFixedOrientationList[row.name].ratio = updateEmbeddedAppRes.modePayload.ratio
          } else {
            delete embeddedStore.customConfigFixedOrientationList[row.name].ratio
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
      if (updateEmbeddedAppRes.settingMode === 'disabled' && row.settingMode !== updateEmbeddedAppRes.settingMode) {
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
        if (row.settingMode !== updateEmbeddedAppRes.settingMode) {
          if (row.ruleMode === 'custom' && row.isSupportEmbedded) {
            delete embeddedStore.customConfigEmbeddedRulesList[row.name]
          }
        }
        const hasDefaultSettings = embeddedStore.sourceEmbeddedRulesList[row.name].hasOwnProperty('defaultSettings')
        if (hasDefaultSettings) {
          embeddedStore.sourceEmbeddedRulesList[row.name].defaultSettings = true
        }
      }
      embeddedStore.embeddedSettingConfig[row.name] = {
        name: row.name,
        embeddedEnable: ['embedded', 'fullScreen'].includes(updateEmbeddedAppRes.settingMode) ? true : false
      }
      const [submitUpdateEmbeddedAppErr, submitUpdateEmbeddedAppRes] = await $to(ksuApi.updateEmbeddedApp({
        customEmbeddedRulesListXML: xmlFormat.objectToXML(embeddedStore.customConfigEmbeddedRulesList, 'package', undefined),
        customFixedOrientationListXML: xmlFormat.objectToXML(embeddedStore.customConfigFixedOrientationList, 'package', undefined),
        settingConfigXML: xmlFormat.objectToXML(embeddedStore.embeddedSettingConfig, 'setting', 'setting_rule'),
        switchAction: {
          name: row.name,
          action: ['embedded', 'fullScreen'].includes(updateEmbeddedAppRes.settingMode) ? 'enable' : 'disable'
        }
      }))
      if (submitUpdateEmbeddedAppErr) {
        modal.create({
          title: '应用更新失败',
          type: 'error',
          preset: 'dialog',
          content: () => (<p>发生异常错误，更新失败了QwQ，该功能尚在测试阶段，尚不稳定，出现异常请及时反馈~</p>)
        })
        updateEmbeddedAppRes.loadingCallback && updateEmbeddedAppRes.loadingCallback()
      } else {
        modal.create({
          title: '应用更新成功',
          type: 'success',
          preset: 'dialog',
          content: () => (
            <p>好耶w， <span class="font-bold text-gray-600">{row.name}</span> 的应用配置更新成功了OwO~如果应用更新后的规则不生效，可以尝试重启平板并且在 <span class="font-bold text-gray-600">平板专区-平行窗口</span> 内 <span class="font-bold text-gray-600">{['embedded', 'fullScreen'].includes(updateEmbeddedAppRes.settingMode) ? '打开' : '关闭'}</span> 该应用的开关再做尝试~</p>
          )
        })
        embeddedStore.updateMergeRuleList()
        updateEmbeddedAppRes.loadingCallback && updateEmbeddedAppRes.loadingCallback()
        updateEmbeddedAppRes.closeCallback && updateEmbeddedAppRes.closeCallback()
      }

    }
  }
}

const handleRuleMode = (row: EmbeddedMergeRuleItem, index: number, ruleMode: EmbeddedMergeRuleItem["ruleMode"]) => {
  if (deviceStore.deviceCharacteristics !== 'tablet') {
    modal.create({
      title: '不兼容说明',
      type: 'warning',
      preset: 'dialog',
      content: () => (<p>该功能仅兼容平板设备，暂时不兼容折叠屏设备，请等待后续更新情况！</p>)
    })
    return;
  }
  if (deviceStore.androidTargetSdk && ![32, 33, 34].includes(deviceStore.androidTargetSdk)) {
    modal.create({
      title: '不兼容说明',
      type: 'warning',
      preset: 'dialog',
      content: () => (<p>该功能尚未对 Android 11 或 Android 15+ 做兼容，请等待后续更新情况！</p>)
    })
    return;
  }
  if (ruleMode === 'module') {
    modal.create({
      title: '模块规则说明',
      type: 'warning',
      preset: 'dialog',
      content: () => (<p>模块已对 <span class="font-bold text-gray-600">{row.name}</span> 配置了合适的适配规则，且不可被移除，仅有自定义规则可以被移除哦~</p>)
    })
  }

  if (ruleMode === 'custom') {
    const cleanCustomModal = modal.create({
      title: '想清除自定义规则吗？',
      type: 'warning',
      preset: 'dialog',
      content: () => (<p>清除自定义规则后，你对 <span class="font-bold text-gray-600">{row.name}</span> 所做的所有自定义配置将丢失，如果该应用同时还存在 <span class="font-bold text-gray-600">模块规则</span> ，将会还原回模块自身的适配规则。确定要继续吗？</p>),
      positiveText: '确定清除',
      negativeText: '我再想想',
      onPositiveClick: async () => {
        cleanCustomModal.loading = true
        if (embeddedStore.customConfigEmbeddedRulesList[row.name]) {
          delete embeddedStore.customConfigEmbeddedRulesList[row.name]
        }
        if (embeddedStore.customConfigFixedOrientationList[row.name]) {
          delete embeddedStore.customConfigFixedOrientationList[row.name]
        }
        const [submitUpdateEmbeddedAppErr, submitUpdateEmbeddedAppRes] = await $to(ksuApi.updateEmbeddedApp({
          customEmbeddedRulesListXML: xmlFormat.objectToXML(embeddedStore.customConfigEmbeddedRulesList, 'package', undefined),
          customFixedOrientationListXML: xmlFormat.objectToXML(embeddedStore.customConfigFixedOrientationList, 'package', undefined),
          settingConfigXML: xmlFormat.objectToXML(embeddedStore.embeddedSettingConfig, 'setting', 'setting_rule'),
          switchAction: {
            name: row.name,
            action: embeddedStore.sourceEmbeddedRulesList[row.name] ? 'enable' : 'disable'
          }
        }))
        if (submitUpdateEmbeddedAppErr) {
          modal.create({
            title: '清除自定义规则失败',
            type: 'error',
            preset: 'dialog',
            content: () => (<p>发生异常错误，更新失败了QwQ，该功能尚在测试阶段，尚不稳定，出现异常请及时反馈~</p>)
          })
          cleanCustomModal.loading = false
        } else {
          modal.create({
            title: '清除自定义规则成功',
            type: 'success',
            preset: 'dialog',
            content: () => (<p>好耶w，清除自定义规则成功了OwO~如果应用更新后的规则不生效，可以尝试重启平板再试试~</p>)
          })
          cleanCustomModal.loading = false
          embeddedStore.updateMergeRuleList()
        }
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
              if (deviceStore.deviceCharacteristics !== 'tablet') {
                modal.create({
                  title: '不兼容说明',
                  type: 'warning',
                  preset: 'dialog',
                  content: () => (<p>该功能仅兼容平板设备，暂时不兼容折叠屏设备，请等待后续更新情况！</p>)
                })
                return;
              }
              if (deviceStore.androidTargetSdk && ![32, 33, 34].includes(deviceStore.androidTargetSdk)) {
                modal.create({
                  title: '不兼容说明',
                  type: 'warning',
                  preset: 'dialog',
                  content: () => (<p>该功能尚未对 Android 11 或 Android 15+ 做兼容，请等待后续更新情况！</p>)
                })
                return;
              }
              openUpdateEmbeddedApp(row, index)
            }
          },
          fullScreen: {
            type: 'info',
            name: '全屏',
            onClick(row: EmbeddedMergeRuleItem, index: number) {
              if (deviceStore.deviceCharacteristics !== 'tablet') {
                modal.create({
                  title: '不兼容说明',
                  type: 'warning',
                  preset: 'dialog',
                  content: () => (<p>该功能仅兼容平板设备，暂时不兼容折叠屏设备，请等待后续更新情况！</p>)
                })
                return;
              }
              if (deviceStore.androidTargetSdk && ![32, 33, 34].includes(deviceStore.androidTargetSdk)) {
                modal.create({
                  title: '不兼容说明',
                  type: 'warning',
                  preset: 'dialog',
                  content: () => (<p>该功能尚未对 Android 11 或 Android 15+ 做兼容，请等待后续更新情况！</p>)
                })
                return;
              }
              openUpdateEmbeddedApp(row, index)
            }
          },
          fixedOrientation: {
            type: 'warning',
            name: '居中布局',
            onClick(row: EmbeddedMergeRuleItem, index: number) {
              if (deviceStore.deviceCharacteristics !== 'tablet') {
                modal.create({
                  title: '不兼容说明',
                  type: 'warning',
                  preset: 'dialog',
                  content: () => (<p>该功能仅兼容平板设备，暂时不兼容折叠屏设备，请等待后续更新情况！</p>)
                })
                return;
              }
              if (deviceStore.androidTargetSdk && ![32, 33, 34].includes(deviceStore.androidTargetSdk)) {
                modal.create({
                  title: '不兼容说明',
                  type: 'warning',
                  preset: 'dialog',
                  content: () => (<p>该功能尚未对 Android 11 或 Android 15+ 做兼容，请等待后续更新情况！</p>)
                })
                return;
              }
              openUpdateEmbeddedApp(row, index)
            }
          },
          disabled: {
            type: 'error',
            name: '原始布局',
            onClick(row: EmbeddedMergeRuleItem, index: number) {
              if (deviceStore.deviceCharacteristics !== 'tablet') {
                modal.create({
                  title: '不兼容说明',
                  type: 'warning',
                  preset: 'dialog',
                  content: () => (<p>该功能仅兼容平板设备，暂时不兼容折叠屏设备，请等待后续更新情况！</p>)
                })
                return;
              }
              if (deviceStore.androidTargetSdk && ![32, 33, 34].includes(deviceStore.androidTargetSdk)) {
                modal.create({
                  title: '不兼容说明',
                  type: 'warning',
                  preset: 'dialog',
                  content: () => (<p>该功能尚未对 Android 11 或 Android 15+ 做兼容，请等待后续更新情况！</p>)
                })
                return;
              }
              openUpdateEmbeddedApp(row, index)
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
  <main class="mb-10">
    <div class="mt-5">
      <div class="px-4 sm:px-0 mb-5">
        <h3 class="text-base font-semibold leading-7 text-gray-900">应用横屏配置</h3>
        <p class="mt-1 max-w-2xl text-sm leading-6 text-gray-500">在这里可以快速管理平板在横屏应用下的配置</p>
      </div>
    </div>
    <n-card title="操作栏" size="small">
      <n-button class="mb-3 mr-3" type="info" :loading="embeddedStore.loading" @click="openAddEmbeddedApp">
        添加应用
      </n-button>
      <n-button class="mb-3 mr-3" type="success" :loading="embeddedStore.loading" @click="() => reloadPage()">
        刷新当前数据
      </n-button>
      <!-- <n-button class="mb-3 mr-3" type="success" :loading="embeddedStore.loading" @click="() => testBtn()">
        测试按钮
      </n-button> -->
      <n-input-group>
        <n-input size="large" clearable v-model:value="embeddedStore.searchKeyWord" ref="searchKeyWordInput"
          placeholder="搜索应用包名" autosize style="min-width: 80%" />
        <n-button size="large" type="primary" @click="() => {
          searchKeyWordInput?.blur()
        }">
          确定
        </n-button>
      </n-input-group>
    </n-card>
    <n-data-table :loading="embeddedStore.loading" :columns="columns" :data="embeddedStore.filterMergeRuleList"
      :pagination="pagination" />
  </main>
  <ErrorModal v-model="showErrorModal" :errorLogging="embeddedStore.errorLogging" />
  <EmbeddedAppDrawer ref="addEmbeddedApp" type="add" title="添加应用" />
  <EmbeddedAppDrawer ref="updateEmbeddedApp" type="update" title="更新应用" />
</template>
