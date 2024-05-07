<template>
  <!-- 授权用户 -->
  <el-dialog v-model="visible" title="选择用户" width="800px" top="5vh" append-to-body draggable>
    <el-form ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="用户账号" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户账号" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phonenumber">
        <el-input v-model="queryParams.phonenumber" placeholder="请输入手机号码" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-table border ref="refTable" :data="list" height="260px" @rowClick="clickRow" @selectionChange="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column align="center" show-overflow-tooltip label="用户账号" prop="userName" />
        <el-table-column align="center" show-overflow-tooltip label="用户昵称" prop="nickName" />
        <el-table-column align="center" show-overflow-tooltip label="手机" prop="phonenumber" />
        <el-table-column align="center" show-overflow-tooltip label="状态" prop="status">
          <template #default="{ row }">
            <dict-tag :options="sys_normal_disable" :value="row.status" />
          </template>
        </el-table-column>
        <el-table-column align="center" show-overflow-tooltip label="创建时间" prop="createTime" width="170" />
      </el-table>
      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-row>
    <template #footer>
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="handleSelectUser">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup name="SelectUser" lang="ts">
import { authUserSelectAll, unallocatedUserList } from '@/api/system/role'

const props = defineProps({
  roleId: {
    type: [Number, String]
  }
})

const { proxy } = getCurrentInstance() as ComponentInternalInstance

const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

const list = ref<any[]>([])
const visible = ref(false)
const total = ref(0)
const userIds = ref<any[]>([])

const queryParams = reactive<{
  pageNum: number
  pageSize: number
  roleId?: any
  userName?: any
  phonenumber?: any
}>({ pageNum: 1, pageSize: 10 })

// 显示弹框
function show() {
  queryParams.roleId = props.roleId
  getList()
  visible.value = true
}
/**选择行 */
function clickRow(row: any) {
  ;(proxy.$refs['refTable'] as any).toggleRowSelection(row)
}
// 多选框选中数据
function handleSelectionChange(selection: any[]) {
  userIds.value = selection.map(item => item.userId)
}
// 查询表数据
async function getList() {
  const res: any = await unallocatedUserList(queryParams)
  list.value = res.rows
  total.value = res.total
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
const emit = defineEmits(['ok'])
/** 选择授权用户操作 */
async function handleSelectUser() {
  const roleId = queryParams.roleId
  const uIds = userIds.value.join(',')
  if (uIds === '') {
    proxy.$modal.msgError('请选择要分配的用户')
    return
  }
  const res: any = await authUserSelectAll({ roleId: roleId, userIds: uIds })
  proxy.$modal.msgSuccess(res.msg)
  if (res.code === 200) {
    visible.value = false
    emit('ok')
  }
}

defineExpose({
  show
})
</script>
