<template>
  <div>
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="岗位编码" prop="postCode">
        <el-input v-model="queryParams.postCode" placeholder="请输入岗位编码" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="岗位名称" prop="postName">
        <el-input v-model="queryParams.postName" placeholder="请输入岗位名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="岗位状态" clearable style="width: 200px">
          <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb-2 flex justify-between">
      <el-button v-hasPermi="['system:post:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      <el-button v-hasPermi="['system:post:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate">修改</el-button>
      <el-button v-hasPermi="['system:post:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </div>

    <el-table border v-loading="loading" :data="list" @selectionChange="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55" />
      <el-table-column align="center" show-overflow-tooltip label="岗位编码" prop="postCode" />
      <el-table-column align="center" show-overflow-tooltip label="岗位名称" prop="postName" />
      <el-table-column align="center" show-overflow-tooltip label="岗位排序" prop="postSort" />
      <el-table-column align="center" show-overflow-tooltip label="状态" prop="status">
        <template #default="{ row }">
          <dict-tag :options="sys_normal_disable" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column align="center" show-overflow-tooltip label="创建时间" prop="createTime" width="170" />
      <el-table-column align="center" show-overflow-tooltip label="操作" width="160">
        <template #default="{ row }">
          <el-button link v-hasPermi="['system:post:edit']" type="success" icon="Edit" @click="handleUpdate(row)">修改</el-button>
          <el-button link v-hasPermi="['system:post:remove']" type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />

    <!-- 添加或修改岗位对话框 -->
    <el-dialog v-model="open" :title="title" width="500px" append-to-body draggable>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="岗位名称" prop="postName">
          <el-input v-model="form.postName" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item label="岗位编码" prop="postCode">
          <el-input v-model="form.postCode" placeholder="请输入编码名称" />
        </el-form-item>
        <el-form-item label="岗位顺序" prop="postSort">
          <el-input-number class="!w-full" v-model="form.postSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="岗位状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" show-word-limit maxlength="200" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Post" lang="ts">
import { listPost, addPost, delPost, getPost, updatePost } from '@/api/system/post'

const { proxy } = getCurrentInstance()
const formRef = ref<FormInstance>()
const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

const list = ref<any[]>([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')

const form = ref<any>({})
const queryParams = ref<any>({ pageNum: 1, pageSize: 10 })
const rules = ref<any>({
  postName: [{ required: true, message: '岗位名称不能为空', trigger: 'change' }],
  postCode: [{ required: true, message: '岗位编码不能为空', trigger: 'change' }],
  postSort: [{ required: true, message: '岗位顺序不能为空', trigger: 'change' }]
})

/** 查询岗位列表 */
async function getList() {
  loading.value = true
  const res: any = await listPost(queryParams.value)
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
  proxy.resetForm('queryRef')
  handleQuery()
}
/** 多选框选中数据 */
function handleSelectionChange(selection: any[]) {
  ids.value = selection.map(item => item.postId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}
/** 表单重置 */
function reset() {
  form.value = { postSort: 0, status: '0' }
  proxy.resetForm('formRef')
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
  const res = await getPost(row.postId || ids.value)
  form.value = res.data
  open.value = true
  title.value = '修改'
}
/** 提交按钮 */
async function submitForm() {
  await formRef.value.validate()
  if (form.value.postId !== undefined) {
    await updatePost(form.value)
    proxy.$modal.msgSuccess('修改成功')
  } else {
    await addPost(form.value)
    proxy.$modal.msgSuccess('新增成功')
  }
  open.value = false
  getList()
}
/** 删除按钮操作 */
async function handleDelete(row: any) {
  await proxy.$modal.confirm('是否确认删除岗位?')
  await delPost(row.postId || ids.value)
  proxy.$modal.msgSuccess('删除成功')
  getList()
}

getList()
</script>
