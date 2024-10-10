<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import { ref, h, onMounted } from 'vue'
import $to from 'await-to-js'
// @ts-ignore
import { exec } from 'kernelsu';
import { NButton, createDiscreteApi, type DataTableColumns, type MessageApi } from 'naive-ui'
import * as ksuApi from '@/apis/ksuApi'
import { useDeviceStore } from '@/stores/device';
import * as xmlFormat from '@/utils/xmlFormat';
import axios from 'axios';

interface Song {
  no: number
  title: string
  length: string
}

const deviceStore = useDeviceStore()
const { message } = createDiscreteApi(['message'])

const data: Song[] = [
  { no: 3, title: 'Wonderwall', length: '4:18' },
  { no: 4, title: 'Don\'t Look Back in Anger', length: '4:48' },
  { no: 12, title: 'Champagne Supernova', length: '7:27' }
]
const columns = createColumns({
  play(row: Song) {
    message.info(`Play ${row.title}`)
  }
})
const activeDrawer = ref(false)
const pagination = false as const
const sourceEmbeddedRulesList = ref<string>()

onMounted(async () => {
  // // 测试获取XML文件
  try {
    const response = await axios.get('/data/embedded_rules_list.xml');
    const xmlText = response.data; // 这是 XML 内容
    console.log(xmlFormat.parseXMLToArray(xmlText), 'array')
    console.log(xmlFormat.parseXMLToObject(xmlText), 'object')

    const data = {
      package1: {
        isShowDivider: true,
        supportFullSize: false,
      },
      package2: {
        isShowDivider: false,
        supportFullSize: true,
      },
    };

    // 调用函数并输出结果
    const xmlWithParent = xmlFormat.objectToXML(data, 'packageRules', 'package');
    console.log(xmlWithParent);

    const xmlWithoutParent = xmlFormat.objectToXML(data, undefined, 'package');
    console.log(xmlWithoutParent);
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
  play: (row: Song) => void
}): DataTableColumns<Song> {
  return [
    {
      title: 'No',
      key: 'no'
    },
    {
      title: 'Title',
      key: 'title'
    },
    {
      title: 'Length',
      key: 'length'
    },
    {
      title: 'Action',
      key: 'actions',
      render(row) {
        return h(
          NButton,
          {
            strong: true,
            tertiary: true,
            size: 'small',
            onClick: () => play(row)
          },
          { default: () => 'Play' }
        )
      }
    }
  ]
}
</script>

<template>
  <main>
    <n-data-table :columns="columns" :data="data" :bordered="false" />
    <div>
      <p class="text-blue-600 text-2xl text-center text-indigo-600">完美横屏应用计划 Web UI 管理后台正在建设中，敬请期待~</p>
      <div class="text-center mt-10">
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
          <p>{{ sourceEmbeddedRulesList }}</p>
        </n-drawer-content>
      </n-drawer>
    </div>
  </main>
</template>
