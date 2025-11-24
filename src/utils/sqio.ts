import $to from 'await-to-js'
import axios from 'axios';
import handlePromiseWithLogging from "@/utils/handlePromiseWithLogging";
import {
  exec,
  type ExecResults
} from "@/utils/kernelsu/index.js";
export default async function sqioInstance(cmd: string) {
  return handlePromiseWithLogging(new Promise(async (resolve, reject) => {
    if (import.meta.env.MODE === "development") {
      const [sqioErr, sqioRes] = await $to<any,any>(axios.get('/api/exec', {
        params: {
          cmd: `C:\\Users\\sothx\\scoop\\shims\\sq.exe '${cmd}'`
        }
      }))
      if (sqioErr) {
        console.log(sqioErr,'err')
        reject(sqioErr.response.data)
      } else {
        console.log(sqioRes,'res')
        resolve(sqioRes)
      }
    } else {
      const { errno, stdout, stderr }: ExecResults = await exec(
        `/data/adb/modules/Hyper_MagicWindow/common/utils/sq ${cmd}`
      );
      errno ? reject(stderr) : resolve(stdout);
    }
  }), `sq ${cmd}`)
}