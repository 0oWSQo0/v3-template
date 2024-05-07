<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <el-card class="box-card" header="个人信息">
          <div class="text-center">
            <userAvatar :user="state.user" />
          </div>
          <el-descriptions border :column="1">
            <el-descriptions-item>
              <template #label> <svg-icon icon-class="user" />用户账号 </template>
              <div class="pull-right">{{ state.user.userName }}</div>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label> <svg-icon icon-class="phone" />手机号码 </template>
              <div class="pull-right">{{ state.user.phonenumber }}</div>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label> <svg-icon icon-class="email" />用户邮箱 </template>
              <div class="pull-right">{{ state.user.email }}</div>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label> <svg-icon icon-class="tree" />所属部门 </template>
              <div v-if="state.user.dept" class="pull-right">{{ state.user.dept.deptName }} / {{ state.postGroup }}</div>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label> <svg-icon icon-class="peoples" />所属角色 </template>
              <div class="pull-right">{{ state.roleGroup }}</div>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label> <svg-icon icon-class="date" />创建日期 </template>
              <div class="pull-right">{{ state.user.createTime }}</div>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card header="基本资料">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <userInfo :user="state.user" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <resetPwd />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Profile" lang="ts">
import userAvatar from './userAvatar.vue'
import userInfo from './userInfo.vue'
import resetPwd from './resetPwd.vue'
import { getUserProfile } from '@/api/system/user'

const activeTab = ref('userinfo')
const state = reactive<{
  user: any
  roleGroup: any
  postGroup: any
}>({
  user: {},
  roleGroup: {},
  postGroup: {}
})

async function getUser() {
  const res: any = await getUserProfile()
  state.user = res.data
  state.roleGroup = res.roleGroup
  state.postGroup = res.postGroup
}

getUser()
</script>
