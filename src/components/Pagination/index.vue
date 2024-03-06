<template>
  <div :class="{ hidden: hidden }" class="p-2 my-1 flex justify-end">
    <el-pagination
      small
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :background="background"
      :layout="layout"
      :page-sizes="pageSizes"
      :pager-count="pagerCount"
      :total="total"
      @sizeChange="handleSizeChange"
      @currentChange="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { scrollTo } from '@/utils/scroll-to'

interface IProps {
  total: number
  page?: number
  limit?: number
  pageSizes?: number[]
  pagerCount?: number
  layout?: string
  background?: boolean
  autoScroll?: boolean
  hidden?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  page: 1,
  limit: 20,
  pageSizes: () => [10, 20, 30, 50],
  pagerCount: document.body.clientWidth < 992 ? 5 : 7,
  layout: 'total, sizes, prev, pager, next, jumper',
  background: true,
  autoScroll: true,
  hidden: false
})

const emit = defineEmits(['update:page', 'update:limit', 'pagination'])
const currentPage = computed({
  get() {
    return props.page
  },
  set(val) {
    emit('update:page', val)
  }
})
const pageSize = computed({
  get() {
    return props.limit
  },
  set(val) {
    emit('update:limit', val)
  }
})
function handleSizeChange(val: number) {
  if (currentPage.value * val > props.total) {
    currentPage.value = 1
  }
  emit('pagination', { page: currentPage.value, limit: val })
  props.autoScroll && scrollTo(0, 800)
}
function handleCurrentChange(val: number) {
  emit('pagination', { page: val, limit: pageSize.value })
  props.autoScroll && scrollTo(0, 800)
}
</script>
