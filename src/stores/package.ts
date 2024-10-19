import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import  type PackageItem from '@/types/PackageItem'

export const useCounterStore = defineStore('package', () => {

  const packageList = reactive<PackageItem[]>([])

  const reloadList = () => {

  }

  return { packageList, reloadList }
})