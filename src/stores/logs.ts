import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useLogsStore = defineStore('logs', () => {
  const content = ref('')

  function error(title:string,msg:string) {
    content.value += `[error] ${title}:${msg}\n`
  }

  function info(title:string,msg:string) {
    content.value += `[info] ${title}:${msg}\n`
  }

  function success(title:string,msg:string) {
    content.value += `[success] ${title}:${msg}\n`
  }

  return { content,error,info,success }
})