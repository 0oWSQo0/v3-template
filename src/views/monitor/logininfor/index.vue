<template>
  <div>
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="登录地址" prop="ipaddr">
        <el-input v-model="queryParams.ipaddr" placeholder="请输入登录地址" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="用户账号" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户账号" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="登录状态" clearable style="width: 240px">
          <el-option v-for="dict in sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="登录时间" style="width: 300px">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD HH:mm:ss" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb-2 flex justify-between">
      <el-button v-hasPermi="['monitor:logininfor:unlock']" type="primary" plain icon="Unlock" :disabled="single" @click="handleUnlock">解锁</el-button>
      <el-button v-hasPermi="['monitor:logininfor:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </div>

    <el-table border ref="tableRef" v-loading="loading" :data="list" :default-sort="defaultSort" @selectionChange="handleSelectionChange" @sortChange="handleSortChange">
      <el-table-column align="center" type="selection" width="55" />
      <el-table-column align="center" show-overflow-tooltip label="用户账号" prop="userName" sortable="custom" :sort-orders="['descending', 'ascending']" />
      <el-table-column align="center" show-overflow-tooltip label="地址" prop="ipaddr" />
      <el-table-column align="center" show-overflow-tooltip label="登录地点" prop="loginLocation" />
      <el-table-column align="center" show-overflow-tooltip label="操作系统" prop="os" />
      <el-table-column align="center" show-overflow-tooltip label="浏览器" prop="browser" />
      <el-table-column align="center" show-overflow-tooltip label="登录状态" prop="status" width="80">
        <template #default="{ row }">
          <dict-tag :options="sys_common_status" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column align="center" show-overflow-tooltip label="描述" prop="msg" />
      <el-table-column align="center" show-overflow-tooltip label="访问时间" prop="loginTime" sortable="custom" :sort-orders="['descending', 'ascending']" width="170" />
    </el-table>

    <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
  </div>
</template>

<script setup name="Logininfor" lang="ts">
import { listLogininfor, unlockLogininfor } from '@/api/monitor/logininfor'
import { Sort } from 'element-plus/es/components/table/src/table/defaults'

const { proxy } = getCurrentInstance()
const { sys_common_status } = proxy.useDict('sys_common_status')

const tableRef = ref<any>()
const list = ref<any[]>([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const selectName = ref<any>('')
const total = ref(0)
const dateRange = ref<any>([])
const defaultSort = ref<Sort>({ prop: 'loginTime', order: 'descending' })

// 查询参数
const queryParams = ref<any>({ pageNum: 1, pageSize: 10 })

/** 查询登录日志列表 */
async function getList() {
  loading.value = true
  const res: any = await listLogininfor(proxy.addDateRange(queryParams.value, dateRange.value))
  list.value = res.rows
  total.value = res.total
  loading.value = false
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  proxy.resetForm('queryRef')
  queryParams.value.pageNum = 1
  tableRef.value.sort(defaultSort.value.prop, defaultSort.value.order)
}
/** 多选框选中数据 */
function handleSelectionChange(selection: any[]) {
  ids.value = selection.map(item => item.infoId)
  multiple.value = !selection.length
  single.value = selection.length !== 1
  selectName.value = selection.map(item => item.userName)
}
/** 排序触发事件 */
function handleSortChange(column: any) {
  queryParams.value.orderByColumn = column.prop
  queryParams.value.isAsc = column.order
  getList()
}

/** 解锁按钮操作 */
async function handleUnlock() {
  const username = selectName.value
  await proxy.$modal.confirm('是否确认解锁用户"' + username + '"数据项?')
  await unlockLogininfor(username)
  proxy.$modal.msgSuccess('用户' + username + '解锁成功')
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download('monitor/logininfor/export', { ...queryParams.value }, `config_${new Date().getTime()}.xlsx`)
}

getList()
</script>
