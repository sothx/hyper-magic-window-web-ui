<script setup lang="tsx">
  import { useDeviceStore } from '@/stores/device';
  import { ref, type CSSProperties } from 'vue'
  import * as xmlFormat from '@/utils/xmlFormat';
  import { createDiscreteApi } from 'naive-ui'
  import { useGameMode } from '@/hooks/useGameMode';
  import * as ksuApi from "@/apis/ksuApi";
  import $to from 'await-to-js'
  import { useEmbeddedStore } from '@/stores/embedded';
  const deviceStore = useDeviceStore()
  const embeddedStore = useEmbeddedStore()
  const { message, modal } = createDiscreteApi(['message', 'modal'])
  const gameMode = useGameMode();
  const handleSmartFocusIOChange = (value: boolean) => {
    message.info('功能尚未上线，无任何实际效果，请等待后续更新！')
  }
  const switchPatchModeLoading = ref<boolean>(false);
 const changeShowRotationSuggestions = async (value: boolean) => {
    const [setRotationSuggestionsErr] = await $to(ksuApi.setRotationSuggestions(value ? 1 : 0))
    if (setRotationSuggestionsErr) {
      modal.create({
        title: '操作失败',
        type: 'error',
        preset: 'dialog',
        content: () => (<p>无法 { value ? '开启' : '关闭' } 旋转建议提示按钮，详情请查看日志记录~</p>),
        negativeText: '确定'
      })
      return;
    }
    deviceStore.showRotationSuggestions = value;
  }
  const changePatchMode = async (value: boolean) => {
    switchPatchModeLoading.value = false;
    const [negativeRes, positiveRes] = await $to(new Promise((resolve, reject) => {
      modal.create({
        title: value ? '想切换为定制模式吗？' : '想切换为完整模式吗？',
        type: 'info',
        preset: 'dialog',
        content: () => (<div>
          {
            value && (<p>切换为 <span class="font-bold text-gray-600">定制模式</span> 后，模块会以您设备的整体应用情况 <span class="font-bold text-gray-600">修剪模块应用适配列表</span> ，以解决老机型由于系统优化不佳而导致的卡顿、掉帧等问题，后续每次更新模块或者安装新的应用后，建议前往 <span class="font-bold text-gray-600">应用横屏配置</span> 重新 <span class="font-bold text-gray-600">生成定制应用数据</span> ，确定要继续吗？</p>)
          }
          {
            !value && (<p>切换为 <span class="font-bold text-gray-600">完整模式</span> 后，可以获得模块提供的大量应用适配，同时可能会导致部分老机型由于系统优化不佳而导致的卡顿、掉帧等问题，确定要继续吗？</p>)
          }
        </div>),
        positiveText: '确定继续',
        negativeText: '我再想想',
        onPositiveClick: () => {
          resolve('positiveClick')
        },
        onNegativeClick: () => {
          reject('negativeClick')
          switchPatchModeLoading.value = false
        },
        onClose: () => {
          switchPatchModeLoading.value = false
        },
        onMaskClick: () => {
          switchPatchModeLoading.value = false
        }
      })
    }))
    if (positiveRes) {
      const [removeIsPatchModeErr] = await $to(ksuApi.removeIsPatchMode())
      if (removeIsPatchModeErr) {
        modal.create({
          title: '操作失败',
          type: 'error',
          preset: 'dialog',
          content: () => (<p>无法移除定制模式的配置项，详情请查看日志记录~</p>),
          negativeText: '确定'
        })
        switchPatchModeLoading.value = false;
        return;
      }
      if (value) {
        const [addIsPatchModeErr] = await $to(ksuApi.addIsPatchMode())
        if (addIsPatchModeErr) {
          modal.create({
            title: '操作失败',
            type: 'error',
            preset: 'dialog',
            content: () => (<p>无法切换为定制模式，详情请查看日志记录~</p>),
            negativeText: '确定'
          })
          switchPatchModeLoading.value = false;
          return;
        }
        embeddedStore.isPatchMode = true;
      } else {
        switchPatchModeLoading.value = false;
        embeddedStore.isPatchMode = false;
      }
      const [submitUpdateEmbeddedAppErr, submitUpdateEmbeddedAppRes] = await $to(ksuApi.updateEmbeddedApp({
        isPatchMode: embeddedStore.isPatchMode,
        patchEmbeddedRulesListXML: xmlFormat.objectToXML(embeddedStore.patchEmbeddedRulesList, 'package', 'package_config'),
        patchFixedOrientationListXML: xmlFormat.objectToXML(embeddedStore.patchFixedOrientationList, 'package', 'package_config'),
        customEmbeddedRulesListXML: xmlFormat.objectToXML(embeddedStore.customConfigEmbeddedRulesList, 'package', undefined),
        customFixedOrientationListXML: xmlFormat.objectToXML(embeddedStore.customConfigFixedOrientationList, 'package', undefined),
        settingConfigXML: xmlFormat.objectToXML(embeddedStore.embeddedSettingConfig, 'setting', 'setting_rule'),
      }))
      if (submitUpdateEmbeddedAppErr) {
        modal.create({
          title: '操作失败',
          type: 'error',
          preset: 'dialog',
          content: () => (<p>发生异常错误，更新失败了QwQ，该功能尚在测试阶段，尚不稳定，出现异常请及时反馈~</p>)
        })
        embeddedStore.isPatchMode = !embeddedStore.isPatchMode;
        switchPatchModeLoading.value = false;
      } else {
        modal.create({
          title: '操作成功',
          type: 'success',
          preset: 'dialog',
          content: () => (
            <div>
              {
                value && (<p>好耶w，已成功切换为 <span class="font-bold text-gray-600">定制模式</span> ，模块已根据您设备当前的整体应用情况 <span class="font-bold text-gray-600">修剪模块应用适配列表</span> ，以解决老机型由于系统优化不佳而导致的卡顿、掉帧等问题，建议每次更新模块或者安装新的应用后，均需要在前往 <span class="font-bold text-gray-600">应用横屏配置</span> 界面重新生成 <span class="font-bold text-gray-600">生成定制应用数据</span> 。</p>)
              }
              {
                !value && (<p>好耶w，已成功切换为 <span class="font-bold text-gray-600">完整模式</span> ，可以获得模块提供的大量应用适配，同时可能会导致部分老机型由于系统优化不佳而导致的卡顿、掉帧等问题。</p>)
              }
            </div>
          ),
          negativeText: '确定'
        })
        embeddedStore.lastCheckPatchModeTime = '';
        embeddedStore.lastInstalledAndroidApplicationPackageNameList = [];
        switchPatchModeLoading.value = false;
        embeddedStore.updateMergeRuleList()
      }
    }
  }
  const changeGameMode = async (value: boolean) => {
    const [negativeRes, positiveRes] = await $to(new Promise((resolve, reject) => {
      modal.create({
        title: value ? '想开启游戏显示布局吗？' : '想关闭游戏显示布局吗？',
        type: 'info',
        preset: 'dialog',
        content: () => (<div>
          <p>{value ? '开启' : '关闭'} <span class="font-bold text-gray-600">游戏显示布局</span> 后需要设备重启才会生效~</p>
          {value && deviceStore.deviceCharacteristics === 'tablet' && deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && (<p>从Hyper OS 2.0开始，小米平板需要搭配配套的 <span class="font-bold text-gray-600">修改版平板/手机管家</span> 才能使用游戏显示布局，详情请前往模块首页了解~</p>)}
          <p>是否立即重启？</p>
        </div>),
        positiveText: '立即重启',
        negativeText: '稍后重启',
        onPositiveClick: () => {
          resolve('positiveClick')
        },
        onNegativeClick: () => {
          reject('negativeClick')
        }
      })
    }))

    const [deleteGameModeErr] = await $to(ksuApi.deleteGameMode())
    if (deleteGameModeErr) {
      modal.create({
        title: '操作失败',
        type: 'error',
        preset: 'dialog',
        content: () => (<p>无法修改模块配置文件，详情请查看日志记录~</p>),
        negativeText: '确定'
      })
      return;
    }
    if (value) {
      const [addGameModeErr] = await $to(ksuApi.addGameMode())
      if (addGameModeErr) {
        modal.create({
          title: '操作失败',
          type: 'error',
          preset: 'dialog',
          content: () => (<p>无法修改模块配置文件，详情请查看日志记录~</p>),
          negativeText: '确定'
        })
        return;
      }
    }
    if (positiveRes) {
      const [rebootDeviceErr] = await $to(ksuApi.rebootDevice())
      if (rebootDeviceErr) {
        modal.create({
          title: '操作失败',
          type: 'error',
          preset: 'dialog',
          content: () => (<p>无法重启设备，详情请查看日志记录~</p>),
          negativeText: '确定'
        })
        return;
      }
    }
    if (negativeRes) {
      modal.create({
        title: '操作成功',
        type: 'success',
        preset: 'dialog',
        content: () => (<p>修改模块配置成功，请手动重启设备~</p>),
        negativeText: '确定'
      })
      return;
    }

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
  <div class="setting">
    <div class="mt-5">
      <div class="px-4 sm:px-0">
        <h3 class="text-base font-semibold leading-7 text-gray-900">模块设置</h3>
        <p class="mt-1 max-w-2xl text-sm leading-6 text-gray-500">在这里可以快速了解模块当前的运行数据</p>
      </div>
      
      <div class="mt-6 border-t border-gray-100">
        <dl class="divide-y divide-gray-100">
          <div v-if="deviceStore.deviceName" class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">设备名称</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ deviceStore.deviceName || '' }}</dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">ROOT管理器</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ deviceStore.currentRootManager ||
              '获取失败' }}
            </dd>
          </div>
          <div v-if="deviceStore.currentRootManager === 'KernelSU'"
            class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">KernelSU 版本</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{
              deviceStore.rootManagerInfo.KSU_VER || '获取失败' }}
            </dd>
          </div>
          <div v-if="deviceStore.currentRootManager === 'KernelSU'"
            class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">KernelSU 用户空间版本号 </dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{
              deviceStore.rootManagerInfo.KSU_VER_CODE || '获取失败' }}
            </dd>
          </div>
          <div v-if="deviceStore.currentRootManager === 'KernelSU'"
            class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">KernelSU 内核空间版本号 </dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{
              deviceStore.rootManagerInfo.KSU_KERNEL_VER_CODE || '获取失败' }}
            </dd>
          </div>
          <div v-if="deviceStore.currentRootManager === 'APatch'"
            class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">APatch 版本名</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{
              deviceStore.rootManagerInfo.APATCH_VER || '获取失败' }}
            </dd>
          </div>
          <div v-if="deviceStore.currentRootManager === 'APatch'"
            class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">APatch 版本号</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{
              deviceStore.rootManagerInfo.APATCH_VER_CODE || '获取失败' }}
            </dd>
          </div>
          <div v-if="deviceStore.currentRootManager === 'Magisk'"
            class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">Magisk 版本</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{
              deviceStore.rootManagerInfo.MAGISK_VER || '获取失败' }}
            </dd>
          </div>
          <div v-if="deviceStore.currentRootManager === 'Magisk'"
            class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">Magisk 版本号</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{
              deviceStore.rootManagerInfo.MAGISK_VER_CODE || '获取失败' }}
            </dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">模块ID</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ deviceStore.moduleID || '获取失败' }}
            </dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">模块路径</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ deviceStore.moduleDir || '获取失败' }}
            </dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">模块工作模式</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0"> <n-switch
                @update:value="(value: boolean) => changePatchMode(value)" :rail-style="railStyle"
                :value="embeddedStore.isPatchMode" :loading="switchPatchModeLoading"
                :disabled="deviceStore.androidTargetSdk && deviceStore.androidTargetSdk < 32">
                <template #checked>
                  定制模式
                </template>
                <template #unchecked>
                  完整模式
                </template>
              </n-switch></dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">游戏显示布局</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0"> <n-switch
                @update:value="(value: boolean) => changeGameMode(value)" :value="gameMode.isSupportGameMode"
                :disabled="deviceStore.deviceCharacteristics !== 'tablet' || deviceStore.androidTargetSdk && deviceStore.androidTargetSdk < 32">
                <template #checked>
                  已开启游戏显示布局
                </template>
                <template #unchecked>
                  {{ deviceStore.androidTargetSdk && deviceStore.androidTargetSdk < 32 ? '不支持游戏显示布局' : '未开启游戏显示布局' }}
                    </template>
              </n-switch></dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">旋转建议提示按钮</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0"> <n-switch
                @update:value="(value: boolean) => changeShowRotationSuggestions(value)" :rail-style="railStyle"
                :value="deviceStore.showRotationSuggestions">
                <template #checked>
                  已启用旋转建议提示按钮
                </template>
                <template #unchecked>
                  已关闭旋转建议提示按钮
                </template>
              </n-switch></dd>
          </div>
          <div v-if="deviceStore.MIOSVersion" class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">Xiaomi Hyper OS 版本号</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ deviceStore.MIOSVersion ? `Xiaomi
              Hyper OS ${deviceStore.MIOSVersion}` : '当前为MIUI' }}</dd>
          </div>
          <div v-if="deviceStore.systemVersion" class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">系统版本</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ deviceStore.systemVersion || '' }}</dd>
          </div>
          <div v-if="deviceStore.systemPreVersion" class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">上次更新的系统版本</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ deviceStore.systemPreVersion || '' }}</dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">Android Target Version</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ deviceStore.androidTargetSdk ||
              '非Android设备环境' }}
            </dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">设备类型</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ deviceStore.deviceCharacteristics
              === 'tablet' ? '平板(Pad)' : '折叠屏(Fold)' }}</dd>
          </div>
          <div v-if="deviceStore.deviceSocModel" class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">设备Soc类型</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ deviceStore.deviceSocModel ||
              '获取失败' }}</dd>
          </div>
          <div v-if="deviceStore.deviceSocName" class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm font-medium leading-6 text-gray-900">设备Soc名称</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ deviceStore.deviceSocName ||
              '获取失败' }}</dd>
          </div>
          <!-- <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
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
          </div> -->
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