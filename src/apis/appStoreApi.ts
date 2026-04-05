import { exec, spawn, fullScreen, toast, moduleInfo, type ExecResults } from '@/utils/kernelsu/index.js';
import axios, { AxiosError } from 'axios';
import handlePromiseWithLogging from '@/utils/handlePromiseWithLogging';
import $to from 'await-to-js';
import * as deviceApi from '@/apis/deviceApi';
import {type RemoteDownloadAppInfo } from '@/stores/appStore';
import { useDeviceStore } from '@/stores/device';
import { useLogsStore } from '@/stores/logs';
import { isPlainObject } from '$/@types/lodash-es';


export const getRemoteDownloadAppUrlMap = async (
  options?: { timeout?: number }
): Promise<Record<string, RemoteDownloadAppInfo>> => {
  // 默认超时 8 秒
  const timeout = options?.timeout ?? 8000;
  const shellCommon = `curl "https://hyper-magic-window-module-update.sothx.com/apis/remoteDownloadAppUrlMap.json?_t=$(date +%s)"`;
  return new Promise(async (resolve, reject) => {
    // 开发环境：本地 JSON
    if (import.meta.env.MODE === 'development') {
      const res = await axios.get('/data/custom/remoteDownloadAppUrlMap.json', { timeout });
      resolve(res.data ?? {});
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
      const JsonData = JSON.parse(stdout);
      errno ? reject(stderr) : isPlainObject(JsonData) ? resolve(JsonData) : reject(new Error('返回的内容不是对象'))
    }
  })
};
