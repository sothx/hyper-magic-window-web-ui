import { cloneDeep, mapValues, toLower } from "lodash-es";
import type EmbeddedRuleItem from "@/types/EmbeddedRuleItem";
import type FixedOrientationRuleItem from "@/types/FixedOrientationRuleItem";
import type EmbeddedSettingRuleItem from "@/types/EmbeddedSettingRuleItem";
import type EmbeddedMergeRuleItem from "@/types/EmbeddedMergeRuleItem";
import { omit } from "lodash-es";
import type AutoUISettingRuleItem from "@/types/AutoUISettingRuleItem";
import type AutoUIItem from "@/types/AutoUIItem";
import type AutoUIMergeRuleItem from "@/types/AutoUIMergeRuleItem";
import * as autoUIFun from '@/utils/autoUIFun';
import { useDeviceStore } from "@/stores/device";
import { getSettingMode } from "./embeddedFun";
import type { AutoUI2Activity, AutoUI2Package, AutoUI2PackageRules, AutoUI2View, AutoUI2EnableMap } from "@/types/AutoUI2PackageRules"
import type AutoUI2MergeRuleItem from "@/types/AutoUI2MergeRuleItem";

export const transformValues = <T>(obj: Record<string, T>): Record<string, T> => {
  return mapValues(obj, (value) => {
    if (typeof value === "string") {
      // 转换布尔值字符串
      if (toLower(value) === "true") {
        return true;
      } else if (toLower(value) === "false") {
        return false;
      } else if (!isNaN(Number(value))) {
        // 如果是数字字符串，转换为数字
        return Number(value);
      }
      return value; // 保持原始值
    } else if (typeof value === "number") {
      return value; // 直接保留数字
    } else if (typeof value === "boolean") {
      return value; // 直接保留布尔值
    }
    return value; // 保持原始值
  }) as Record<string, T>; // 强制转换为所需类型
};

export const parseXMLToObject = <T>(
  xml: string,
  parentTag: string,
  childTag: string,
  isNeedPatchParentTag: boolean = false
): Record<string, T> => {
  const parser = new DOMParser();
  let xmlDoc = parser.parseFromString(xml, "application/xml");

  // 检查是否有根节点，如果没有则添加一个虚拟根节点
  if (isNeedPatchParentTag) {
    let rootString = `<${parentTag}>\n
    ${xml}
    \n</${parentTag}>`;
    let sanitizedString = rootString.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    xmlDoc = parser.parseFromString(sanitizedString, "application/xml");
    // 将临时文档的子节点（即所有 package 节点）插入到 package_config 根节点
  }

  const packages = xmlDoc.getElementsByTagName(childTag);
  const result: Record<string, T> = {}; // 使用对象存储结果

  Array.from(packages).forEach((pkg) => {
    const name = pkg.getAttribute("name");
    if (name) {
      const attributes: Record<string, string> = {}; // 属性值都是字符串
      Array.from(pkg.attributes).forEach((attr) => {
        // 将每个属性添加到 attributes 对象中
        attributes[attr.name] = attr.value;
      });

      // 处理属性并将结果赋值给结果对象
      result[name] = {
        name,
        ...transformValues(attributes), // 将所有属性转换
      } as T; // 强制转换为所需类型 T
    }
  });

  return result;
};

export const parseXMLToArray = <T>(
  xml: string,
  parentTag: string = "package_config",
  childTag: string = "package"
): Array<T & { name: string }> => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, "application/xml");
  const packages = xmlDoc.getElementsByTagName(childTag);
  const result: Record<string, T> = {}; // 使用对象存储去重后的项

  Array.from(packages).forEach((pkg) => {
    const attributes: Record<string, string> = {}; // 修改为 string 类型以符合 XML 属性值

    // 将每个属性添加到 attributes 对象中
    Array.from(pkg.attributes).forEach((attr) => {
      attributes[attr.name] = attr.value;
    });

    const name = pkg.getAttribute("name")!; // 确定 name 不会为空字符串

    // 如果已经存在相同 name 的项，将其替换
    result[name] = {
      name, // 将 name 添加到结果对象中
      ...transformValues(attributes), // 将所有属性转换
    } as T; // 强制转换为所需类型 T
  });

  // 将对象转换为数组并返回
  return Object.values(result) as Array<T & { name: string }>;
};

type PackageData = Record<string, Record<string, any>>;

