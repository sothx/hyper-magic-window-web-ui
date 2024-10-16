<script setup lang="ts">
import type { ErrorLogging } from '@/types/ErrorLogging';
import { ref, watch } from 'vue';
const props = defineProps<{
    modelValue: boolean,
    errorLogging: ErrorLogging[]
}>()

const show = ref<boolean> (false);

const emit = defineEmits();

const internalValue = ref<boolean>(props.modelValue);

watch(() => props.modelValue, (newValue) => {
    internalValue.value = newValue;
});

const close = () => {
    emit('update:modelValue', false);
};
</script>

<template>
    <n-modal @positive-click="close" @close="close" style="width: 600px" title="发生错误" type="error" block-scroll="true" positive-text="确认"
        preset="dialog" :mask-closable="true" :show="props.modelValue">
        <n-card :bordered="false">
            <n-alert v-for="errItem in props.errorLogging" :title="`[发生错误] ${errItem.type}`" class="mb-5" type="error">
                <p>错误描述:无法获取{{ errItem.title }}</p>
                <p>错误详情:{{ errItem.msg }}</p>
            </n-alert>
        </n-card>
    </n-modal>
</template>

<style scoped>

</style>
