<template>
  <el-dialog title="重置口令" v-model="open" width="440px" append-to-body draggable>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="新口令" prop="password">
        <el-input v-model="form.password" show-password placeholder="请输入新口令" />
      </el-form-item>
      <el-form-item label="确认口令" prop="checkPassword">
        <el-input v-model="form.checkPassword" show-password placeholder="请输入确认口令" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="open = false">取 消</el-button>
      <el-button type="primary" @click="submit" :loading="loading">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { resetUserPwd } from '@/api/system/user'
import { Regular } from '@/utils/validate'

const { proxy } = getCurrentInstance()
const form = ref<any>({})
const formRef = ref()
const rules = ref<any>({
  password: [
    { required: true, message: '口令不能为空' },
    { pattern: Regular.checkPin(), message: '口令应包含字母、数字、特殊字符，长度为8~20个字符' }
  ],
  checkPassword: [
    { required: true, message: '请输入确认口令' },
    {
      validator: (rule, value, callback) => {
        if (form.value.password !== value) {
          callback(new Error('两次输入的口令不一致'))
        } else {
          callback()
        }
      }
    }
  ]
})
const open = ref(false)
const loading = ref(false)

const submit = async () => {
  await formRef.value.validate()
  loading.value = true
  try {
    await resetUserPwd(form.value.userId, form.value.password)
    proxy.$modal.msgSuccess('重置口令成功')
    open.value = false
  } finally {
    loading.value = false
  }
}

// 显示弹框
function show(row: any) {
  form.value = {}
  proxy.resetForm('formRef')
  form.value = row
  open.value = true
}

defineExpose({ show })
</script>
