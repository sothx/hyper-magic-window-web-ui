import { exec, spawn, fullScreen, toast, moduleInfo, type ExecResults } from '@/utils/kernelsu/index.js';
import axios from 'axios';
import handlePromiseWithLogging from '@/utils/handlePromiseWithLogging';
import $to from 'await-to-js';
import * as deviceApi from '@/apis/deviceApi';
import { useDeviceStore, type RemoteDownloadAppInfo } from '@/stores/device';
import { useLogsStore } from '@/stores/logs';



export const getRemoteDownloadAppUrlMap = async (options?: { timeout?: number; }): Promise<Record<string, RemoteDownloadAppInfo>> => {
  const timeout = options?.timeout ?? 8000;
  return new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === 'development') {
      const response = await axios.get('/data/custom/remoteDownloadAppUrlMap.json');
      resolve(response.data ?? {});
    } else {
      const response = await axios.get<Record<string, RemoteDownloadAppInfo>>(
        'https://github.com/sothx/mipad-magic-window/apis/remoteDownloadAppUrlMap.json',
        {
          timeout,
          withCredentials: false,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
          params: {
            _t: Date.now(),
          },
        }
      );
      const remoteMap = response.data ?? {};
      resolve(remoteMap);
    }
  })
}
