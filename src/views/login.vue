<template>
  <div class="login">
    <h2 class="text-center mb-4 text-5xl tracking-wider">后台管理系统</h2>
    <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="p-6 shadow-lg rounded-lg w-96 shadow-gray-800">
      <el-form-item prop="username">
        <el-input class="group" v-model="loginForm.username" type="text" size="large" auto-complete="off" autofocus placeholder="请输入账号">
          <template #prefix><i-material-symbols-light-account-circle-outline :class="['group-has-[:focus]:text-[' + styles.baseColor + ']']" style="font-size: 20px" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="pin" v-if="needKey">
        <el-input class="group" v-model="loginForm.pin" type="password" size="large" auto-complete="off" placeholder="请输入口令" @keyup.enter="handleLogin">
          <template #prefix><i-material-symbols-light-lock-outline :class="['group-has-[:focus]:text-[' + styles.baseColor + ']']" style="font-size: 20px" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password" v-else>
        <el-input class="group" v-model="loginForm.password" type="password" size="large" auto-complete="off" placeholder="请输入密码" @keyup.enter="handleLogin">
          <template #prefix><i-material-symbols-light-lock-outline :class="['group-has-[:focus]:text-[' + styles.baseColor + ']']" style="font-size: 20px" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaEnabled">
        <el-input class="group" v-model="loginForm.code" size="large" auto-complete="off" placeholder="请输入验证码" style="width: 67%" @keyup.enter="handleLogin">
          <template #prefix><i-material-symbols-light-verified-user-outline :class="['group-has-[:focus]:text-[' + styles.baseColor + ']']" style="font-size: 20px" /></template>
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
      <a href="/static/SKFServiceSetupV1.07.exe" download="skf_1.07.exe">UKEY管理工具下载</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCodeImg, isNeedKey, randomString16 } from '@/api/login'
import useUserStore from '@/store/modules/user'
import useAppStore from '@/store/modules/app'
import { useRouter } from 'vue-router'
import { FormInstance } from 'element-plus'
import { useStorage } from '@vueuse/core'
import { GetKeyInfo, GenerateRandom, SM2WithSM3 } from '@/utils/BHA'
import { Base64 } from 'js-base64'
import styles from '@/assets/styles/variables.module.scss'
import { getConfigKey } from '@/api/system/config'
import { sm3 } from 'sm-crypto'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const loginForm = ref<any>({})

const loginRules = {
  username: [{ required: true, message: '请输入您的账号' }],
  password: [{ required: true, message: '请输入您的密码' }],
  code: [{ required: true, message: '请输入验证码' }]
}

const codeUrl = ref('')
const loading = ref(false)
// 验证码开关
const captchaEnabled = ref(true)
const redirect = ref<any>(route.query.redirect)
const loginRef = ref<FormInstance>()
const needKey = ref(false)
const showChangePinModal = ref(false)
const title = useAppStore().title

async function handleLogin() {
  await loginRef.value?.validate()
  needKey.value ? ukeyLogin() : generalLogin()
}

/**
 * 普通登录方式
 */
const generalLogin = async () => {
  loading.value = true
  // 调用action的登录方法
  try {
    // $2a$10$snICntqtHEJ.5wVnpXvxZOIL40QgGAV/afjFt4r0/MBPjNnCmpwUe
    const obj = { ...loginForm.value, password: sm3(loginForm.value.password) }
    await userStore.login(obj)
    router.push({ path: redirect.value || '/' })
  } catch (e: any) {
    loading.value = false
    // 重新获取验证码
    captchaEnabled.value && getCode()
  }
}

/**
 * BHA ukey登录
 */
const ukeyLogin = async () => {
  loading.value = true
  try {
    const { serialnumber } = await GetKeyInfo()
    // 拼随机数
    const randomA = await GenerateRandom({ len: 16 })
    const arr1 = [],
      arr2 = []
    for (let ch of Base64.atob(randomA)) {
      arr1.push(ch.codePointAt(0))
    }
    const randomB = await randomString16({ keyCode: serialnumber })
    for (let ch of Base64.atob(randomB.data)) {
      arr2.push(ch.codePointAt(0))
    }
    const buffer = new Uint8Array([...arr1, ...arr2])
    const randomAB = Base64.fromUint8Array(buffer)
    const sm2 = await SM2WithSM3({ appName: 'user', containerName: 'user', indata: randomAB, userPin: loginForm.value.pin })
    const obj = {
      ...loginForm,
      keyCode: serialnumber,
      randomA,
      randomB,
      randomAB,
      signData: sm2
    }
    const res = await userStore.login(obj)
    // 首次登录的用户需要修改PIN码
    if (res.modify != 1) {
      showChangePinModal.value = true
    } else {
      router.push({ path: redirect.value || '/' })
    }
  } catch (e: any) {
    loading.value = false
    // 重新获取验证码
    captchaEnabled.value && getCode()
  }
}
/**
 * 获取验证码
 */
async function getCode() {
  const res: any = await getCodeImg()
  captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
  if (captchaEnabled.value) {
    codeUrl.value = 'data:image/gif;base64,' + res.img
    loginForm.value.uuid = res.uuid
  }
}
/**
 * 初始化登录方式
 */
const init = async () => {
  const { msg }: any = await getConfigKey('sys.isNeedKey')
  needKey.value = msg === 'true'
}

getCode()
// init()
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
