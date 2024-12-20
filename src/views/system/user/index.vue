<template>
  <div>
    <el-form class="queryForm" v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="用户账号" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户账号" clearable maxlength="30" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phonenumber">
        <el-input v-model="queryParams.phonenumber" placeholder="请输入手机号码" clearable maxlength="30" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="用户状态" clearable>
          <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
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
      <el-button v-hasPermi="['system:user:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      <el-button v-hasPermi="['system:user:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate">修改</el-button>
      <el-button v-hasPermi="['system:user:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </div>

    <el-table border show-overflow-tooltip v-loading="loading" :data="list" @selectionChange="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column align="center" label="用户账号" prop="userName" />
      <el-table-column align="center" label="用户昵称" prop="nickName" />
      <el-table-column align="center" label="KEY编码" prop="keyCode" width="160" />
      <el-table-column align="center" label="手机号码" prop="phonenumber" width="120" />
      <el-table-column align="center" label="状态">
        <template #default="{ row }">
          <el-switch v-model="row.status" active-value="0" inactive-value="1" @change="handleStatusChange(row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" prop="createTime" width="170" />
      <el-table-column align="center" label="操作" width="300">
        <template #default="{ row }">
          <template v-if="row.userId !== 1">
            <el-button link v-if="!needKey" type="primary" icon="Key" @click="handleResetPwd(row)">重置口令</el-button>
            <el-button link v-if="needKey" type="primary" icon="Key" @click="handleResetPin(row)">重置PIN码</el-button>
            <el-button link v-hasPermi="['system:user:edit']" type="primary" icon="Edit" @click="handleUpdate(row)">修改</el-button>
            <el-button link v-hasPermi="['system:user:remove']" type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog v-model="open" :title="title" width="600px" append-to-body draggable>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户昵称" prop="nickName">
          <el-input v-model="form.nickName" placeholder="请输入用户昵称" maxlength="30" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select class="w-full" v-model="form.roleIds" multiple placeholder="请选择角色">
            <el-option v-for="item in roleOptions" :key="item.roleId" :label="item.roleName" :value="item.roleId" :disabled="item.status == 1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.userId == undefined" label="用户账号" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入用户账号" maxlength="30" />
        </el-form-item>
        <el-form-item v-if="form.userId == undefined" label="用户口令" prop="password">
          <el-input v-model="form.password" placeholder="请输入用户口令" type="password" show-password autocomplete="new-password" maxlength="30" />
        </el-form-item>
        <el-form-item v-if="form.userId == undefined" label="确认口令" prop="checkPassword">
          <el-input v-model="form.checkPassword" placeholder="请输入确认口令" type="password" show-password autocomplete="new-password" maxlength="30" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phonenumber">
          <el-input v-model="form.phonenumber" placeholder="请输入手机号码" maxlength="11" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" show-word-limit maxlength="200" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </template>
    </el-dialog>

    <ResetPinModal ref="resetPinRef" />
    <ResetPwdModal ref="resetPwdRef" />
  </div>
</template>

<script setup name="User" lang="ts">
import { changeUserStatus, listUser, delUser, getUser, updateUser, addUser } from '@/api/system/user'
import { Regular } from '@/utils/validate'
import ResetPinModal from './resetPinModal.vue'
import ResetPwdModal from './resetPwdModal.vue'
import useAppStore from '@/store/modules/app'
import { CheckKeyStatus, GetKeyInfo } from '@/utils/BHA'
import { sm3 } from 'sm-crypto'

const needKey = useAppStore().needKey
const { proxy } = getCurrentInstance()
const formRef = ref<any>()
const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

/**
 * 列表
 */
const list = ref<any[]>([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const dateRange = ref<any>([])
const queryParams = ref<any>({})

async function getList() {
  loading.value = true
  const res: any = await listUser(proxy.addDateRange(queryParams.value, dateRange.value))
  loading.value = false
  list.value = res.rows
  total.value = res.total
}
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
function resetQuery() {
  dateRange.value = []
  queryParams.value = {}
  proxy.resetForm('queryRef')
  handleQuery()
}
function handleSelectionChange(selection: any[]) {
  ids.value = selection.map(item => item.userId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/**
 * 新增修改
 */
const open = ref(false)
const title = ref('')
const roleOptions = ref<any[]>([])
const form = ref<any>({})
const rules = ref<any>({
  userName: [
    { required: true, message: '用户账号不能为空' },
    { min: 4, max: 20, message: '用户账号长度必须介于 4~20 个字符之间' },
    { pattern: Regular.Account_number(), message: '用户名账号以字母开头，只能包含字母、数字和下划线' }
  ],
  roleIds: [{ required: true, message: '用户角色不能为空' }],
  nickName: [
    { required: true, message: '用户昵称不能为空' },
    { min: 2, max: 20, message: '用户昵称长度必须介于 2~20 个字符之间' }
  ],
  password: [
    { required: true, message: '用户口令不能为空' },
    { pattern: Regular.checkPin(), message: '口令应包含字母、数字、特殊字符，长度为8~20个字符' }
  ],
  checkPassword: [
    { required: true, message: '确认口令不能为空' },
    { pattern: Regular.checkPin(), message: '确认口令应包含字母、数字、特殊字符，长度为8~20个字符' },
    {
      validator: (rule, value, callback) => {
        if (form.value.password !== value) {
          callback(new Error('两次输入的口令不一致'))
        } else {
          callback()
        }
      }
    }
  ],
  phonenumber: [{ pattern: Regular.Mobile_number_China_easy, message: '请输入正确的手机号码' }]
})
function reset() {
  form.value = {
    status: '0',
    postIds: [],
    roleIds: []
  }
  proxy.resetForm('formRef')
}
function cancel() {
  open.value = false
  reset()
}
async function handleAdd() {
  reset()
  const response: any = await getUser()
  roleOptions.value = response.roles
  open.value = true
  title.value = '新增'
}
async function handleUpdate(row: any) {
  reset()
  const response: any = await getUser(row.userId || ids.value)
  form.value = response.data
  roleOptions.value = response.roles
  form.value.roleIds = response.roleIds
  open.value = true
  title.value = '修改'
  form.value.password = ''
}
async function submit() {
  await formRef.value.validate()
  if (form.value.userId) {
    await updateUser(form.value)
    proxy.$modal.msgSuccess('修改成功')
  } else {
    await addUser({ ...form.value, password: sm3(form.value.password) })
    proxy.$modal.msgSuccess('新增成功')
  }
  open.value = false
  getList()
}

/**
 * 删除
 * @param row
 */
async function handleDelete(row: any) {
  const userIds = row.userId || ids.value
  await proxy.$modal.confirm('是否确认删除数据项？')
  await delUser(userIds)
  getList()
  proxy.$modal.msgSuccess('删除成功')
}

/** 用户状态修改  */
async function handleStatusChange(row: any) {
  let text = row.status === '0' ? '启用' : '停用'
  try {
    await proxy.$modal.confirm('确认要"' + text + '""' + row.userName + '"用户吗?')
    await changeUserStatus(row.userId, row.status)
    proxy.$modal.msgSuccess(text + '成功')
  } catch (e: any) {
    row.status = row.status === '0' ? '1' : '0'
  }
}

/**
 * 重置
 */
const resetPwdRef = ref()
async function handleResetPwd(row: any) {
  resetPwdRef.value.show(row)
}
const resetPinRef = ref()
async function handleResetPin(row: any) {
  const { serialnumber } = await GetKeyInfo(needKey ? 1 : 0)
  if (serialnumber != row.keyCode) {
    proxy.$modal.msgError('非当前用户UKEY')
    return
  }
  resetPinRef.value.show(row)
}

getList()
</script>
