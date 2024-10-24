import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export type fontType = 'MiSans' | 'OPPO Sans' | 'HarmonyOS Sans';

export const useFontStore = defineStore(
	'font',
	() => {
		const currentFont = ref<string>(`MiSans`);

        const currentFontFamily = computed(() => {
            return `${currentFont.value}, system-ui, sans-serif`
        })

		const setFont = (fontType: fontType) => {
			currentFont.value = fontType;
		};

		return { currentFont, setFont,currentFontFamily };
	},
	{
		persist: {
			pick: ['currentFont'],
		},
	},
);
