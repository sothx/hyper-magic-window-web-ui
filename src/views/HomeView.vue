<script setup lang="tsx">
import TheWelcome from '../components/TheWelcome.vue'
import { ref, h, onMounted, type VNode, type VNodeChild, reactive } from 'vue'
import type MergeRuleItem from "@/types/MergeRuleItem";
import $to from 'await-to-js'
// @ts-ignore
import { exec } from 'kernelsu';
import { NButton, createDiscreteApi, type DataTableColumns, type MessageApi } from 'naive-ui'
import * as ksuApi from '@/apis/ksuApi'
import { useDeviceStore } from '@/stores/device';
import * as xmlFormat from '@/utils/xmlFormat';
import axios from 'axios';
import { useEmbeddedStore } from '@/stores/embedded';

const deviceStore = useDeviceStore()
const embeddedStore = useEmbeddedStore()
const { message } = createDiscreteApi(['message'])
const columns = createColumns({
  play(row: MergeRuleItem) {
    message.info(`暂未开放`)
  }
})
const activeDrawer = ref(false)
const sourceEmbeddedRulesList = ref<string>()

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

onMounted(async () => {
  // // 测试获取XML文件
  try {
    const response = await axios.get('/data/origin/embedded_rules_list.xml');
    const xmlText = response.data; // 这是 XML 内容
    console.log(xmlFormat.parseXMLToArray(xmlText), 'array')
    console.log(xmlFormat.parseXMLToObject(xmlText), 'object')

    // data = embeddedStore.mergeRuleList;

    // // 调用函数并输出结果
    // const xmlWithParent = xmlFormat.objectToXML(data, 'packageRules', 'package');
    // console.log(xmlWithParent);

    // const xmlWithoutParent = xmlFormat.objectToXML(data, undefined, 'package');
    // console.log(xmlWithoutParent);
  } catch (error) {
    console.error('Error fetching XML data:', error);
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
            }
          },
          fullScreen: {
            type: 'info',
            name: '全屏',
            onClick(row: MergeRuleItem, index: number) {
              message.info('功能尚未开放')
            }
          },
          fixedOrientation: {
            type: 'warning',
            name: '居中布局',
            onClick(row: MergeRuleItem, index: number) {
              message.info('功能尚未开放')
            }
          },
          disabled: {
            type: 'error',
            name: '原始布局',
            onClick(row: MergeRuleItem, index: number) {
              message.info('功能尚未开放')
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
  <main>
    <div>
      <p class="text-blue-600 text-2xl text-center text-indigo-600">完美横屏应用计划 Web UI 管理后台正在开发中，敬请期待~</p>
      <div class="text-center mt-10 mb-10">
        <n-button @click="activeDrawer = true">
          这是一个测试用的抽屉~内容是小米的往年标语~
        </n-button>
      </div>
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
          <p>获取XML文件内容</p>
          <!-- <p>{{ embeddedStore.customConfigEmbeddedRulesList }}</p> -->
          <p>{{ embeddedStore.mergeRuleList }}</p>
        </n-drawer-content>
      </n-drawer>
    </div>
    <n-card title="操作栏" size="small">
      <n-button class="mt-10 mb-10" type="info">
        添加应用
      </n-button>
      <n-input class="ml-5" placeholder="搜索应用包名" autosize style="min-width: 80%" />
    </n-card>
    <n-data-table :columns="columns" :data="embeddedStore.mergeRuleList" :pagination="pagination" />
  </main>
</template>
