<script setup lang="tsx">
  import { ref, reactive, watch, type CSSProperties } from 'vue'
  import { useAutoUIStore } from '@/stores/autoui';
  import * as ksuApi from '@/apis/ksuApi'
  import * as xmlFormat from '@/utils/xmlFormat';
  import { useDeviceStore } from '@/stores/device';
  import $to from 'await-to-js'
  import * as autoUIFun from '@/utils/autoUIFun';
  import { NButton, createDiscreteApi, type DataTableColumns, type NInput } from 'naive-ui'
  import type AutoUIMergeRuleItem from '@/types/AutoUIMergeRuleItem';
  import { useRouter, useRoute } from 'vue-router';
  import { useAutoUI } from '@/hooks/useAutoUI';
  import * as validateFun from '@/utils/validateFun';
  import AutoUIAppDrawer from '@/components/AutoUIAppDrawer.vue';
  type SearchKeyWordInputInstance = InstanceType<typeof NInput>;
  type AutoUIAppDrawerInstance = InstanceType<typeof AutoUIAppDrawer>;
  const searchKeyWordInput = ref<SearchKeyWordInputInstance | null>(null);
  const { message, modal } = createDiscreteApi(['message', 'modal'])
  const columns = createColumns()
  const deviceStore = useDeviceStore()
  const autoUIStore = useAutoUIStore()
  const autoUI = useAutoUI()
  const addAutoUIApp = ref<AutoUIAppDrawerInstance | null>(null);
  const updateAutoUIApp = ref<AutoUIAppDrawerInstance | null>(null);
  const router = useRouter();
  const route = useRoute();

  const reloadPage = async () => {
    await autoUIStore.initDefault()
  };
  const handleRuleMode = (row: AutoUIMergeRuleItem, index: number, ruleMode: AutoUIMergeRuleItem["ruleMode"]) => {
    if (deviceStore.androidTargetSdk && deviceStore.androidTargetSdk < 33) {
      modal.create({
        title: '不兼容说明',
        type: 'warning',
        preset: 'dialog',
        content: () => (<p>应用布局优化不支持低于 Android 13 的设备！</p>)
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
          if (autoUIStore.customConfigAutoUIList[row.name]) {
            delete autoUIStore.customConfigAutoUIList[row.name]
          }
          if (autoUIStore.autoUISettingConfig[row.name]) {
            delete autoUIStore.autoUISettingConfig[row.name]
          }
          const [submitUpdateAutoUIAppErr, submitUpdateAutoUIAppRes] = await $to(ksuApi.updateAutoUIApp({
            customAutoUIListXML: xmlFormat.objectToXML(autoUIStore.customConfigAutoUIList, 'package', undefined),
            settingConfigXML: xmlFormat.objectToXML(autoUIStore.autoUISettingConfig, 'setting', 'setting_config'),
          }))
          if (submitUpdateAutoUIAppErr) {
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
            autoUIStore.updateMergeRuleList()
          }
        }
      })
    }
  }

  const handleSwitchAction = async (row: AutoUIMergeRuleItem, index: number, value: boolean) => {
    if (deviceStore.androidTargetSdk && deviceStore.androidTargetSdk < 33) {
      modal.create({
        title: '不兼容说明',
        type: 'warning',
        preset: 'dialog',
        content: () => (<p>应用布局优化不支持低于 Android 13 的设备！</p>)
      })
      return;
    }
    const switchCustomModal = modal.create({
        title: `想${value ? '开启': '关闭'}该应用的应用布局优化吗？`,
        type: 'warning',
        preset: 'dialog',
        content: () => (<p>即将{value ? '开启': '关闭'}<span class="font-bold text-gray-600">{row.name}</span> 的应用布局优化适配规则。确定要继续吗？</p>),
        positiveText: '确定',
        negativeText: '我再想想',
        onPositiveClick: async () => {
          switchCustomModal.loading = true
          if (autoUIStore.autoUISettingConfig[row.name]) {
            autoUIStore.autoUISettingConfig[row.name].enable = value
          } else {
            autoUIStore.autoUISettingConfig[row.name] = {
              name: row.name,
              enable: value
            }
          }
          const [submitUpdateAutoUIAppErr, submitUpdateAutoUIAppRes] = await $to(ksuApi.updateAutoUIApp({
            customAutoUIListXML: xmlFormat.objectToXML(autoUIStore.customConfigAutoUIList, 'package', undefined),
            settingConfigXML: xmlFormat.objectToXML(autoUIStore.autoUISettingConfig, 'setting', 'setting_config'),
            reloadRuleAction: {
              name: row.name,
              action: value ? 'enable' : 'disable'
            }
          }))
          if (submitUpdateAutoUIAppErr) {
            modal.create({
              title: '操作失败',
              type: 'error',
              preset: 'dialog',
              content: () => (<p>发生异常错误，更新失败了QwQ，该功能尚在测试阶段，尚不稳定，出现异常请及时反馈~</p>)
            })
            switchCustomModal.loading = false
          } else {
            modal.create({
              title: '操作成功',
              type: 'success',
              preset: 'dialog',
              content: () => (<p>好耶w，操作成功了OwO~如果应用更新后的规则不生效，可以尝试重启平板再试试~</p>)
            })
            switchCustomModal.loading = false
            autoUIStore.updateMergeRuleList()
          }
        }
      })
  }

  const openAddDrawer = async () => {
    if (deviceStore.androidTargetSdk && deviceStore.androidTargetSdk < 33) {
      modal.create({
        title: '不兼容说明',
        type: 'warning',
        preset: 'dialog',
        content: () => (<p>应用布局优化不支持低于 Android 13 的设备！</p>)
      })
      return;
    }
    if (addAutoUIApp.value) {
      const [addAutoUiAppCancel, addAutoUiAppRes] = await $to(addAutoUIApp.value.openDrawer())
      if (addAutoUiAppCancel) {
        console.log('操作取消:', addAutoUiAppCancel);
      } else {
        autoUIStore.customConfigAutoUIList[addAutoUiAppRes.name] = {
          name: addAutoUiAppRes.name,
          enable: true,
          ...(addAutoUiAppRes?.modePayload.skippedAppConfigChange) ? { skippedAppConfigChange: true } : {},
          ...(addAutoUiAppRes?.modePayload.optimizeWebView) ? { optimizeWebView: true } : {},
          ...(addAutoUiAppRes?.modePayload.hasOwnProperty('activityRule')) ? { activityRule: addAutoUiAppRes?.modePayload.activityRule } : {},
          ...(addAutoUiAppRes?.modePayload.hasOwnProperty('skippedActivityRule')) ? { skippedActivityRule: addAutoUiAppRes?.modePayload.skippedActivityRule } : {},
        }
        const [submitAddAutoUIAppErr, submitAddAutoUIAppRes] = await $to(ksuApi.updateAutoUIApp({
          customAutoUIListXML: xmlFormat.objectToXML(autoUIStore.customConfigAutoUIList, 'package', undefined),
          settingConfigXML: xmlFormat.objectToXML(autoUIStore.autoUISettingConfig, 'setting', 'setting_config'),
          reloadRuleAction: {
            name: addAutoUiAppRes.name,
            action: 'enable'
          }
        }))
        if (submitAddAutoUIAppErr) {
          modal.create({
            title: '应用添加失败',
            type: 'error',
            preset: 'dialog',
            content: () => (<p>发生异常错误，添加失败了QwQ，该功能尚在测试阶段，尚不稳定，出现异常请及时反馈~</p>)
          })
          addAutoUiAppRes.loadingCallback && addAutoUiAppRes.loadingCallback()
        } else {
          modal.create({
            title: '应用添加成功',
            type: 'success',
            preset: 'dialog',
            content: () => (
              <p>好耶w， <span class="font-bold text-gray-600">{addAutoUiAppRes.name}</span> 的应用配置添加成功了OwO~如果应用添加后的规则不生效，可以尝试重启平再做尝试~</p>
            )
          })
          autoUIStore.updateMergeRuleList()
          addAutoUiAppRes.loadingCallback && addAutoUiAppRes.loadingCallback()
          addAutoUiAppRes.closeCallback && addAutoUiAppRes.closeCallback()
        }
      }
    }
  }

  const openUpdateDrawer = async (row: AutoUIMergeRuleItem, index: number) => {
    if (deviceStore.androidTargetSdk && deviceStore.androidTargetSdk < 33) {
      modal.create({
        title: '不兼容说明',
        type: 'warning',
        preset: 'dialog',
        content: () => (<p>应用布局优化不支持低于 Android 13 的设备！</p>)
      })
      return;
    }
    if (updateAutoUIApp && updateAutoUIApp.value) {
      const [updateAutoUiAppCancel, updateAutoUiAppRes] = await $to(updateAutoUIApp.value.openDrawer(row))
      if (updateAutoUiAppCancel) {
        console.log('操作取消:', updateAutoUiAppCancel);
      } else {
        if (autoUIStore.customConfigAutoUIList[row.name]) {
          autoUIStore.customConfigAutoUIList[row.name].enable = true
          autoUIStore.customConfigAutoUIList[row.name].name = row.name
          if (updateAutoUiAppRes?.modePayload.hasOwnProperty('activityRule')) {
            autoUIStore.customConfigAutoUIList[row.name].activityRule = updateAutoUiAppRes?.modePayload.activityRule
          }
          if (updateAutoUiAppRes?.modePayload.hasOwnProperty('skippedActivityRule')) {
            autoUIStore.customConfigAutoUIList[row.name].skippedActivityRule = updateAutoUiAppRes?.modePayload.skippedActivityRule
          }
          if (updateAutoUiAppRes?.modePayload.hasOwnProperty('optimizeWebView')) {
            autoUIStore.customConfigAutoUIList[row.name].optimizeWebView = updateAutoUiAppRes?.modePayload.optimizeWebView
          }
          if (updateAutoUiAppRes?.modePayload.hasOwnProperty('skippedAppConfigChange')) {
            autoUIStore.customConfigAutoUIList[row.name].skippedAppConfigChange = updateAutoUiAppRes?.modePayload.skippedAppConfigChange
          }
        } else {
          autoUIStore.customConfigAutoUIList[row.name] = {
            name: row.name,
            enable: true,
            ...(updateAutoUiAppRes?.modePayload.skippedAppConfigChange) ? { skippedAppConfigChange: true } : {},
            ...(updateAutoUiAppRes?.modePayload.optimizeWebView) ? { optimizeWebView: true } : {},
            ...(updateAutoUiAppRes?.modePayload.hasOwnProperty('activityRule')) ? { activityRule: updateAutoUiAppRes?.modePayload.activityRule } : {},
            ...(updateAutoUiAppRes?.modePayload.hasOwnProperty('skippedActivityRule')) ? { skippedActivityRule: updateAutoUiAppRes?.modePayload.skippedActivityRule } : {},
          }
        }
        console.log('loadingCallback:', updateAutoUiAppRes.loadingCallback);
        const [submitUpdateAutoUIAppErr, submitUpdateAutoUIAppRes] = await $to(ksuApi.updateAutoUIApp({
          customAutoUIListXML: xmlFormat.objectToXML(autoUIStore.customConfigAutoUIList, 'package', undefined),
          settingConfigXML: xmlFormat.objectToXML(autoUIStore.autoUISettingConfig, 'setting', 'setting_config'),
          reloadRuleAction: {
            name: row.name,
            action: 'enable'
          }
        }))
        if (submitUpdateAutoUIAppErr) {
          modal.create({
            title: '应用更新失败',
            type: 'error',
            preset: 'dialog',
            content: () => (<p>发生异常错误，添加失败了QwQ，该功能尚在测试阶段，尚不稳定，出现异常请及时反馈~</p>)
          })
          updateAutoUiAppRes.loadingCallback && updateAutoUiAppRes.loadingCallback()
        } else {
          modal.create({
            title: '应用更新成功',
            type: 'success',
            preset: 'dialog',
            content: () => (
              <p>好耶w， <span class="font-bold text-gray-600">{row.name}</span> 的应用配置更新成功了OwO~如果应用更新后的规则不生效，可以尝试重启平再做尝试~</p>
            )
          })
          autoUIStore.updateMergeRuleList()
          updateAutoUiAppRes.loadingCallback && updateAutoUiAppRes.loadingCallback()
          updateAutoUiAppRes.closeCallback && updateAutoUiAppRes.closeCallback()
        }
      }
    }
  }

  const modeMap = reactive({
    UNDEFINED_VIEW_POLICY: {
      type: 'default',
      color: '',
      name: '空白规则',
    },
    VIEW_POLICY_DEFAULT: {
      type: 'success',
      color: '',
      name: '全局缩放',
      onClick(row: AutoUIMergeRuleItem, index: number) {

      }
    },
    VIEW_POLICY_STRETCH: {
      type: 'info',
      color: '',
      name: '全局拉伸',
      onClick(row: AutoUIMergeRuleItem, index: number) {

      }
    },
    VIEW_POLICY_AUTO_COLUMNS: {
      type: 'warning',
      color: '',
      name: '全局栅格',
      onClick(row: AutoUIMergeRuleItem, index: number) {

      }
    },
    VIEW_POLICY_FLOAT: {
      type: 'error',
      color: '',
      name: '全局浮动',
      onClick(row: AutoUIMergeRuleItem, index: number) {

      }
    },
    CUSTOM_VIEW_POLICY: {
      type: '',
      color: '#8a2be2',
      name: '精确适配',
      onClick(row: AutoUIMergeRuleItem, index: number) {

      }
    }
  })

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

  const railStyle = ({
    focused,
    checked
  }: {
    focused: boolean
    checked: boolean
  }) => {
    const style: CSSProperties = {}
    if (checked) {
      style.background = '#2080f0'
      if (focused) {
        style.boxShadow = '0 0 0 2px #2080f040'
      }
    }
    else {
      style.background = '#d03050'
      if (focused) {
        style.boxShadow = '0 0 0 2px #d0305040'
      }
    }
    return style
  }

  function createColumns(): DataTableColumns<AutoUIMergeRuleItem> {
    return [
      {
        title: '应用包名',
        minWidth: 200,
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
        title: 'WebView优化',
        minWidth: 110,
        key: 'isOptimizeWebView',
        render(row, index) {
          if (row.autoUIRule?.optimizeWebView) {
            return (
              <n-tag bordered={false} dashed type="success">已启用</n-tag>
            )
          }
          return (
            <n-tag bordered={false} dashed type="info">未启用</n-tag>
          )
        }
      },
      {
        title: '布局规则',
        key: 'settingMode',
        render(row, index) {
          return (
            <n-button size="small" strong dashed type={modeMap[row.settingMode].type} color={modeMap[row.settingMode].color} onClick={() => openUpdateDrawer(row, index)}>{modeMap[row.settingMode].name}</n-button>
          )
        }
      },
      {
        title: '操作',
        minWidth: 100,
        key: 'setting',
        render(row, index) {
          const slots = {
            checked: () => <span>开启</span>,
            unchecked: () => <span>关闭</span>,
          };
          const isOpen = (inputRow: AutoUIMergeRuleItem) => {
            return inputRow.settingRule?.enable || (inputRow.autoUIRule?.enable && inputRow.hasOwnProperty('settingRule'))
          }
          return (
            <n-switch railStyle={railStyle} onUpdateValue={(value:boolean) => handleSwitchAction(row,index,value)} size="medium" value={
              isOpen && isOpen(row)
            } v-slots={slots}>
            </n-switch>
          )
        }
      }
    ]
  }
