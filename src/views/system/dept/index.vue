<template>
  <div>
    <el-form class="queryForm" v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="部门名称" prop="deptName">
        <el-input v-model="queryParams.deptName" placeholder="请输入部门名称" clearable @keyup.enter="getList" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="部门状态" clearable>
          <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="getList">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb-2 flex justify-between">
      <el-button plain type="primary" icon="Plus" v-hasPermi="['system:dept:add']" @click="handleAdd">新增</el-button>
      <el-button plain type="info" icon="Sort" @click="toggleExpandAll">展开/折叠</el-button>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </div>

    <el-table border v-if="refreshTable" v-loading="loading" :data="list" row-key="deptId" :default-expand-all="isExpandAll" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
      <el-table-column prop="deptName" label="部门名称" width="260"></el-table-column>
      <el-table-column align="center" show-overflow-tooltip prop="orderNum" label="排序" width="200"></el-table-column>
      <el-table-column align="center" show-overflow-tooltip prop="status" label="状态" width="100">
        <template #default="{ row }">
          <dict-tag :options="sys_normal_disable" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column align="center" show-overflow-tooltip label="创建时间" prop="createTime" width="170" />
      <el-table-column align="center" show-overflow-tooltip label="操作" :min-width="140">
        <template #default="{ row }">
          <el-button link type="primary" icon="Plus" v-hasPermi="['system:dept:add']" @click="handleAdd(row)">新增</el-button>
          <el-button link type="success" icon="Edit" v-hasPermi="['system:dept:edit']" @click="handleUpdate(row)">修改</el-button>
          <el-button link type="danger" icon="Delete" v-if="row.parentId != 0" v-hasPermi="['system:dept:remove']" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改部门对话框 -->
    <el-dialog v-model="open" :title="title" width="600px" append-to-body draggable>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col v-if="form.parentId !== 0" :span="24">
            <el-form-item label="上级部门" prop="parentId">
              <el-tree-select
                class="!w-full"
                v-model="form.parentId"
                :data="deptOptions"
                :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
                value-key="deptId"
                placeholder="选择上级部门"
                check-strictly
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门名称" prop="deptName">
              <el-input v-model="form.deptName" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number class="!w-full" v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="leader">
              <el-input v-model="form.leader" placeholder="请输入负责人" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Dept" lang="ts">
import { listDept, getDept, delDept, addDept, updateDept, listDeptExcludeChild } from '@/api/system/dept'
import { FormInstance } from 'element-plus'

const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

/**
 * 列表
 */
const list = ref<any[]>([])
const loading = ref(true)
const showSearch = ref(true)
const isExpandAll = ref(true)
const refreshTable = ref(true)
const queryParams = ref<any>({})

async function getList() {
  loading.value = true
  const res: any = await listDept(queryParams.value)
  list.value = proxy.handleTree(res.data, 'deptId')
  loading.value = false
}

function resetQuery() {
  proxy.resetForm('queryRef')
  getList()
}

/**
 * 新增修改
 */
const formRef = ref<FormInstance>()
const open = ref(false)
const title = ref('')
const form = ref<any>({})
const rules = ref<any>({
  parentId: [{ required: true, message: '上级部门不能为空', trigger: 'change' }],
  deptName: [{ required: true, message: '部门名称不能为空', trigger: 'change' }],
  orderNum: [{ required: true, message: '显示排序不能为空', trigger: 'change' }],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'change' }],
  phone: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'change' }]
})
const deptOptions = ref<any[]>([])

function cancel() {
  open.value = false
  reset()
}

function reset() {
  form.value = { orderNum: 0, status: '0' }
  proxy.resetForm('formRef')
}

async function handleAdd(row: any) {
  reset()
  const res: any = await listDept()
  deptOptions.value = proxy.handleTree(res.data, 'deptId')
  if (row !== undefined) {
    form.value.parentId = row.deptId
  }
  open.value = true
  title.value = '新增'
}

async function handleUpdate(row: any) {
  reset()
  const res: any = await listDeptExcludeChild(row.deptId)
  deptOptions.value = proxy.handleTree(res.data, 'deptId')
  const response: any = await getDept(row.deptId)
  form.value = response.data
  open.value = true
  title.value = '修改'
}

async function submitForm() {
  await formRef.value.validate()
  if (form.value.deptId !== undefined) {
    await updateDept(form.value)
    proxy.$modal.msgSuccess('修改成功')
  } else {
    await addDept(form.value)
    proxy.$modal.msgSuccess('新增成功')
  }
  open.value = false
  getList()
}
/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}

/**
 * 删除
 */
async function handleDelete(row: any) {
  await proxy.$modal.confirm('是否确认删除名称为"' + row.deptName + '"的数据项?')
  await delDept(row.deptId)
  proxy.$modal.msgSuccess('删除成功')
  getList()
}

getList()
</script>
