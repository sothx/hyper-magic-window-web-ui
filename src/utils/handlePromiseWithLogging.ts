 import { useLogsStore } from "@/stores/logs";
 
 const handlePromiseWithLogging = <T>(promise: Promise<T>,title = 'Uncaught') => {
    return promise
      .then(result => {
        logBasedOnType('Resolved', result, title);
        return result;
      })
      .catch(error => {
        logBasedOnType('Rejected', error,title);
        throw error;  // 重新抛出错误以维持 Promise 链的正确性
      });
  };
  
  const logBasedOnType = (status: 'Resolved' | 'Rejected', data: any,title:string) => {
    const logsStore = useLogsStore();
    const logFuncName = status === 'Resolved' ? 'success' : 'error'
    if (typeof data === 'string') {
      if (data.trim().startsWith('<') && data.trim().endsWith('>')) {
        logsStore[logFuncName](`${status}:${title}`, 'XML data detected.');
      } else {
        logsStore[logFuncName](`${status}:${title}`, data);
      }
    } else if (typeof data === 'object') {
      if (Array.isArray(data)) {
        logsStore[logFuncName](`${status}:${title}`, JSON.stringify(data, null, 2)); // 数组
      } else if (data instanceof Error) {
        logsStore.error(`${status}::${title}`, data.message); // 错误对象
      } else {
        logsStore[logFuncName](`${status}:${title}`, JSON.stringify(data, null, 2)); // 对象
      }
    } else if (typeof data === 'function') {
      logsStore[logFuncName](`${status}:${title}`, `Function called ${data.name ? data.name : 'anonymous function'}`);
    } else {
      logsStore[logFuncName](`${status}:${title}`, data); // 其他类型
    }
  };

  export default handlePromiseWithLogging