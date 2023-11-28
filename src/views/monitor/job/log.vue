<template>
  <div>
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="任务名称" prop="jobName">
        <el-input v-model="queryParams.jobName" placeholder="请输入任务名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="任务组名" prop="jobGroup">
        <el-select v-model="queryParams.jobGroup" placeholder="请选择任务组名" clearable style="width: 240px">
          <el-option v-for="dict in sys_job_group" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="执行状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择执行状态" clearable style="width: 240px">
          <el-option v-for="dict in sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="执行时间" style="width: 300px">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb-2 flex justify-between">
      <el-button v-hasPermi="['monitor:job:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
      <el-button v-hasPermi="['monitor:job:remove']" type="danger" plain icon="Delete" @click="handleClean">清空</el-button>
      <el-button v-hasPermi="['monitor:job:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
      <el-button type="warning" plain icon="Close" @click="handleClose">关闭</el-button>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </div>

    <el-table border v-loading="loading" :data="jobLogList" @selectionChange="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55" />
      <el-table-column align="center" show-overflow-tooltip label="任务名称" prop="jobName" />
      <el-table-column align="center" show-overflow-tooltip label="任务组名" prop="jobGroup">
        <template #default="{row}">
          <dict-tag :options="sys_job_group" :value="row.jobGroup" />
        </template>
      </el-table-column>
      <el-table-column align="center" show-overflow-tooltip label="调用目标字符串" prop="invokeTarget" />
      <el-table-column align="center" show-overflow-tooltip label="日志信息" prop="jobMessage" />
      <el-table-column align="center" show-overflow-tooltip label="执行状态" prop="status">
        <template #default="{row}">
          <dict-tag :options="sys_common_status" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column align="center" show-overflow-tooltip label="执行时间" prop="createTime" width="180" />
      <el-table-column align="center" show-overflow-tooltip label="操作"  :min-width="140">
        <template #default="{ row }">
          <el-button link v-hasPermi="['monitor:job:query']" type="primary" icon="View" @click="handleView(row)">详细</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />

    <!-- 调度日志详细 -->
    <el-dialog v-model="open" title="调度日志详细" width="700px" append-to-body draggable>
      <el-form :model="form" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="日志序号：">{{ form.jobLogId }}</el-form-item>
            <el-form-item label="任务名称：">{{ form.jobName }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务分组：">{{ form.jobGroup }}</el-form-item>
            <el-form-item label="执行时间：">{{ form.createTime }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="调用方法：">{{ form.invokeTarget }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="日志信息：">{{ form.jobMessage }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="执行状态：">
              <div v-if="form.status == 0">正常</div>
              <div v-else-if="form.status == 1">失败</div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item v-if="form.status == 1" label="异常信息：">{{ form.exceptionInfo }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="open = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="JobLog" lang="ts">
import { getJob } from '@/api/monitor/job'
import { listJobLog, delJobLog, cleanJobLog } from '@/api/monitor/jobLog'
import { parseTime } from '@/utils/common'
import { oneOf } from '@zeronejs/utils'

const { proxy } = getCurrentInstance() as ComponentInternalInstance
const { sys_common_status, sys_job_group } = proxy.useDict('sys_common_status', 'sys_job_group')

const jobLogList = ref<any[]>([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const multiple = ref(true)
const total = ref(0)
const dateRange = ref<any>([])
const route = useRoute()

const form = ref<any>({})
const queryParams = ref<any>({ pageNum: 1, pageSize: 10 })


/** 查询调度日志列表 */
async function getList() {
  loading.value = true
  const res: any = await listJobLog(proxy.addDateRange(queryParams.value, dateRange.value))
  jobLogList.value = res.rows
  total.value = res.total
  loading.value = false
}
// 返回按钮
function handleClose() {
  proxy.$tab.closeOpenPage({ path: '/monitor/job' })
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
  handleQuery()
}
// 多选框选中数据
function handleSelectionChange(selection: any[]) {
  ids.value = selection.map(item => item.jobLogId)
  multiple.value = !selection.length
}
/** 详细按钮操作 */
function handleView(row: any) {
  open.value = true
  form.value = row
}
/** 删除按钮操作 */
async function handleDelete() {
  await proxy.$modal.confirm('是否确认删除调度日志编号为"' + ids.value + '"的数据项?')
  await delJobLog(ids.value)
  getList()
  proxy.$modal.msgSuccess('删除成功')
}
/** 清空按钮操作 */
async function handleClean() {
  await proxy.$modal.confirm('是否确认清空所有调度日志数据项?')
  await cleanJobLog()
  getList()
  proxy.$modal.msgSuccess('清空成功')
 
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download('monitor/jobLog/export', queryParams.value, `job_log_${new Date().getTime()}.xlsx`)
}

;(() => {
  const jobId = oneOf(route.params.jobId)
  if (jobId !== undefined && jobId !== '0') {
    getJob(jobId).then(response => {
      queryParams.value.jobName = response.data.jobName
      queryParams.value.jobGroup = response.data.jobGroup
      getList()
    })
  } else {
    getList()
  }
})()

getList()
</script>