</script>
<template>
  <main class="autoui-view mb-10">
    <n-watermark v-if="true" content="开发中，功能不可用" cross fullscreen :font-size="16" :line-height="16" :width="384"
      :height="384" :x-offset="12" :y-offset="60" :rotate="-15" :z-index="9999" />
    <div class="mt-5">
      <div class="px-4 sm:px-0 mb-5">
        <h3 class="text-base font-semibold leading-7 text-gray-900">应用布局优化</h3>
        <p class="mt-1 max-w-2xl text-sm leading-6 text-gray-500">在这里可以快速管理有关应用布局优化的配置</p>
      </div>
    </div>
    <n-card title="操作栏" size="small">
      <n-button class="mb-3 mr-3" type="info" :loading="deviceStore.loading || autoUIStore.loading"
        @click="openAddDrawer">
        添加应用
      </n-button>
      <n-button class="mb-3 mr-3" type="success" :loading="deviceStore.loading || autoUIStore.loading"
        @click="() => reloadPage()">
        刷新当前数据
      </n-button>
      <n-input-group>
        <n-input size="large" clearable v-model:value="autoUIStore.searchKeyWord" ref="searchKeyWordInput"
          placeholder="搜索应用包名" autosize style="min-width: 80%" />
        <n-button size="large" type="primary" @click="() => {
          searchKeyWordInput?.blur()
        }">
          确定
        </n-button>
      </n-input-group>
    </n-card>
    <n-data-table :loading="deviceStore.loading || autoUIStore.loading" :columns="columns"
      :data="autoUIStore.filterMergeRuleList" :pagination="pagination" />
    <AutoUIAppDrawer ref="addAutoUIApp" type="add" title="添加应用" />
    <AutoUIAppDrawer ref="updateAutoUIApp" type="update" title="更新应用" />
  </main>
</template>