export const objectToXML = (
  obj: PackageData,
  childTag: string,
  parentTag?: string,
): string => {
  const createXMLString = (data: PackageData): string => {
    let xmlString = ""; // 初始化 XML 字符串

    if (!Object.keys(obj)) {
      return xmlString;
    }

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        xmlString += `    <${childTag}`; // 开始子项标签

        // 将对象的每个属性添加为子项的属性
        for (const [attrKey, attrValue] of Object.entries(data[key])) {
          xmlString += ` ${attrKey}="${String(attrValue)}"`; // 添加属性
        }

        xmlString += ` />\n`; // 结束子项标签
      }
    }

    return xmlString; // 返回拼接后的 XML 字符串
  };

  // 处理有父级标签的情况
  if (parentTag) {
    return `<?xml version="1.0" encoding="utf-8" standalone="yes" ?>\n<${parentTag}>\n${createXMLString(obj)}</${parentTag}>`; // 包裹在父级标签中
  } else {
    return createXMLString(obj); // 仅返回 package 标签
  }
};

// 辅助函数，用于排除对象中的 name 属性
const omitName = <T extends { name: string }>(obj: T): Omit<T, "name"> => {
  return omit(obj, "name"); // 返回不包含 name 的对象
};



export const mergeEmbeddedRule = (
  embeddedRules: Record<string, EmbeddedRuleItem>,
  fixedOrientationRules: Record<string, FixedOrientationRuleItem>,
  settingRules: Record<string, EmbeddedSettingRuleItem>,
  customEmbeddedRules: Record<string, EmbeddedRuleItem> = {}, // 默认值为 {}
  customFixedOrientationRules: Record<string, FixedOrientationRuleItem> = {}, // 默认值为 {}
  customConfigEmbeddedSettingConfig: Record<string, EmbeddedSettingRuleItem> = {}, // 默认值为 {}
  systemEmbeddedRules: Record<string, EmbeddedRuleItem> = {},
  systemFixedOrientationRules: Record<string, FixedOrientationRuleItem> = {},
): EmbeddedMergeRuleItem[] => {
  const deviceStore = useDeviceStore()
  const result: EmbeddedMergeRuleItem[] = [];
  const allPackages = new Set([
    ...Object.keys(embeddedRules),
    ...Object.keys(fixedOrientationRules),
    ...Object.keys(customEmbeddedRules),
    ...Object.keys(customFixedOrientationRules),
  ]);

  allPackages.forEach((pkgName) => {
    const embeddedConfig = customEmbeddedRules[pkgName] ?? embeddedRules[pkgName];
    const fixedOrientationConfig = customFixedOrientationRules[pkgName] ?? fixedOrientationRules[pkgName];
    const settingConfig = customConfigEmbeddedSettingConfig[pkgName] ?? settingRules[pkgName];

    // 初始化模式
    const getSupportModes = fixedOrientationConfig?.supportModes?.split(',')
    const getDefaultSettings = fixedOrientationConfig?.defaultSettings
    let settingMode: EmbeddedMergeRuleItem["settingMode"] = "disabled";
    let isSupportEmbedded = embeddedConfig ? !embeddedConfig.fullRule : false;
    let isSupportFixedOrientation = getSupportModes?.includes('fo') || (fixedOrientationConfig && !fixedOrientationConfig.hasOwnProperty('disable')) || false
    let isSupportFullScreen = getSupportModes?.includes('full') ||  false
    let ruleMode: EmbeddedMergeRuleItem["ruleMode"] = customEmbeddedRules[pkgName] || customFixedOrientationRules[pkgName] || customConfigEmbeddedSettingConfig[pkgName] ? "custom" : "module";
    let isSupportSystemEmbedded = systemEmbeddedRules[pkgName] && !systemEmbeddedRules[pkgName].fullRule ? true : false

    if (deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35) {
      // 有设置优先设置
      if (settingConfig) {
        settingMode = 'disabled'
        if (settingConfig.fixedOrientationEnable) {
          settingMode = 'fixedOrientation'
        }
        if (settingConfig.ratio_fullScreenEnable || settingConfig.fullScreenEnable) {
          settingMode = 'fullScreen'
        }
        if (settingConfig.embeddedEnable) {
          settingMode = 'embedded'
        }
      } else {
        settingMode = getSettingMode(embeddedConfig,fixedOrientationConfig)
      }
      // 没设置根据规则约定来判断
    } else {
      if (settingConfig?.hasOwnProperty('embeddedEnable')) {
        if (settingConfig.embeddedEnable && embeddedConfig) {
          settingMode = embeddedConfig.fullRule ? 'fullScreen' : 'embedded';
        } else if (fixedOrientationConfig) {
          if (!fixedOrientationConfig.hasOwnProperty('disable') || !fixedOrientationConfig.disable) {
            settingMode = "fixedOrientation";
          }
        }
      } else {
        if (fixedOrientationConfig && (!fixedOrientationConfig.hasOwnProperty('disable') || !fixedOrientationConfig.disable)) {
          settingMode = "fixedOrientation";
        }
      
        if (embeddedConfig) {
          const hasDefaultSettings = embeddedConfig.hasOwnProperty('defaultSettings') && embeddedConfig.defaultSettings;
          if (!embeddedConfig.hasOwnProperty('defaultSettings') || hasDefaultSettings) {
            settingMode = embeddedConfig.fullRule ? 'fullScreen' : 'embedded';
          }
        }
      }
    }


    const omitEmbeddedConfig = omitName(embeddedConfig)

    const omitFixedOrientationConfig = omitName(fixedOrientationConfig)

    const omitSettingConfig = omitName(settingConfig);

    // Build the result object
    const ruleData: EmbeddedMergeRuleItem = {
      name: pkgName,
      settingMode,
      isSupportEmbedded,
      isSupportFixedOrientation,
      isSupportFullScreen,
      isSupportSystemEmbedded,
      ruleMode,
      embeddedRules: omitEmbeddedConfig ? omitEmbeddedConfig : undefined, // 排除 name 属性
      fixedOrientationRule: omitFixedOrientationConfig
        ? omitFixedOrientationConfig
        : undefined, // 排除 name 属性
      settingRule: omitSettingConfig ? omitSettingConfig : undefined, // 排除 name 属性
    };

    result.push(ruleData);
  });

  return result;
};


