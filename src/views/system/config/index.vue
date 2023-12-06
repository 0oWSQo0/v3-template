<template>
  <div>
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="参数名称" prop="configName">
        <el-input v-model="queryParams.configName" placeholder="请输入参数名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="参数键名" prop="configKey">
        <el-input v-model="queryParams.configKey" placeholder="请输入参数键名" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="系统内置" prop="configType">
        <el-select v-model="queryParams.configType" placeholder="系统内置" clearable style="width: 200px">
          <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" style="width: 300px">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb-2 flex justify-between">
      <el-button plain type="primary" icon="Plus" v-hasPermi="['system:config:add']" @click="handleAdd">新增</el-button>
      <el-button plain type="success" icon="Edit" v-hasPermi="['system:config:edit']" :disabled="single" @click="handleUpdate">修改</el-button>
      <el-button plain type="danger" icon="Delete" v-hasPermi="['system:config:remove']" :disabled="multiple" @click="handleDelete">删除</el-button>
      <el-button plain type="danger" icon="Refresh" v-hasPermi="['system:config:remove']" @click="handleRefreshCache">刷新缓存</el-button>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </div>

    <el-table border v-loading="loading" :data="configList" @selectionChange="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column align="center" show-overflow-tooltip label="参数名称" prop="configName" width="220" />
      <el-table-column align="center" show-overflow-tooltip label="参数键名" prop="configKey" />
      <el-table-column align="center" show-overflow-tooltip label="参数键值" prop="configValue" />
      <el-table-column align="center" show-overflow-tooltip label="系统内置" prop="configType" width="80">
        <template #default="{ row }">
          <dict-tag :options="sys_yes_no" :value="row.configType" />
        </template>
      </el-table-column>
      <el-table-column align="center" show-overflow-tooltip label="备注" prop="remark" />
      <el-table-column align="center" show-overflow-tooltip label="创建时间" prop="createTime" width="170" />
      <el-table-column align="center" show-overflow-tooltip label="操作" width="140">
        <template #default="{ row }">
          <el-button link v-hasPermi="['system:config:edit']" type="primary" icon="Edit" @click="handleUpdate(row)">修改</el-button>
          <el-button link v-hasPermi="['system:config:remove']" type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog v-model="open" :title="title" width="500px" append-to-body draggable>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="参数名称" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入参数名称" />
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey">
          <el-input v-model="form.configKey" placeholder="请输入参数键名" />
        </el-form-item>
        <el-form-item label="参数键值" prop="configValue">
          <el-input v-model="form.configValue" placeholder="请输入参数键值" />
        </el-form-item>
        <el-form-item label="系统内置" prop="configType">
          <el-radio-group v-model="form.configType">
            <el-radio v-for="dict in sys_yes_no" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Config" lang="ts">
import { listConfig, getConfig, delConfig, addConfig, updateConfig, refreshCache } from '@/api/system/config'

const { proxy } = getCurrentInstance() as ComponentInternalInstance
const formRef = ref<FormInstance>()
const { sys_yes_no } = proxy.useDict('sys_yes_no')

const configList = ref<any[]>([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const dateRange = ref<any>([])

const form = ref<any>({})
const queryParams = ref<any>({ pageNum: 1, pageSize: 10 })
const rules = ref<any>({
  configName: [{ required: true, message: '参数名称不能为空', trigger: 'change' }],
  configKey: [{ required: true, message: '参数键名不能为空', trigger: 'change' }],
  configValue: [{ required: true, message: '参数键值不能为空', trigger: 'change' }]
})

/** 查询参数列表 */
async function getList() {
  loading.value = true
  const res: any = await listConfig(proxy.addDateRange(queryParams.value, dateRange.value))
  configList.value = res.rows
  total.value = res.total
  loading.value = false
}
/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}
/** 表单重置 */
function reset() {
  form.value = { configType: 'Y' }
  proxy.resetForm('formRef')
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
/** 多选框选中数据 */
function handleSelectionChange(selection: any[]) {
  ids.value = selection.map(item => item.configId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '新增'
}
/** 修改按钮操作 */
async function handleUpdate(row: any) {
  reset()
  const res: any = await getConfig(row.configId || ids.value)
  form.value = res.data
  open.value = true
  title.value = '修改'
}
/** 提交按钮 */
async function submitForm() {
  await formRef.value.validate()
  if (form.value.configId) {
    await updateConfig(form.value)
    proxy.$modal.msgSuccess('修改成功')
  } else {
    await addConfig(form.value)
    proxy.$modal.msgSuccess('新增成功')
  }
  open.value = false
  getList()
}
/** 删除按钮操作 */
async function handleDelete(row: any) {
  await proxy.$modal.confirm('是否确认删除数据项？')
  await delConfig(row.configId || ids.value)
  getList()
  proxy.$modal.msgSuccess('删除成功')
}
/** 刷新缓存按钮操作 */
async function handleRefreshCache() {
  await refreshCache()
  proxy.$modal.msgSuccess('刷新缓存成功')
}

getList()
</script>
