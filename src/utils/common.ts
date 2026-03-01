import type PackageInfoItem from '@/types/PackageInfoItem';
import { getPackagesInfo } from '@/utils/kernelsu/index.js';

export const findBase64InString = (input: string): string | null => {
    const base64Pattern = /([A-Za-z0-9+/=]{16,})/g; // 至少16个字符的Base64
    const match = input.match(base64Pattern);

    return match && match.length > 0 ? match[0] : null; // 返回第一个匹配的Base64字符串，若无则返回null
}

export const renderApplicationName = (name:string,packageName?:string) => {
    return packageName ? `${packageName}(${name})` : name;
}

export const parsePropContent = (content: string): { [key: string]: string } => {
    const result: { [key: string]: string } = {};
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split('=') as [string, string];
        if (key && value) {
          result[key.trim()] = value.trim();
        }
      }
    });
    return result;
};

export function parseSchedulerOutput(output: string) {
  const schedulerList: string[] = []
  let currentScheduler = ''

  output.trim().split(/\s+/).forEach(item => {
    if (item.startsWith('[') && item.endsWith(']')) {
      const queue = item.slice(1, -1)
      currentScheduler = queue
      schedulerList.push(queue)
    } else {
      schedulerList.push(item)
    }
  })

  return {
    schedulerList,
    currentScheduler
  }
}

export const canUsePackageInfo = () => {
   const packages = getPackagesInfo(['com.android.shell']);
   return Array.isArray(packages) && packages.length === 1;
}

export const getAppLabelToPackageInfo = (packageName:string) => {
    const packages = getPackagesInfo([packageName]);
    if (Array.isArray(packages) && packages.length === 1) {
        const pkg = packages[0];
        if (pkg.appLabel) {
          return pkg.appLabel
        } else {
          return pkg.packageName
        }

    } else {
      return packageName
    }
}

export function parsePackageListShell(input: string): PackageInfoItem[] {
  if (!input) return [];

  return input
    .split(';')
    .filter((item) => item.length > 0)
    .map((item): PackageInfoItem => {
      const [packageName, uid, isSystem] = item.split(',');

      return {
        packageName,
        uid: Number(uid),
        isSystem: isSystem === 'true',
      };
    });
}