export const mergeAutoUIRule = (
  sourceAutoUIList: Record<string, AutoUIItem>,
  customConfigAutoUIList: Record<string, AutoUIItem> = {}, // 默认值为 {}
  autoUISettingConfig: Record<string, AutoUISettingRuleItem> = {} // 默认值为 {}
): AutoUIMergeRuleItem[] => {
  const result: AutoUIMergeRuleItem[] = [];
  const allPackages = new Set([
    ...Object.keys(sourceAutoUIList),
    ...Object.keys(customConfigAutoUIList),
  ]);

  allPackages.forEach((pkgName) => {
    const autoUIConfig = customConfigAutoUIList[pkgName] ? customConfigAutoUIList[pkgName] : sourceAutoUIList[pkgName];
    const settingConfig = autoUISettingConfig[pkgName];

    // Determine currentMode
    let ruleMode: AutoUIMergeRuleItem["ruleMode"] = "module";

    // 初始化自定义规则类型
    if (customConfigAutoUIList[pkgName]) {
      ruleMode = 'custom';
    }


    const omitSettingConfig = omitName(settingConfig);
    const omitAutoUIConfig = omitName(autoUIConfig)

    // Build the result object
    const ruleData: AutoUIMergeRuleItem = {
      name: pkgName,
      ruleMode,
      settingMode: autoUIFun.getBuiltInSettingMode(autoUIConfig.activityRule || ''),
      autoUIRule: omitAutoUIConfig ? omitAutoUIConfig : undefined, // 排除 name 属性
      settingRule: omitSettingConfig ? omitSettingConfig : undefined,
    };

    result.push(ruleData);
  });

  return result;
};

export const mergeAutoUI2Rule = (
  sourceAutoUI2List: Record<string, AutoUI2Package> = {},
  customConfigAutoUI2List: Record<string, AutoUI2Package> = {}, // 默认值为 {}
  autoUISettingConfig: Record<string, AutoUISettingRuleItem> = {} // 默认值为 {}
): AutoUI2MergeRuleItem[] => {
  const result: AutoUI2MergeRuleItem[] = [];
  const allPackages = new Set([
    ...Object.keys(sourceAutoUI2List),
    ...Object.keys(customConfigAutoUI2List),
  ]);

  allPackages.forEach((pkgName) => {
    const autoUI2Config = customConfigAutoUI2List[pkgName] ? customConfigAutoUI2List[pkgName] : sourceAutoUI2List[pkgName];
    const settingConfig = autoUISettingConfig[pkgName];

    // Determine currentMode
    let ruleMode: AutoUIMergeRuleItem["ruleMode"] = "module";

    // 初始化自定义规则类型
    if (customConfigAutoUI2List[pkgName]) {
      ruleMode = 'custom';
    }


    const omitSettingConfig = omitName(settingConfig);
    const omitAutoUI2Config = omitName(autoUI2Config)

    // Build the result object
    const ruleData: AutoUI2MergeRuleItem = {
      name: pkgName,
      ruleMode,
      autoUI2Rule: omitAutoUI2Config ? omitAutoUI2Config : undefined, // 排除 name 属性
      settingRule: omitSettingConfig ? omitSettingConfig : undefined,
    };

    result.push(ruleData);
  });

  return result;
};

