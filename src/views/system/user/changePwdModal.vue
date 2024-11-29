<template>
  <el-dialog title="修改口令" v-model="open" width="440px" append-to-body draggable>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="旧口令" prop="oldPwd">
        <el-input v-model="form.oldPwd" show-password maxlength="20" placeholder="请输入旧口令" />
      </el-form-item>
      <el-form-item label="新口令" prop="newPwd">
        <el-input v-model="form.newPwd" show-password placeholder="请输入新口令" />
      </el-form-item>
      <el-form-item label="确认口令" prop="checkPwd">
        <el-input v-model="form.checkPwd" show-password placeholder="请输入确认口令" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="open = false">取 消</el-button>
      <el-button type="primary" @click="submit" :loading="loading">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { updateUserPwd } from '@/api/system/user'
import { Regular } from '@/utils/validate'
import { sm3 } from 'sm-crypto'

const { proxy } = getCurrentInstance()
const props = defineProps(['currentItem'])
const form = ref<any>({})
const formRef = ref()
const rules = ref<any>({
  oldPwd: [
    { required: true, message: '旧口令不能为空' },
    { pattern: Regular.checkPin(), message: '口令应包含字母、数字、特殊字符，长度为8~20个字符' }
  ],
  newPwd: [
    { required: true, message: '新口令不能为空' },
    { pattern: Regular.checkPin(), message: '新口令应包含字母、数字、特殊字符，长度为8~20个字符' }
  ],
  checkPwd: [
    { required: true, message: '请输入确认口令' },
    {
      validator: (rule, value, callback) => {
        if (form.value.newPwd !== value) {
          callback(new Error('两次输入的口令不一致'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
})
const open = ref(false)
const loading = ref(false)

const submit = async () => {
  await formRef.value.validate()
  loading.value = true
  try {
    await updateUserPwd(sm3(form.value.oldPwd), sm3(form.value.newPwd))
    proxy.$modal.msgSuccess('修改成功')
    open.value = false
  } finally {
    loading.value = false
  }
}

// 显示弹框
function show() {
  form.value = {}
  proxy.resetForm('formRef')
  console.log(sm3('admin123'))
  open.value = true
}

defineExpose({
  show
})
</script>
