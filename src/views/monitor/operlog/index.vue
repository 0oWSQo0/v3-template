<template>
  <div>
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="系统模块" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入系统模块" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="操作人员" prop="operName">
        <el-input v-model="queryParams.operName" placeholder="请输入操作人员" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="类型" prop="businessType">
        <el-select v-model="queryParams.businessType" placeholder="操作类型" clearable style="width: 240px">
          <el-option v-for="dict in sys_oper_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="操作状态" clearable style="width: 240px">
          <el-option v-for="dict in sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作时间" style="width: 300px">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD HH:mm:ss" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb-2 flex justify-between">
      <el-button v-hasPermi="['monitor:operlog:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </div>

    <el-table border ref="operlogRef" v-loading="loading" :data="list" :default-sort="defaultSort" @selectionChange="handleSelectionChange" @sortChange="handleSortChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="系统模块" align="center" prop="title" show-overflow-tooltip />
      <el-table-column label="操作类型" align="center" prop="businessType">
        <template #default="{ row }">
          <dict-tag :options="sys_oper_type" :value="row.businessType" />
        </template>
      </el-table-column>
      <el-table-column label="操作人员" align="center" width="110" prop="operName" show-overflow-tooltip sortable="custom" :sort-orders="['descending', 'ascending']" />
      <el-table-column label="主机" align="center" prop="operIp" width="150" show-overflow-tooltip />
      <el-table-column label="操作状态" align="center" prop="status" width="80">
        <template #default="{ row }">
          <dict-tag :options="sys_common_status" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作日期" align="center" prop="operTime" sortable="custom" :sort-orders="['descending', 'ascending']" width="170" />
      <el-table-column label="消耗时间" align="center" prop="costTime" width="110" show-overflow-tooltip sortable="custom" :sort-orders="['descending', 'ascending']">
        <template #default="{ row }">
          <span>{{ row.costTime }}毫秒</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="90">
        <template #default="scope">
          <el-button v-hasPermi="['monitor:operlog:query']" link type="primary" icon="View" @click="handleView(scope.row)">详细</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />

    <!-- 操作日志详细 -->
    <el-dialog v-model="open" title="操作日志详细" width="700px" append-to-body draggable>
      <el-descriptions border :column="2">
        <el-descriptions-item label-class-name="w-20" label="操作模块">{{ form.title }} / {{ typeFormat(form) }}</el-descriptions-item>
        <el-descriptions-item label-class-name="w-20" label="请求地址">{{ form.operUrl }}</el-descriptions-item>
        <el-descriptions-item label-class-name="w-20" label="登录信息">{{ form.operName }} / {{ form.operIp }} / {{ form.operLocation }}</el-descriptions-item>
        <el-descriptions-item label-class-name="w-20" label="请求方式">{{ form.requestMethod }}</el-descriptions-item>
        <el-descriptions-item label-class-name="w-20" label="操作方法" :span="2">{{ form.method }}</el-descriptions-item>
        <el-descriptions-item label-class-name="w-20" label="请求参数" :span="2">{{ form.operParam }}</el-descriptions-item>
        <el-descriptions-item label-class-name="w-20" label="返回参数" :span="2">{{ form.jsonResult }}</el-descriptions-item>
        <el-descriptions-item label-class-name="w-20" label="操作状态"
          ><div v-if="form.status === 0">正常</div>
          <div v-else-if="form.status === 1">失败</div></el-descriptions-item
        >
        <el-descriptions-item label-class-name="w-20" label="消耗时间">{{ form.costTime }}毫秒</el-descriptions-item>
        <el-descriptions-item label-class-name="w-20" label="操作时间">{{ form.operTime }}</el-descriptions-item>
        <el-descriptions-item label-class-name="w-20" v-if="form.status === 1" label="异常信息">{{ form.errorMsg }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="open = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Operlog" lang="ts">
import { listOperlog } from '@/api/monitor/operlog'
import { Sort } from 'element-plus/es/components/table/src/table/defaults'

const { proxy } = getCurrentInstance()
const { sys_oper_type, sys_common_status } = proxy.useDict('sys_oper_type', 'sys_common_status')

const operlogRef = ref()
const list = ref<any[]>([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const multiple = ref(true)
const total = ref(0)
const dateRange = ref<any>([])
const defaultSort = ref<Sort>({ prop: 'operTime', order: 'descending' })

const form = ref<any>({})
const queryParams = ref<any>({ pageNum: 1, pageSize: 10 })

/** 查询登录日志 */
async function getList() {
  loading.value = true
  const res: any = await listOperlog(proxy.addDateRange(queryParams.value, dateRange.value))
  list.value = res.rows
  total.value = res.total
  loading.value = false
}
/** 操作日志类型字典翻译 */
function typeFormat(row: any) {
  return proxy.selectDictLabel(sys_oper_type.value, row.businessType)
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
  operlogRef.value.sort(defaultSort.value.prop, defaultSort.value.order)
}
/** 多选框选中数据 */
function handleSelectionChange(selection: any[]) {
  ids.value = selection.map(item => item.operId)
  multiple.value = !selection.length
}
/** 排序触发事件 */
function handleSortChange(column: any) {
  queryParams.value.orderByColumn = column.prop
  queryParams.value.isAsc = column.order
  getList()
}
/** 详细按钮操作 */
function handleView(row: any) {
  open.value = true
  form.value = row
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('monitor/operlog/export', { ...queryParams.value }, `config_${new Date().getTime()}.xlsx`)
}

getList()
</script>
