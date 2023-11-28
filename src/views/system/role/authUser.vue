<template>
  <div>
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="用户名称" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phonenumber">
        <el-input v-model="queryParams.phonenumber" placeholder="请输入手机号码" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb-2 flex justify-between">
      <el-button v-hasPermi="['system:role:add']" type="primary" plain icon="Plus" @click="openSelectUser">添加用户</el-button>
      <el-button v-hasPermi="['system:role:remove']" type="danger" plain icon="CircleClose" :disabled="multiple" @click="cancelAuthUserAll">批量取消授权</el-button>
      <el-button type="warning" plain icon="Close" @click="handleClose">关闭</el-button>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </div>

    <el-table border v-loading="loading" :data="userList" @selectionChange="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55" />
      <el-table-column align="center" label="用户名称" prop="userName" show-overflow-tooltip />
      <el-table-column align="center" label="用户昵称" prop="nickName" show-overflow-tooltip />
      <el-table-column align="center" label="邮箱" prop="email" show-overflow-tooltip />
      <el-table-column align="center" label="手机" prop="phonenumber" show-overflow-tooltip />
      <el-table-column align="center" label="状态" prop="status">
        <template #default="{row}">
          <dict-tag :options="sys_normal_disable" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" prop="createTime" width="170" />
      <el-table-column align="center" label="操作"  :min-width="140">
        <template #default="{row}">
          <el-button v-hasPermi="['system:role:remove']" link type="primary" icon="CircleClose" @click="cancelAuthUser(row)">取消授权</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    <select-user ref="selectRef" :roleId="queryParams.roleId" @ok="handleQuery" />
  </div>
</template>

<script setup name="AuthUser" lang="ts">
import selectUser from './selectUser.vue'
import { allocatedUserList, authUserCancel, authUserCancelAll } from '@/api/system/role'

const route = useRoute()
const { proxy } = getCurrentInstance() as ComponentInternalInstance
const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

const userList = ref<any[]>([])
const loading = ref(true)
const showSearch = ref(true)
const multiple = ref(true)
const total = ref(0)
const userIds = ref<any[]>([])

const queryParams = reactive<{
  pageNum: number
  pageSize: number
  roleId: any
  userName?: any
  phonenumber?: any
}>({ pageNum: 1, pageSize: 10, roleId: route.params.roleId })

/** 查询授权用户列表 */
async function getList() {
  loading.value = true
  const res: any = await allocatedUserList(queryParams)
  userList.value = res.rows
  total.value = res.total
  loading.value = false
}
// 返回按钮
function handleClose() {
  const obj = { path: '/system/role' }
  proxy.$tab.closeOpenPage(obj)
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}
// 多选框选中数据
function handleSelectionChange(selection: any[]) {
  userIds.value = selection.map(item => item.userId)
  multiple.value = !selection.length
}
/** 打开授权用户表弹窗 */
function openSelectUser() {
  ;(proxy.$refs['selectRef'] as any).show()
}
/** 取消授权按钮操作 */
async function cancelAuthUser(row: any) {
  await proxy.$modal.confirm('确认要取消该用户"' + row.userName + '"角色吗？')
  await authUserCancel({ userId: row.userId, roleId: queryParams.roleId })
  getList()
  proxy.$modal.msgSuccess('取消授权成功')
}
/** 批量取消授权按钮操作 */
async function cancelAuthUserAll() {
  const uIds = userIds.value.join(',')
  await proxy.$modal.confirm('是否取消选中用户授权数据项?')
  await authUserCancelAll({ roleId: queryParams.roleId, userIds: uIds })
  getList()
  proxy.$modal.msgSuccess('取消授权成功')
}

getList()
</script>
