import type { ThirdPartyAppOptimizeAppModeType } from '@/stores/embedded';
import type EmbeddedMergeRuleItem from '@/types/EmbeddedMergeRuleItem';
import type EmbeddedRuleItem from '@/types/EmbeddedRuleItem';
import type FixedOrientationRuleItem from '@/types/FixedOrientationRuleItem';

type SettingModeType = EmbeddedMergeRuleItem['settingMode'];

export interface SettingSupportEnableMode {
	embeddedEnable?: boolean
	fullScreenEnable?: boolean
	fixedOrientationEnable?: boolean
	ratio_fullScreenEnable?: boolean
}

export const getSettingEnableMode = (embeddedConfig: EmbeddedRuleItem, fixedOrientationConfig: FixedOrientationRuleItem,settingMode:EmbeddedMergeRuleItem['settingMode']) => {

	const supportModes = fixedOrientationConfig ? fixedOrientationConfig.supportModes?.split(',') : null;

	const enableModes: SettingSupportEnableMode =  {}

	if (embeddedConfig && !embeddedConfig.fullRule) {
		enableModes.embeddedEnable = settingMode === 'embedded' ? true : false
	}

	if (fixedOrientationConfig) {
		if (supportModes?.includes('full')) {
			enableModes.ratio_fullScreenEnable = settingMode === 'fullScreen' ? true : false
			if (embeddedConfig && embeddedConfig.hasOwnProperty('fullRule')) {
				enableModes.fullScreenEnable = true;
			}
		}
		if (!enableModes.hasOwnProperty('fullScreen')) {
			enableModes.fixedOrientationEnable = settingMode === 'fixedOrientation' ? true : false;
		}
	}


	return enableModes
	
}

export const getSettingMode = (embeddedConfig: EmbeddedRuleItem, fixedOrientationConfig: FixedOrientationRuleItem) => {
	const getSupportModes = fixedOrientationConfig?.supportModes?.split(',');
	const getDefaultSettings = fixedOrientationConfig?.defaultSettings;
	let settingMode: EmbeddedMergeRuleItem['settingMode'] = 'disabled';
	if (fixedOrientationConfig) {
		settingMode = 'fixedOrientation';
	}
	if (fixedOrientationConfig && fixedOrientationConfig.hasOwnProperty('disable') && fixedOrientationConfig.disable) {
		settingMode = 'disabled';
	}
	if (
		fixedOrientationConfig &&
		fixedOrientationConfig.hasOwnProperty('supportModes') &&
		getSupportModes?.includes('full') &&
		(!getDefaultSettings || getDefaultSettings === 'full')
	) {
		settingMode = 'fullScreen';
	}
	if (
		embeddedConfig &&
		!embeddedConfig.hasOwnProperty('fullRule') &&
		(!getDefaultSettings || getDefaultSettings === 'ae')
	) {
		settingMode = 'embedded';
	}
	return settingMode;
};

export const getAppModeCode = (settingMode: EmbeddedMergeRuleItem['settingMode']) => {
	if (settingMode === 'disabled') {
		return 0;
	}

	if (settingMode === 'embedded') {
		return 1;
	}

	if (settingMode === 'fixedOrientation') {
		return 2;
	}

	if (settingMode === 'fullScreen') {
		return 3;
	}

	throw new Error('wrong error AppModeCode!');
};

export const getAppMode = (settingMode: 0 | 1 | 2 | 3) => {
	if (settingMode === 0) {
		return 'disabled';
	}

	if (settingMode === 1) {
		return 'embedded';
	}

	if (settingMode === 2) {
		return 'fixedOrientation';
	}

	if (settingMode === 3) {
		return 'fullScreen';
	}

	throw new Error('wrong error AppMode!');
};


export const thirdPartyAppOptimizeConfigFormatToJSON = (data: string) => {
	return data.trim().split('\n').reduce((acc, line) => {
		const [name, mode] = line.split(':');
		acc[name] = Number(mode) as ThirdPartyAppOptimizeAppModeType; // 将数字映射为对应的 settingMode
		return acc;
	}, {} as Record<string, ThirdPartyAppOptimizeAppModeType>);
}

export const thirdPartyAppOptimizeJSONFormatToProp = (jsonData: Record<string,ThirdPartyAppOptimizeAppModeType>) => {
	return Object.entries(jsonData).map(([key, value]) => {
		return `${key}:${value}`;
	  }).join('\n');
}

export const thirdPartyAppOptimizeJSONFormatToRunnerShell = (jsonData: Record<string,ThirdPartyAppOptimizeAppModeType>) => {
	return Object.entries(jsonData)
	.map(([packageName, mode]) => `cmd miui_embedding_window set-appMode ${packageName} ${mode}`)
	.join('\n');
}