import { mapValues, toLower } from "lodash-es";
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

const transformValues = <T>(obj: Record<string, T>): Record<string, T> => {
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

export const testXMLToObject = <T>(
  xml: string,
  parentTag: string,
  childTag: string,
  isNeedPatchParentTag: boolean = false
): any => {
  const parser = new DOMParser();
  const serializer = new XMLSerializer();
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

  return result
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
  customConfigEmbeddedSettingConfig: Record<string, EmbeddedSettingRuleItem> = {} // 默认值为 {}
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

    if (deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2) {
      // 有设置优先设置
      if (settingConfig) {
        settingMode = 'disabled'
        if (settingConfig.fixedOrientationEnable) {
          settingMode = 'fixedOrientation'
        }
        if (settingConfig.ratio_fullScreenEnable) {
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

    // if (settingConfig && settingConfig.hasOwnProperty('embeddedEnable')) {
    //   if (settingConfig.embeddedEnable) {
    //     if (embeddedConfig) {
    //       if (embeddedConfig.hasOwnProperty('fullRule')) {
    //         if (embeddedConfig.fullRule) {
    //           settingMode = 'fullScreen'
    //         } else {
    //           settingMode = 'embedded'
    //         }
    //       } else {
    //         settingMode = 'embedded'
    //       }
    //     }
    //   } else {      
    //     if (fixedOrientationConfig) {
    //       if (fixedOrientationConfig.hasOwnProperty('disable')) {
    //         if (!fixedOrientationConfig.disable) {
    //           settingMode = "fixedOrientation";
    //         }
    //       } else {
    //         settingMode = "fixedOrientation";
    //       }
    //     }  
    //   }
    // } else {
    //   if (fixedOrientationConfig) {
    //     if (fixedOrientationConfig.hasOwnProperty('disable')) {
    //       if (!fixedOrientationConfig.disable) {
    //         settingMode = "fixedOrientation";
    //       }
    //     } else {
    //       settingMode = "fixedOrientation";
    //     }
    //   }
    //   if (embeddedConfig) {
    //     if(embeddedConfig.hasOwnProperty('defaultSettings')) {
    //       if (embeddedConfig.defaultSettings) {
    //         if (embeddedConfig.hasOwnProperty('fullRule')) {
    //           if (embeddedConfig.fullRule) {
    //             settingMode = 'fullScreen'
    //           } else {
    //             settingMode = 'embedded'
    //           }
    //         } else {
    //           settingMode = 'embedded'
    //         }
    //       }
    //     } else {
    //       if (embeddedConfig.hasOwnProperty('fullRule')) {
    //         if (embeddedConfig.fullRule) {
    //           settingMode = 'fullScreen'
    //         } else {
    //           settingMode = 'embedded'
    //         }
    //       } else {
    //         settingMode = 'embedded'
    //       }
    //     }
    //   }
    // }


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
