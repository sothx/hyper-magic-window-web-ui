import { exec, spawn, fullScreen, toast, moduleInfo, type ExecResults } from '@/utils/kernelsu/index.js';
import axios from 'axios';
import handlePromiseWithLogging from '@/utils/handlePromiseWithLogging';
import $to from 'await-to-js';
import * as deviceApi from '@/apis/deviceApi';
import { useDeviceStore } from '@/stores/device';
import { useLogsStore } from '@/stores/logs';
import type DotBlackListItem from '@/types/DotBlackListItem';

export const getPackageInfoToShell = (): Promise<string> => {
    const shellCommon = `cmd package list packages -U -s | awk -F'[ :]' '{sys[$2]=1; print $2,$4,"true"}' | cat - <(cmd package list packages -U -3 | awk -F'[ :]' '{print $2,$4,"false"}') | awk '{printf "%s,%s,%s;", $1,$2,$3}'`;
    return handlePromiseWithLogging(
        new Promise(async (resolve, reject) => {
            if (import.meta.env.MODE === 'development') {
                const response = await axios.get('/data/system/app.xml');
                const xmlText = response.data; // 这是 XML 内容
                resolve(xmlText);
            } else {
                const { errno, stdout, stderr }: ExecResults = await exec(shellCommon);
                errno ? reject(stderr) : resolve(stdout);
            }
        }),
        shellCommon,
    );
};