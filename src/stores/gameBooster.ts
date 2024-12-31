import { ref, computed, reactive, type ComputedRef } from 'vue';
import { defineStore } from 'pinia';
import $to from 'await-to-js';
import * as gameBoosterApi from '@/apis/gameBoosterApi';
import type { ErrorLogging } from '@/types/ErrorLogging';
import type GameBoosterTableItem from '@/types/GameBoosterTableItem';

export const useGameBoosterStore = defineStore(
	'gameBooster',
	() => {
		// 游戏显示布局
		const gameBoosterList = ref<GameBoosterTableItem[]>([])
		// 搜索后的配置列表
		const filterGameBoosterList:ComputedRef<GameBoosterTableItem[]> = computed(() => {
			const searchValue = searchKeyWord.value.trim().toLowerCase();
			const cachedGameBoosterList = gameBoosterList.value;
			return cachedGameBoosterList.reduce((result:GameBoosterTableItem[], item) => {
				const itemName = item.package_name.trim().toLowerCase();

				// 过滤条件，检查 name 和 applicationName 是否包含 searchValue
				const applicationNameLower = item.app_name ? item.app_name.toLowerCase() : '';
				if (!itemName.includes(searchValue) && !applicationNameLower.includes(searchValue)) {
					return result;
				}
	
				result.push(item);
				return result;
			},[]);
		})
		// 搜索后的配置列表
		// 是否弹出错误信息弹窗
		const isNeedShowErrorModal = computed(() => Boolean(errorLogging.length > 0));
		// 应用总数
		const listCount = computed(() => gameBoosterList.value.length);
		// 搜索值
		const searchKeyWord = ref<string>('');
		// 加载状态
		const loading = ref<boolean>(true);
		// 数据库记录
		const hasGameBoosterDataBase = ref<boolean>(false);
		// 错误存储
		const errorLogging = reactive<ErrorLogging[]>([]);
		//
		const allPackageName = computed(() => {
			const allPackages = new Set([
				...gameBoosterList.value
			]);
			return allPackages;
		});

		async function initDefault() {
			loading.value = true;

			const [getHasGameBoosterDataBaseErr, getHasGameBoosterDataBaseRes] = await $to<string>(gameBoosterApi.getHasGameBoosterDataBase())

			if (getHasGameBoosterDataBaseErr) {
				loading.value = false;
				hasGameBoosterDataBase.value = false;
			}

			if (getHasGameBoosterDataBaseRes) {
				hasGameBoosterDataBase.value = true;
				const [getGameBoosterListErr, getGameBoosterListRes] = await $to<GameBoosterTableItem[], string>(
					gameBoosterApi.getGameBoosterList(),
				);
				if (getGameBoosterListErr) {
					loading.value = false;
					gameBoosterList.value = [];
				}
	
				if (getGameBoosterListRes) {
					loading.value = false;
					gameBoosterList.value = getGameBoosterListRes;
				}
			}

			if (!errorLogging.length) {
				loading.value = false;
			}
		}

		return {
			gameBoosterList,
			filterGameBoosterList,
			allPackageName,
			hasGameBoosterDataBase,
			searchKeyWord,
			errorLogging,
			isNeedShowErrorModal,
			loading,
			initDefault,
		};
	},
	{
		persist: {
			pick: [],
		},
	},
);