/**
 * 为 patch_rule 合并 AutoUI2 配置：系统配置 + 自定义配置 + 开关配置
 * 仅当存在开关配置时才进行合并
 */
export const mergeAutoUI2ForPatchRule = (
	sourceAutoUI2List: Record<string, AutoUI2Package> = {},
	customConfigAutoUI2List: Record<string, AutoUI2Package> = {},
	enableMap: AutoUI2EnableMap = {},
): AutoUI2PackageRules => {
	// 如果没有开关配置，返回空
	if (Object.keys(enableMap).length === 0) {
		return {};
	}

	const result: AutoUI2PackageRules = {};
	const allKeys = new Set([
		...Object.keys(sourceAutoUI2List),
		...Object.keys(customConfigAutoUI2List),
		...Object.keys(enableMap),
	]);

	for (const key of allKeys) {
		const hasCustom = Object.prototype.hasOwnProperty.call(customConfigAutoUI2List, key);
		const hasEnable = Object.prototype.hasOwnProperty.call(enableMap, key);

		// 优先使用自定义配置，其次使用系统配置
		let base: AutoUI2Package;
		if (hasCustom) {
			base = cloneDeep(customConfigAutoUI2List[key]);
		} else if (sourceAutoUI2List[key]) {
			base = cloneDeep(sourceAutoUI2List[key]);
		} else {
			// 仅在开关配置中存在
			base = { name: key, enable: enableMap[key], activity: [] };
		}

		base.name = key;
		// 开关配置优先级最高
		if (hasEnable) {
			base.enable = enableMap[key];
		}

		result[key] = base;
	}

	return result;
};


const getDirectChildren = (node: Element, tag: string): Element[] => {
  const res: Element[] = [];

  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i];
    if (child.nodeType === 1 && (child as Element).tagName === tag) {
      res.push(child as Element);
    }
  }

  return res;
};

const parseBool = (val: string | null): boolean => val === 'true';

const parseOptionalBool = (val: string | null): boolean | undefined => {
  if (val == null) return undefined;
  return val === 'true';
};

const parseNumber = (val: string | null): number => {
  if (!val) return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
};

const emptyToUndefined = (val: string | null): string | undefined => {
  if (!val || val.trim() === '') return undefined;
  return val;
};

/**
 * 解析 AutoUI2 packageRules XML
 */
export const parseAutoUI2PackageRulesXml = (xml: string): AutoUI2PackageRules => {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');

  const result: AutoUI2PackageRules = {};

  const packageNodes = getDirectChildren(doc.documentElement, 'package');

  packageNodes.forEach(pkg => {
    const packageName = pkg.getAttribute('name');
    if (!packageName) return;

    const enAttr = pkg.getAttribute('enable');
    const pkgObj: AutoUI2Package = {
      name: packageName,
      enable: enAttr == null || enAttr === '' ? true : enAttr === 'true',
      describe: pkg.getAttribute('describe') || undefined,
      optimizeWebView: parseOptionalBool(pkg.getAttribute('optimizeWebView')),
      activity: []
    };

    const activityNodes = getDirectChildren(pkg, 'activity');

    pkgObj.activity = activityNodes.map(activity => {
      const actObj: AutoUI2Activity = {
        name: activity.getAttribute('name') || '',
        policy: parseNumber(activity.getAttribute('policy')),
        view: []
      };

      const viewNodes = getDirectChildren(activity, 'view');

      actObj.view = viewNodes.map(view => {
        const viewObj: AutoUI2View = {
          name: emptyToUndefined(view.getAttribute('name')),
          id: emptyToUndefined(view.getAttribute('id')),
          path: emptyToUndefined(view.getAttribute('path'))
        };

        const policyNode = getDirectChildren(view, 'view_policy')[0];

        if (policyNode) {
          viewObj.view_policy = {
            range: parseNumber(policyNode.getAttribute('range')),
            policytype: policyNode.getAttribute('policytype') || '',
            oldcolumns: parseNumber(policyNode.getAttribute('oldcolumns')),
            newcolumns: parseNumber(policyNode.getAttribute('newcolumns')),
            itemdecorationflag: parseNumber(policyNode.getAttribute('itemdecorationflag')),
            multisetflag: parseNumber(policyNode.getAttribute('multisetflag')),
            resetflag: parseNumber(policyNode.getAttribute('resetflag'))
          };
        }

        return viewObj;
      });

      return actObj;
    });

    result[packageName] = pkgObj;
  });

  return result;
};

/**
 * 设置属性（自动过滤 undefined）
 */
