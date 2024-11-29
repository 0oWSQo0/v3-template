<template>
  <el-dialog title="修改 PIN 码" v-model="open" width="440px" append-to-body draggable>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="旧 PIN 码" prop="oldPin">
        <el-input show-password v-model="form.oldPin" maxlength="20" placeholder="请输入旧 PIN 码" />
      </el-form-item>
      <el-form-item label="新PIN码" prop="newPin">
        <el-input show-password v-model="form.newPin" placeholder="请输入新 PIN 码" />
      </el-form-item>
      <el-form-item label="确认 PIN 码" prop="checkPin">
        <el-input show-password v-model="form.checkPin" placeholder="请输入确认 PIN 码" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="open = false">取 消</el-button>
      <el-button type="primary" @click="submit" :loading="loading">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ChangePin, GetKeyInfo } from '@/utils/BHA'
import { Regular } from '@/utils/validate'

const { proxy } = getCurrentInstance()
const form = ref<any>({})
const formRef = ref()
const rules = ref<any>({
  oldPin: [{ required: true, message: '旧 PIN 码不能为空' }],
  newPin: [
    { required: true, message: 'PIN 码不能为空' },
    { pattern: Regular.checkPin(), message: 'PIN码应包含字母、数字、特殊字符，长度为8~20个字符' }
  ],
  checkPin: [
    { required: true, message: '请输入确认 PIN 码' },
    {
      validator: (rule, value, callback) => {
        if (form.value.newPin !== value) {
          callback(new Error('两次输入的 PIN 码不一致'))
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
    await ChangePin({ newPin: form.value.newPin, oldPin: form.value.oldPin, appName: 'user' })
    proxy.$modal.msgSuccess('PIN 码修改成功')
    open.value = false
  } finally {
    loading.value = false
  }
}

// 显示弹框
async function show() {
  form.value = {}
  proxy.resetForm('formRef')

  open.value = true
}

defineExpose({
  show
})
</script>
