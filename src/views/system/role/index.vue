<template>
  <div>
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="queryParams.roleName" placeholder="请输入角色名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="权限字符" prop="roleKey">
        <el-input v-model="queryParams.roleKey" placeholder="请输入权限字符" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="角色状态" clearable style="width: 200px">
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
      <el-button v-hasPermi="['system:role:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      <el-button v-hasPermi="['system:role:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate">修改</el-button>
      <el-button v-hasPermi="['system:role:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </div>

    <!-- 表格数据 -->
    <el-table border v-loading="loading" :data="list" @selectionChange="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55" />
      <el-table-column align="center" show-overflow-tooltip label="角色名称" prop="roleName" width="150" />
      <el-table-column align="center" show-overflow-tooltip label="权限字符" prop="roleKey" width="150" />
      <el-table-column align="center" show-overflow-tooltip label="显示顺序" prop="roleSort" width="100" />
      <el-table-column align="center" show-overflow-tooltip label="状态" width="100">
        <template #default="{ row }">
          <el-switch v-model="row.status" active-value="0" inactive-value="1" @change="handleStatusChange(row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column align="center" show-overflow-tooltip label="创建时间" prop="createTime" width="170" />
      <el-table-column align="center" show-overflow-tooltip label="操作" :min-width="140">
        <template #default="{ row }">
          <el-tooltip v-if="row.roleId !== 1" content="修改" placement="top">
            <el-button link v-hasPermi="['system:role:edit']" type="success" icon="Edit" @click="handleUpdate(row)"></el-button>
          </el-tooltip>
          <el-tooltip v-if="row.roleId !== 1" content="删除" placement="top">
            <el-button link v-hasPermi="['system:role:remove']" type="danger" icon="Delete" @click="handleDelete(row)"></el-button>
          </el-tooltip>
          <el-tooltip v-if="row.roleId !== 1" content="数据权限" placement="top">
            <el-button link v-hasPermi="['system:role:edit']" type="primary" icon="CircleCheck" @click="handleDataScope(row)"></el-button>
          </el-tooltip>
          <el-tooltip v-if="row.roleId !== 1" content="分配用户" placement="top">
            <el-button link v-hasPermi="['system:role:edit']" type="primary" icon="User" @click="handleAuthUser(row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog v-model="open" :title="title" width="500px" append-to-body draggable>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item prop="roleKey">
          <template #label>
            <span>
              <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
              权限字符
            </span>
          </template>
          <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
        </el-form-item>
        <el-form-item label="角色顺序" prop="roleSort">
          <el-input-number class="!w-full" v-model="form.roleSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">展开/折叠</el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">全选/全不选</el-checkbox>
          <el-checkbox v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">父子联动</el-checkbox>
          <el-tree
            ref="menuRef"
            class="border w-full rounded"
            :data="menuOptions"
            show-checkbox
            node-key="id"
            :check-strictly="!form.menuCheckStrictly"
            empty-text="加载中，请稍候"
            :props="{ label: 'label', children: 'children' }"
          ></el-tree>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" show-word-limit maxlength="200" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 分配角色数据权限对话框 -->
    <el-dialog v-model="openDataScope" :title="title" width="500px" append-to-body draggable>
      <el-form :model="form" label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="form.roleName" :disabled="true" />
        </el-form-item>
        <el-form-item label="权限字符">
          <el-input v-model="form.roleKey" :disabled="true" />
        </el-form-item>
        <el-form-item label="权限范围">
          <el-select v-model="form.dataScope" @change="dataScopeSelectChange">
            <el-option v-for="item in dataScopeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-show="form.dataScope == 2" label="数据权限">
          <el-checkbox v-model="deptExpand" @change="handleCheckedTreeExpand($event, 'dept')">展开/折叠</el-checkbox>
          <el-checkbox v-model="deptNodeAll" @change="handleCheckedTreeNodeAll($event, 'dept')">全选/全不选</el-checkbox>
          <el-checkbox v-model="form.deptCheckStrictly" @change="handleCheckedTreeConnect($event, 'dept')">父子联动</el-checkbox>
          <el-tree
            ref="deptRef"
            class="border w-full rounded"
            :data="deptOptions"
            show-checkbox
            default-expand-all
            node-key="id"
            :check-strictly="!form.deptCheckStrictly"
            empty-text="加载中，请稍候"
            :props="{ label: 'label', children: 'children' }"
          ></el-tree>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelDataScope">取 消</el-button>
        <el-button type="primary" @click="submitDataScope">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Role" lang="ts">
import { addRole, changeRoleStatus, dataScope, delRole, getRole, listRole, updateRole, deptTreeSelect } from '@/api/system/role'
import { roleMenuTreeselect, treeselect as menuTreeselect } from '@/api/system/menu'
import { FormInstance } from 'element-plus'

const router = useRouter()
const { proxy } = getCurrentInstance() as ComponentInternalInstance
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
const dateRange = ref<any>([])
const menuOptions = ref<any[]>([])
const menuExpand = ref(false)
const menuNodeAll = ref(false)
const deptExpand = ref(true)
const deptNodeAll = ref(false)
const deptOptions = ref<any[]>([])
const openDataScope = ref(false)
const menuRef = ref<any>(null)
const deptRef = ref<any>(null)

/** 数据范围选项*/
const dataScopeOptions = ref([
  { value: '1', label: '全部数据权限' },
  { value: '2', label: '自定数据权限' },
  { value: '3', label: '本部门数据权限' },
  { value: '4', label: '本部门及以下数据权限' },
  { value: '5', label: '仅本人数据权限' }
])

const form = ref<any>({})
const queryParams = ref<any>({ pageNum: 1, pageSize: 10 })
const rules = ref<any>({
  roleName: [{ required: true, message: '角色名称不能为空', trigger: 'change' }],
  roleKey: [{ required: true, message: '权限字符不能为空', trigger: 'change' }],
  roleSort: [{ required: true, message: '角色顺序不能为空', trigger: 'change' }]
})

/** 查询角色列表 */
async function getList() {
  loading.value = true
  const res: any = await listRole(proxy.addDateRange(queryParams.value, dateRange.value))
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
  handleQuery()
}
/** 删除按钮操作 */
async function handleDelete(row: any) {
  const roleIds = row.roleId || ids.value
  await proxy.$modal.confirm('是否确认删除角色数据项?')
  await delRole(roleIds)
  getList()
  proxy.$modal.msgSuccess('删除成功')
}
/** 多选框选中数据 */
function handleSelectionChange(selection: any[]) {
  ids.value = selection.map(item => item.roleId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 角色状态修改 */
async function handleStatusChange(row: any) {
  let text = row.status === '0' ? '启用' : '停用'
  try {
    await proxy.$modal.confirm('确认要"' + text + '""' + row.roleName + '"角色吗?')
    await changeRoleStatus(row.roleId, row.status)
    proxy.$modal.msgSuccess(text + '成功')
  } catch (e) {
    row.status = row.status === '0' ? '1' : '0'
  }
}
/** 分配用户 */
function handleAuthUser(row: any) {
  router.push('/system/role-auth/user/' + row.roleId)
}
/** 查询菜单树结构 */
async function getMenuTreeselect() {
  const res = await menuTreeselect()
  menuOptions.value = res.data
}
/** 所有部门节点数据 */
function getDeptAllCheckedKeys() {
  // 目前被选中的部门节点
  let checkedKeys = deptRef.value.getCheckedKeys()
  // 半选中的部门节点
  let halfCheckedKeys = deptRef.value.getHalfCheckedKeys()
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
  return checkedKeys
}
/** 重置新增的表单以及其他数据  */
function reset() {
  if (menuRef.value) {
    menuRef.value.setCheckedKeys([])
  }
  menuExpand.value = false
  menuNodeAll.value = false
  deptExpand.value = true
  deptNodeAll.value = false
  form.value = {
    roleSort: 0,
    status: '0',
    menuIds: [],
    deptIds: [],
    menuCheckStrictly: true,
    deptCheckStrictly: true
  }
  proxy.resetForm('formRef')
}
/** 添加角色 */
function handleAdd() {
  reset()
  getMenuTreeselect()
  open.value = true
  title.value = '新增'
}
/** 修改角色 */
async function handleUpdate(row: any) {
  reset()
  const roleId = row.roleId || ids.value
  const response: any = await getRole(roleId)
  form.value = response.data
  form.value.roleSort = Number(form.value.roleSort)
  open.value = true
  nextTick(async () => {
    const res: any = await getRoleMenuTreeselect(roleId)
    let checkedKeys = res.checkedKeys
    checkedKeys.forEach((v: any) => {
      nextTick(() => {
        menuRef.value.setChecked(v, true, false)
      })
    })
  })
  title.value = '修改'
}
/** 根据角色ID查询菜单树结构 */
async function getRoleMenuTreeselect(roleId: any) {
  const res: any = await roleMenuTreeselect(roleId)
  menuOptions.value = res.menus
  return res
}
/** 根据角色ID查询部门树结构 */
async function getDeptTree(roleId: any) {
  const res: any = await deptTreeSelect(roleId)
  deptOptions.value = res.depts
  return res
}
/** 树权限（展开/折叠）*/
function handleCheckedTreeExpand(value: any, type: any) {
  if (type === 'menu') {
    let treeList = menuOptions.value
    for (let i = 0; i < treeList.length; i++) {
      menuRef.value.store.nodesMap[treeList[i].id].expanded = value
    }
  } else if (type === 'dept') {
    let treeList = deptOptions.value
    for (let i = 0; i < treeList.length; i++) {
      deptRef.value.store.nodesMap[treeList[i].id].expanded = value
    }
  }
}
/** 树权限（全选/全不选） */
function handleCheckedTreeNodeAll(value: any, type: string) {
  if (type === 'menu') {
    menuRef.value.setCheckedNodes(value ? menuOptions.value : [])
  } else if (type === 'dept') {
    deptRef.value.setCheckedNodes(value ? deptOptions.value : [])
  }
}
/** 树权限（父子联动） */
function handleCheckedTreeConnect(value: any, type: string) {
  if (type === 'menu') {
    form.value.menuCheckStrictly = value ? true : false
  } else if (type === 'dept') {
    form.value.deptCheckStrictly = value ? true : false
  }
}
/** 所有菜单节点数据 */
function getMenuAllCheckedKeys() {
  // 目前被选中的菜单节点
  let checkedKeys = menuRef.value.getCheckedKeys()
  // 半选中的菜单节点
  let halfCheckedKeys = menuRef.value.getHalfCheckedKeys()
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
  return checkedKeys
}
/** 提交按钮 */
async function submitForm() {
  await formRef.value.validate()
  form.value.menuIds = getMenuAllCheckedKeys()
  if (form.value.roleId !== undefined) {
    await updateRole(form.value)
    proxy.$modal.msgSuccess('修改成功')
  } else {
    await addRole(form.value)
    proxy.$modal.msgSuccess('新增成功')
  }
  open.value = false
  getList()
}
/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}
/** 选择角色权限范围触发 */
function dataScopeSelectChange(value: any) {
  if (value !== '2') {
    deptRef.value.setCheckedKeys([])
  }
}
/** 分配数据权限操作 */
async function handleDataScope(row: any) {
  reset()
  const response: any = await getRole(row.roleId)
  form.value = response.data
  openDataScope.value = true
  nextTick(async () => {
    const res: any = await getDeptTree(row.roleId)
    nextTick(() => {
      if (deptRef.value) {
        deptRef.value.setCheckedKeys(res.checkedKeys)
      }
    })
  })
  title.value = '分配数据权限'
}
/** 提交按钮（数据权限） */
async function submitDataScope() {
  if (!form.value.roleId) return false
  form.value.deptIds = getDeptAllCheckedKeys()
  await dataScope(form.value)
  proxy.$modal.msgSuccess('修改成功')
  openDataScope.value = false
  getList()
}
/** 取消按钮（数据权限）*/
function cancelDataScope() {
  openDataScope.value = false
  reset()
}

getList()
</script>