const setAttr = (el: Element, key: string, val: any) => {
  if (val === undefined || val === null) return;
  el.setAttribute(key, String(val));
};

const formatXml = (xml: string): string => {
  const PADDING = '  ';
  let formatted = '';
  let pad = 0;

  xml.split(/>\s*</).forEach(node => {
    if (node.match(/^\/\w/)) pad--;

    formatted += PADDING.repeat(pad) + '<' + node + '>\n';

    if (node.match(/^<?\w[^>]*[^\/]$/)) pad++;
  });

  return formatted.trim();
};

/** 写入设备生效 XML 时仅保留启用项（关闭项仍保留在 autoui2_custom.json） */
export const filterAutoUI2PackagesForDeploy = (data: AutoUI2PackageRules): AutoUI2PackageRules => {
  const out: AutoUI2PackageRules = {};
  for (const [k, pkg] of Object.entries(data)) {
    if (pkg.enable !== false) {
      out[k] = pkg;
    }
  }
  return out;
};

const isAutoUI2EnableOnlyRecord = (p: Record<string, unknown>): boolean => {
  const vals = Object.values(p);
  if (vals.length === 0) return true;
  return vals.every((v) => typeof v === 'boolean');
};

const isLegacyAutoUI2FullJson = (p: Record<string, unknown>): boolean =>
  Object.values(p).some(
    (v) =>
      v !== null &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      Array.isArray((v as AutoUI2Package).activity),
  );

/** 由生效 XML + 仅 enable 的 JSON + 模块源还原内存中的自定义层 */
export const mergeAutoUI2CustomFromPersisted = (
  deployXml: string,
  enableMap: AutoUI2EnableMap,
  source: AutoUI2PackageRules
): AutoUI2PackageRules => {
  const fromXml = deployXml.trim() ? parseAutoUI2PackageRulesXml(deployXml) : {};
  const allKeys = new Set([...Object.keys(fromXml), ...Object.keys(enableMap)]);
  const result: AutoUI2PackageRules = {};

  for (const key of allKeys) {
    const hasEnable = Object.prototype.hasOwnProperty.call(enableMap, key);
    const en = hasEnable ? enableMap[key] : fromXml[key] != null;

    let base: AutoUI2Package;
    if (fromXml[key]) {
      base = cloneDeep(fromXml[key]);
    } else if (source[key]) {
      base = cloneDeep(source[key]);
    } else {
      base = { name: key, enable: en, activity: [] };
    }
    base.name = key;
    base.enable = en;
    result[key] = base;
  }

  return result;
};

/**
 * JSON -> AutoUI2 XML
 */
export const stringifyAutoUI2PackageRulesXml = (
  data: AutoUI2PackageRules
): string => {
  if (typeof document === 'undefined' || !document.implementation) {
    throw new Error('stringifyAutoUI2PackageRulesXml requires a browser DOM');
  }
  const doc = document.implementation.createDocument(null, 'packageRules', null);

  const root = doc.documentElement;

  Object.entries(data).forEach(([packageName, pkg]) => {
    const pkgEl = doc.createElement('package');

    setAttr(pkgEl, 'name', packageName);
    setAttr(pkgEl, 'enable', pkg.enable);
    setAttr(pkgEl, 'describe', pkg.describe);
    setAttr(pkgEl, 'optimizeWebView', pkg.optimizeWebView);

    pkg.activity.forEach(activity => {
      const actEl = doc.createElement('activity');

      setAttr(actEl, 'name', activity.name);
      setAttr(actEl, 'policy', activity.policy);

      activity.view?.forEach(view => {
        const viewEl = doc.createElement('view');

        setAttr(viewEl, 'name', view.name);
        setAttr(viewEl, 'id', view.id);
        setAttr(viewEl, 'path', view.path);

        if (view.view_policy) {
          const policyEl = doc.createElement('view_policy');

          const p = view.view_policy;

          setAttr(policyEl, 'range', p.range);
          setAttr(policyEl, 'policytype', p.policytype);
          setAttr(policyEl, 'oldcolumns', p.oldcolumns);
          setAttr(policyEl, 'newcolumns', p.newcolumns);
          setAttr(policyEl, 'itemdecorationflag', p.itemdecorationflag);
          setAttr(policyEl, 'multisetflag', p.multisetflag);
          setAttr(policyEl, 'resetflag', p.resetflag);

          viewEl.appendChild(policyEl);
        }

        actEl.appendChild(viewEl);
      });

      pkgEl.appendChild(actEl);
    });

    root.appendChild(pkgEl);
  });

  const xml = new XMLSerializer().serializeToString(doc);

  return formatXml(xml);
};
