<script setup lang="tsx">
import { ref, reactive, watch, type CSSProperties } from 'vue'
import { useAutoUIStore } from '@/stores/autoui';
import * as ksuApi from '@/apis/ksuApi'
import { useDeviceStore } from '@/stores/device';
import * as autoUIFun from '@/utils/autoUIFun';
import { NButton, createDiscreteApi, type DataTableColumns, type NInput } from 'naive-ui'
import type AutoUIMergeRuleItem from '@/types/AutoUIMergeRuleItem';
import { useRouter, useRoute } from 'vue-router';
import * as validateFun from '@/utils/validateFun';
type SearchKeyWordInputInstance = InstanceType<typeof NInput>;
const searchKeyWordInput = ref<SearchKeyWordInputInstance | null>(null);
const { message, modal } = createDiscreteApi(['message', 'modal'])
const columns = createColumns()
const deviceStore = useDeviceStore()
const autoUIStore = useAutoUIStore()
const router = useRouter();
const route = useRoute();

const openAddAutoUIApp = () => {
  message.warning('还在开发中，别点啦QwQ')
}
const openUpdateAutoUIApp = () => {
  message.warning('还在开发中，别点啦QwQ')
}

const reloadPage = async () => {
  await autoUIStore.initDefault()
};
const handleRuleMode = (row: AutoUIMergeRuleItem, index: number, ruleMode: AutoUIMergeRuleItem["ruleMode"]) => {
  message.warning('还在开发中，别点啦QwQ')
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
          <n-button size="small" strong dashed type={modeMap[row.settingMode].type} color={modeMap[row.settingMode].color} onClick={() => {   message.warning('还在开发中，别点啦QwQ') }}>{modeMap[row.settingMode].name}</n-button>
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
          <n-switch railStyle={railStyle} onClick={() => { message.warning('还在开发中，别点啦QwQ') }} size="medium" value={
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
      <n-button class="mb-3 mr-3" type="info" :loading="deviceStore.loading || autoUIStore.loading" @click="openAddAutoUIApp">
        添加应用
      </n-button>
      <n-button class="mb-3 mr-3" type="success" :loading="deviceStore.loading || autoUIStore.loading" @click="() => reloadPage()">
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
    <n-data-table :loading="deviceStore.loading || autoUIStore.loading" :columns="columns" :data="autoUIStore.filterMergeRuleList"
      :pagination="pagination" />
  </main>
</template>