<script setup lang="ts">
import { ref } from 'vue';
import JsonEditorVue from 'json-editor-vue';
type ConfItem = Record<string, any> & { name: string };

const active = ref(false);
const jsonData = ref<ConfItem[]>([]);

let resolvePromise: Function;
let rejectPromise: Function;

/**
 * 🔥 CONF -> JSON（严格按你规则）
 */
function confToJson(conf: string): ConfItem[] {
  return conf
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(line => {
      const idx = line.indexOf(':');
      if (idx === -1) throw new Error(`invalid line: ${line}`);

      const name = line.slice(0, idx).trim();
      const body = line.slice(idx + 1);

      if (!name) throw new Error('missing name');

      const obj: any = { name };

      const parts = body.split('@');

      for (const part of parts) {
        if (!part) continue;

        const eq = part.indexOf('=');
        if (eq === -1) throw new Error(`invalid kv: ${part}`);

        const key = part.slice(0, eq).trim();
        const value = part.slice(eq + 1);

        if (!key) throw new Error(`empty key in: ${part}`);

        obj[key] = value;
      }

      return obj;
    });
}

/**
 * 🔥 JSON -> CONF
 */
function jsonToConf(list: ConfItem[]): string {
  return list
    .map(item => {
      if (!item.name) throw new Error('missing name');

      const { name, ...rest } = item;

      const kv = Object.entries(rest)
        .map(([k, v]) => `${k}=${String(v)}`)
        .join('@');

      return `${name}:${kv}`;
    })
    .join('\n');
}

/**
 * 🔥 校验 JSON 合法性（关键）
 */
function validateJson(list: ConfItem[]) {
  if (!Array.isArray(list)) throw new Error('root must be array');

  for (const item of list) {
    if (!item.name) {
      throw new Error('missing name field');
    }

    const keys = Object.keys(item);

    if (keys.length <= 1) {
      throw new Error(`empty config: ${item.name}`);
    }

    for (const k of keys) {
      if (k === 'name') continue;

      const v = item[k];
      if (v === undefined || v === null) {
        throw new Error(`invalid value: ${k} in ${item.name}`);
      }
    }
  }
}

/**
 * 🚀 open
 */
function open(confText: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      jsonData.value = confToJson(confText);
      active.value = true;

      resolvePromise = resolve;
      rejectPromise = reject;
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * 🚀 submit
 */
function submit() {
  try {
    validateJson(jsonData.value);

    const result = jsonToConf(jsonData.value);

    active.value = false;
    resolvePromise(result);
  } catch (e) {
    rejectPromise(e);
  }
}

/**
 * 🚀 close
 */
function close() {
  active.value = false;
  rejectPromise('closed');
}

defineExpose({
  open,
  submit,
  close
});
</script>
<template>
  <n-drawer v-model:show="active" width="600px">
    <n-drawer-content title="CONF 可视化编辑器">

      <JsonEditorVue
        v-model="jsonData"
      />

      <template #footer>
        <n-space justify="end">
          <n-button @click="close">取消</n-button>
          <n-button type="primary" @click="submit">提交</n-button>
        </n-space>
      </template>

    </n-drawer-content>
  </n-drawer>
</template>