<template>
  <el-dialog title="生成证书请求" v-model="open" width="400px" append-to-body draggable>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="PIN 码" prop="pin">
        <el-input v-model="form.pin" show-password placeholder="请输入 PIN 码" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="open = false">取 消</el-button>
      <el-button type="primary" @click="submit" :loading="loading">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { GenerateCSR, GetKeyInfo, WriteFile } from '@/utils/BHA'
import useAppStore from '@/store/modules/app'
import { bindUKey } from '@/api/system/user'
import { downloadFile } from '@/utils/request'

const { proxy } = getCurrentInstance()
const emit = defineEmits(['submit'])
const form = ref<any>({})
const formRef = ref()
const rules = ref<any>({
  pin: [
    { required: true, message: 'PIN码不能为空' },
    { min: 8, max: 20, message: 'PIN码长度为 8~20 个字符' }
  ]
})
const open = ref(false)
const loading = ref(false)
const needKey = useAppStore().needKey

const submit = async () => {
  await formRef.value.validate()
  loading.value = true
  try {
    const params = { index: needKey ? 1 : 0, appName: 'user', userPin: form.value.pin, userName: form.value.userName, containerName: 'user' }
    const crt = await GenerateCSR(params)
    const { serialnumber } = await GetKeyInfo(needKey ? 1 : 0)
    const { data } = await bindUKey({ crt, keyCode: serialnumber, userId: form.value.userId, userName: form.value.userName })
    await WriteFile({ appName: 'user', filename: 'pkey', data, userPin: form.value.pin })
    proxy.$modal.msgSuccess('生成成功')
    downloadFile('/system/secure/cert/download?id=' + data.id)
    open.value = false
    emit('submit')
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
