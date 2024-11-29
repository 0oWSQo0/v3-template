<template>
  <el-dialog title="重置 PIN 码" v-model="open" width="440px" append-to-body draggable>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="PIN 码" prop="pin">
        <el-input v-model="form.pin" show-password placeholder="请输入 PIN 码" />
      </el-form-item>
      <el-form-item label="确认 PIN 码" prop="checkPin">
        <el-input v-model="form.checkPin" show-password placeholder="请输入确认 PIN 码" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="open = false">取 消</el-button>
      <el-button type="primary" @click="submit" :loading="loading">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ResetPin } from '@/utils/BHA'
import { Regular } from '@/utils/validate'
import useAppStore from '@/store/modules/app'

const needKey = useAppStore().needKey
const { proxy } = getCurrentInstance()
const form = ref<any>({})
const formRef = ref()
const rules = ref<any>({
  pin: [
    { required: true, message: 'PIN 码不能为空' },
    { pattern: Regular.checkPin(), message: 'PIN码应包含字母、数字、特殊字符，长度为8~20个字符' }
  ],
  checkPin: [
    { required: true, message: '请输入确认 PIN 码' },
    {
      validator: (rule, value, callback) => {
        if (form.value.pin !== value) {
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
    await ResetPin({ newPin: form.value.pin, appName: 'user', index: needKey ? 1 : 0 })
    proxy.$modal.msgSuccess('PIN 码重置成功')
    open.value = false
  } finally {
    loading.value = false
  }
}

// 显示弹框
async function show(row: any) {
  form.value = {}
  proxy.resetForm('formRef')
  form.value = row
  open.value = true
}

defineExpose({
  show
})
</script>
