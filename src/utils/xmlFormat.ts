import { mapValues, toLower } from "lodash-es";
import type EmbeddedRuleItem from "@/types/EmbeddedRuleItem";
import type FixedOrientationRuleItem from "@/types/FixedOrientationRuleItem";
import type SettingRuleItem from "@/types/SettingRuleItem";
import type MergeRuleItem from "@/types/MergeRuleItem";

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
  }

export const parseXMLToObject = <T>(xml: string): Record<string, T> => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, "application/xml");
  const packages = xmlDoc.getElementsByTagName("package");
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
  xml: string
): Array<T & { name: string }> => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, "application/xml");
  const packages = xmlDoc.getElementsByTagName("package");
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

type PackageData = Record<string, Record<string, string | boolean | number>>;

export const objectToXML = (
  obj: PackageData,
  parentTag?: string,
  childTag: string = "package"
): string => {
  const createXMLString = (data: PackageData): string => {
    let xmlString = ""; // 初始化 XML 字符串

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        xmlString += `<${childTag} name="${key}"`; // 开始子项标签

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
    return `<${parentTag}>\n${createXMLString(obj)}</${parentTag}>`; // 包裹在父级标签中
  } else {
    return createXMLString(obj); // 仅返回 package 标签
  }
};


// 辅助函数，用于排除对象中的 name 属性
const omitName = <T extends { name: string }>(obj: T): Omit<T, 'name'> => {
    const { name, ...rest } = obj; // 解构并排除 name
    return rest; // 返回不包含 name 的对象
};

export const mergeRule = (
    embeddedRules: Record<string, EmbeddedRuleItem>,
    fixedOrientationRules: Record<string, FixedOrientationRuleItem>,
    settingRules: Record<string, SettingRuleItem>,
    customEmbeddedRules: Record<string, EmbeddedRuleItem> = {}, // 默认值为 {}
    customFixedOrientationRules: Record<string, FixedOrientationRuleItem> = {}, // 默认值为 {}
): MergeRuleItem[] => {
    const result: MergeRuleItem[] = [];

    const allPackages = new Set([
        ...Object.keys(embeddedRules),
        ...Object.keys(fixedOrientationRules),
        ...Object.keys(settingRules),
        ...Object.keys(customEmbeddedRules),
        ...Object.keys(customFixedOrientationRules),
    ]);

    allPackages.forEach(pkgName => {
        const embeddedConfig = embeddedRules[pkgName];
        const fixedOrientationConfig = fixedOrientationRules[pkgName];
        const settingConfig = settingRules[pkgName];

        // Determine currentMode
        let settingMode: string = 'original';
        let isSupportEmbedded = false;
        let ruleMode: string = 'module';

        // Determine settingMode and isSupportEmbedded
        if (embeddedConfig) {
            settingMode = 'embedded';
            if (embeddedConfig.fullRule) {
                settingMode = 'fullScreen';
            }
            isSupportEmbedded = !('fullRule' in embeddedConfig && embeddedConfig.fullRule); // if no fullRule
        } else if (fixedOrientationConfig && !embeddedConfig) {
            settingMode = 'fixedOrientation';
        }

        // Determine ruleMode
        if (customEmbeddedRules[pkgName] || customFixedOrientationRules[pkgName]) {
            ruleMode = 'custom';
        }

        // Merge custom configurations with existing ones
        const mergedEmbeddedConfig = customEmbeddedRules[pkgName]
            ? { ...omitName(embeddedConfig), ...omitName(customEmbeddedRules[pkgName]) }
            : omitName(embeddedConfig);
        
        const mergedFixedOrientationConfig = customFixedOrientationRules[pkgName]
            ? { ...omitName(fixedOrientationConfig), ...omitName(customFixedOrientationRules[pkgName]) }
            : omitName(fixedOrientationConfig);

        const mergedSettingConfig = omitName(settingConfig)

        // Build the result object
        const ruleData: MergeRuleItem = {
            name: pkgName,
            settingMode,
            isSupportEmbedded,
            ruleMode,
            embeddedRules: mergedEmbeddedConfig ? mergedEmbeddedConfig : undefined, // 排除 name 属性
            fixedOrientationRule: mergedFixedOrientationConfig ? mergedFixedOrientationConfig : undefined, // 排除 name 属性
            settingRule: mergedSettingConfig ? mergedSettingConfig : undefined, // 排除 name 属性
        };

        result.push(ruleData);
    });

    return result;
};
