import type EmbeddedMergeRuleItem from '@/types/EmbeddedMergeRuleItem';
import type EmbeddedRuleItem from '@/types/EmbeddedRuleItem';
import type FixedOrientationRuleItem from '@/types/FixedOrientationRuleItem';

type SettingModeType = EmbeddedMergeRuleItem['settingMode'];

export interface SettingSupportEnableMode {
	embeddedEnable?: boolean
	fullScreenEnable?: boolean
	fixedOrientation?: boolean
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
			enableModes.fixedOrientation = settingMode === 'fixedOrientation' ? true : false;
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
