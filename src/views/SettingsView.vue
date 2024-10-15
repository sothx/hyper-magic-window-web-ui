<script setup lang="ts">
import { useDeviceStore } from '@/stores/device';
import type { CSSProperties } from 'vue'
import { createDiscreteApi } from 'naive-ui'
const deviceStore = useDeviceStore()
const { message } = createDiscreteApi(['message'])
const handleSmartFocusIOChange = (value: boolean) => {
  message.info('功能尚未上线，无任何实际效果，请等待后续更新！')
}
const railStyle = ({
  focused,
  checked
}: {
  focused: boolean
  checked: boolean
}) => {
  const style: CSSProperties = {}
  if (checked) {
    style.background = '#d03050'
    if (focused) {
      style.boxShadow = '0 0 0 2px #d0305040'
    }
  }
  else {
    style.background = '#2080f0'
    if (focused) {
      style.boxShadow = '0 0 0 2px #2080f040'
    }
  }
  return style
}
</script>
<template>
  <n-watermark v-if="true" content="开发中，功能不可用" cross fullscreen :font-size="16" :line-height="16" :width="384"
    :height="384" :x-offset="12" :y-offset="60" :rotate="-15" :z-index="9999" />
  <div class="setting">
    <div class="mt-5">
      <div class="px-4 sm:px-0">
        <h3 class="text-base font-semibold leading-7 text-gray-900">模块设置</h3>
        <p class="mt-1 max-w-2xl text-sm leading-6 text-gray-500">在这里可以快速了解模块当前的运行数据</p>
      </div>
      <div class="mt-6 border-t border-gray-100">
        <dl class="divide-y divide-gray-100">
          <!-- <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">模块版本号</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">暂定</dd>
          </div> -->
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">设备类型</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ deviceStore.deviceCharacteristics
              === 'tablet' ? '平板' : '折叠屏' }}</dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">设备Soc类型</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ deviceStore.deviceSocModel ||
              '非Android设备环境' }}</dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">设备Soc名称</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ deviceStore.deviceSocName ||
              '非Android设备环境' }}</dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">Xiaomi Hyper OS 版本号</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ deviceStore.MIOSVersion ? `Xiaomi
              Hyper OS ${deviceStore.MIOSVersion}` : '当前为MIUI' + deviceStore.MIOSVersion }}</dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">Android Target Version</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ deviceStore.androidTargetSdk ||
              '非Android设备环境' }}
            </dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">游戏显示布局</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">启用(*Android 15+ 需额外搭配修改版手机/平板管家)</dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">智能IO调度</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              <n-switch :rail-style="railStyle" @update:value="handleSmartFocusIOChange" v-if="deviceStore.smartFocusIO"
                checked-value="on" unchecked-value="off">
                <template #checked>
                  已启用智能IO调度
                </template>
                <template #unchecked>
                  使用系统默认调度
                </template>
              </n-switch>
              <div v-else>设备不支持</div>
            </dd>
          </div>
          <!-- <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">Salary expectation</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">$120,000</dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">About</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">Fugiat ipsum ipsum deserunt culpa
              aute sint do nostrud anim incididunt cillum culpa consequat. Excepteur qui ipsum aliquip consequat sint.
              Sit id mollit nulla mollit nostrud in ea officia proident. Irure nostrud pariatur mollit ad adipisicing
              reprehenderit deserunt qui eu.</dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">Attachments</dt>
            <dd class="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <ul role="list" class="divide-y divide-gray-100 rounded-md border border-gray-200">
                <li class="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                  <div class="flex w-0 flex-1 items-center">
                    <svg class="h-5 w-5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor"
                      aria-hidden="true" data-slot="icon">
                      <path fill-rule="evenodd"
                        d="M15.621 4.379a3 3 0 0 0-4.242 0l-7 7a3 3 0 0 0 4.241 4.243h.001l.497-.5a.75.75 0 0 1 1.064 1.057l-.498.501-.002.002a4.5 4.5 0 0 1-6.364-6.364l7-7a4.5 4.5 0 0 1 6.368 6.36l-3.455 3.553A2.625 2.625 0 1 1 9.52 9.52l3.45-3.451a.75.75 0 1 1 1.061 1.06l-3.45 3.451a1.125 1.125 0 0 0 1.587 1.595l3.454-3.553a3 3 0 0 0 0-4.242Z"
                        clip-rule="evenodd" />
                    </svg>
                    <div class="ml-4 flex min-w-0 flex-1 gap-2">
                      <span class="truncate font-medium">resume_back_end_developer.pdf</span>
                      <span class="flex-shrink-0 text-gray-400">2.4mb</span>
                    </div>
                  </div>
                  <div class="ml-4 flex-shrink-0">
                    <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">Download</a>
                  </div>
                </li>
                <li class="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                  <div class="flex w-0 flex-1 items-center">
                    <svg class="h-5 w-5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor"
                      aria-hidden="true" data-slot="icon">
                      <path fill-rule="evenodd"
                        d="M15.621 4.379a3 3 0 0 0-4.242 0l-7 7a3 3 0 0 0 4.241 4.243h.001l.497-.5a.75.75 0 0 1 1.064 1.057l-.498.501-.002.002a4.5 4.5 0 0 1-6.364-6.364l7-7a4.5 4.5 0 0 1 6.368 6.36l-3.455 3.553A2.625 2.625 0 1 1 9.52 9.52l3.45-3.451a.75.75 0 1 1 1.061 1.06l-3.45 3.451a1.125 1.125 0 0 0 1.587 1.595l3.454-3.553a3 3 0 0 0 0-4.242Z"
                        clip-rule="evenodd" />
                    </svg>
                    <div class="ml-4 flex min-w-0 flex-1 gap-2">
                      <span class="truncate font-medium">coverletter_back_end_developer.pdf</span>
                      <span class="flex-shrink-0 text-gray-400">4.5mb</span>
                    </div>
                  </div>
                  <div class="ml-4 flex-shrink-0">
                    <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">Download</a>
                  </div>
                </li>
              </ul>
            </dd>
          </div> -->
        </dl>
      </div>
    </div>
  </div>
</template>

<style></style>