<template>
  <el-dialog title="导入用户证书" v-model="open" width="500px" append-to-body draggable>
    <el-upload
      style="text-align: center; width: 100%"
      ref="uploadRef"
      :limit="1"
      accept=".cert"
      :data="upload.data"
      :headers="upload.headers"
      :action="upload.url"
      :disabled="upload.isUploading"
      :on-progress="() => (upload.isUploading = true)"
      :on-success="handleFileSuccess"
      :on-error="handleFileError"
      :auto-upload="true"
      :with-credentials="true"
      :show-file-list="false"
      drag
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处，或
        <em>点击上传</em>
        <div>请上传证书请求文件</div>
      </div>
      <template #tip>
        <div class="text-red-500 mt-2">提示：仅允许导入“cert”格式文件！</div>
      </template>
    </el-upload>
  </el-dialog>
</template>

<script setup lang="ts">
import { getToken } from '@/utils/auth'

const { proxy } = getCurrentInstance()
const emit = defineEmits(['submit'])
const form = ref<any>({})
const open = ref(false)

const upload = ref<any>({
  url: import.meta.env.VITE_APP_BASE_API + '/system/secure/cert/upload',
  isUploading: false,
  data: {},
  headers: { Authorization: 'Bearer ' + getToken() }
})
const uploadRef = ref()

const handleFileSuccess = () => {
  proxy.$modal.msgSuccess('导入成功')
  open.value = false
  upload.value.isUploading = false
  uploadRef.value.clearFiles()
  emit('submit')
}
const handleFileError = () => {
  proxy.$modal.msgError('导入失败')
  upload.value.isUploading = false
  uploadRef.value.clearFiles()
}

// 显示弹框
function show(row: any) {
  form.value = {}
  proxy.resetForm('formRef')
  form.value = row
  open.value = true
}

defineExpose({
  show
})
</script>
