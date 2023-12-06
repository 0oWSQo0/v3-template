<template>
  <div>
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="字典名称" prop="dictType">
        <el-select v-model="queryParams.dictType" style="width: 200px">
          <el-option v-for="item in typeOptions" :key="item.dictId" :label="item.dictName" :value="item.dictType" />
        </el-select>
      </el-form-item>
      <el-form-item label="字典标签" prop="dictLabel">
        <el-input v-model="queryParams.dictLabel" placeholder="请输入字典标签" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="数据状态" clearable style="width: 200px">
          <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb-2 flex justify-between">
      <el-button v-hasPermi="['system:dict:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      <el-button v-hasPermi="['system:dict:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate">修改</el-button>
      <el-button v-hasPermi="['system:dict:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
      <el-button type="warning" plain icon="Close" @click="handleClose">关闭</el-button>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </div>

    <el-table border v-loading="loading" :data="dataList" @selectionChange="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55" />
      <el-table-column align="center" show-overflow-tooltip label="字典标签" prop="dictLabel">
        <template #default="{ row }">
          <span v-if="row.listClass == '' || row.listClass == 'default'">{{ row.dictLabel }}</span>
          <el-tag v-else :type="row.listClass == 'primary' ? '' : row.listClass">{{ row.dictLabel }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" show-overflow-tooltip label="字典键值" prop="dictValue" />
      <el-table-column align="center" show-overflow-tooltip label="字典排序" prop="dictSort" />
      <el-table-column align="center" show-overflow-tooltip label="状态" prop="status">
        <template #default="{ row }">
          <dict-tag :options="sys_normal_disable" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column align="center" show-overflow-tooltip label="备注" prop="remark" />
      <el-table-column align="center" show-overflow-tooltip label="创建时间" prop="createTime" width="170" />
      <el-table-column align="center" show-overflow-tooltip label="操作" :min-width="140">
        <template #default="{ row }">
          <el-button link v-hasPermi="['system:dict:edit']" type="success" icon="Edit" @click="handleUpdate(row)">修改</el-button>
          <el-button link v-hasPermi="['system:dict:remove']" type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog v-model="open" :title="title" width="500px" append-to-body draggable>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="字典类型">
          <el-input v-model="form.dictType" :disabled="true" />
        </el-form-item>
        <el-form-item label="数据标签" prop="dictLabel">
          <el-input v-model="form.dictLabel" placeholder="请输入数据标签" />
        </el-form-item>
        <el-form-item label="数据键值" prop="dictValue">
          <el-input v-model="form.dictValue" placeholder="请输入数据键值" />
        </el-form-item>
        <el-form-item label="样式属性" prop="cssClass">
          <el-input v-model="form.cssClass" placeholder="请输入样式属性" />
        </el-form-item>
        <el-form-item label="显示排序" prop="dictSort">
          <el-input-number class="!w-full" v-model="form.dictSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="回显样式" prop="listClass">
          <el-select class="w-full" v-model="form.listClass">
            <el-option v-for="item in listClassOptions" :key="item.value" :label="item.label + '(' + item.value + ')'" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
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

<script setup name="Data" lang="ts">
import useDictStore from '@/store/modules/dict'
import { optionselect as getDictOptionselect, getType } from '@/api/system/dict/type'
import { listData, getData, delData, addData, updateData } from '@/api/system/dict/data'
import { FormInstance } from 'element-plus/es/components/form'

const { proxy } = getCurrentInstance()
const formRef = ref<FormInstance>()
const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

const dataList = ref<any[]>([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const defaultDictType = ref('')
const typeOptions = ref<any[]>([])
const route = useRoute()
// 数据标签回显样式
const listClassOptions = ref([
  { value: 'default', label: '默认' },
  { value: 'primary', label: '主要' },
  { value: 'success', label: '成功' },
  { value: 'info', label: '信息' },
  { value: 'warning', label: '警告' },
  { value: 'danger', label: '危险' }
])

const form = ref<any>({})
const queryParams = ref<any>({ pageNum: 1, pageSize: 10 })
const rules = ref<any>({
  dictLabel: [{ required: true, message: '数据标签不能为空', trigger: 'change' }],
  dictValue: [{ required: true, message: '数据键值不能为空', trigger: 'change' }],
  dictSort: [{ required: true, message: '数据顺序不能为空', trigger: 'change' }]
})

/** 查询字典类型详细 */
async function getTypes(dictId: any) {
  const res: any = await getType(dictId)
  queryParams.value.dictType = res.data.dictType
  defaultDictType.value = res.data.dictType
  getList()
}
/** 查询字典类型列表 */
async function getTypeList() {
  const res = await getDictOptionselect()
  typeOptions.value = res.data
}
/** 查询字典数据列表 */
async function getList() {
  loading.value = true
  const res: any = await listData(queryParams.value)
  dataList.value = res.rows
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
  form.value = {
    listClass: 'default',
    dictSort: 0,
    status: '0'
  }
  proxy.resetForm('formRef')
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 返回按钮操作 */
function handleClose() {
  const obj = { path: '/system/dict' }
  proxy.$tab.closeOpenPage(obj)
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef')
  queryParams.value.dictType = defaultDictType
  handleQuery()
}
/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '新增'
  form.value.dictType = queryParams.value.dictType
}
/** 多选框选中数据 */
function handleSelectionChange(selection: any[]) {
  ids.value = selection.map(item => item.dictCode)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 修改按钮操作 */
async function handleUpdate(row: any) {
  reset()
  const res: any = await getData(row.dictCode || ids.value)
  form.value = res.data
  open.value = true
  title.value = '修改'
}
/** 提交按钮 */
async function submitForm() {
  await formRef.value.validate()
  if (form.value.dictCode !== undefined) {
    await updateData(form.value)
    proxy.$modal.msgSuccess('修改成功')
  } else {
    await addData(form.value)
    proxy.$modal.msgSuccess('新增成功')
  }
  useDictStore().removeDict(queryParams.value.dictType)
  open.value = false
  getList()
}
/** 删除按钮操作 */
async function handleDelete(row: any) {
  await proxy.$modal.confirm('是否确认删除字典数据项？')
  await delData(row.dictCode || ids.value)
  getList()
  proxy.$modal.msgSuccess('删除成功')
  useDictStore().removeDict(queryParams.value.dictType)
}

getTypes(route.params && route.params.dictId)
getTypeList()
</script>
