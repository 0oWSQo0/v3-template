<template>
  <div class="login">
    <h2 class="text-center mb-4 text-5xl tracking-wider">后台管理系统</h2>
    <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="p-6 shadow-lg rounded-lg w-96 shadow-gray-800">
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" type="text" size="large" placeholder="请输入账号">
          <template #prefix><i-material-symbols-light-account-circle-outline style="font-size: 20px" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="loginForm.password" type="password" size="large" auto-complete="new-password" show-password placeholder="请输入密码" @keyup.enter="handleLogin">
          <template #prefix><i-material-symbols-light-lock-outline style="font-size: 20px" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaEnabled">
        <el-input v-model="loginForm.code" size="large" placeholder="请输入验证码" style="width: 67%" @keyup.enter="handleLogin">
          <template #prefix><i-material-symbols-light-verified-user-outline style="font-size: 20px" /></template>
        </el-input>
        <div class="h-10 float-right w-[33%]">
          <img :src="codeUrl" @click="getCode" class="pl-2 cursor-pointer h-10" />
        </div>
      </el-form-item>

      <el-button :loading="loading" size="large" type="primary" style="width: 100%" @click.prevent="handleLogin">
        <span v-if="!loading">登 录</span>
        <span v-else>登 录 中...</span>
      </el-button>
    </el-form>
    <!--  底部  -->
    <div class="text-xs text-white bottom-2 fixed">
      <!-- <span>Copyright © 2018-2024 WSQ All Rights Reserved.</span> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCodeImg } from '@/api/login'
import useUserStore from '@/store/modules/user'
import { useRouter } from 'vue-router'
import { FormInstance } from 'element-plus'

const userStore = useUserStore()
const router = useRouter()
const loginForm = ref<any>({})

const loginRules = {
  username: [{ required: true, trigger: 'change', message: '请输入您的账号' }],
  password: [{ required: true, trigger: 'change', message: '请输入您的密码' }],
  code: [{ required: true, trigger: 'change', message: '请输入验证码' }]
}

const codeUrl = ref('')
const loading = ref(false)
// 验证码开关
const captchaEnabled = ref(true)
const redirect = ref(undefined)
const loginRef = ref<FormInstance>()

async function handleLogin() {
  await loginRef.value?.validate()
  loading.value = true
  // 调用action的登录方法
  try {
    await userStore.login(loginForm.value)
    router.push({ path: redirect.value || '/' })
  } catch (e: any) {
    loading.value = false
    // 重新获取验证码
    if (captchaEnabled.value) {
      getCode()
    }
  }
}

async function getCode() {
  const res: any = await getCodeImg()
  captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
  if (captchaEnabled.value) {
    codeUrl.value = 'data:image/gif;base64,' + res.img
    loginForm.value.uuid = res.uuid
  }
}

getCode()
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url('../assets/images/background.jpg');
  background-size: cover;
}
</style>
