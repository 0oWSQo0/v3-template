<template>
  <transition-group name="fade-transform" mode="out-in">
    <template v-for="(item, index) in tagsViewStore.iframeViews as any" :key="item.path">
      <inner-link v-show="route.path === item.path" :iframeId="'iframe' + index" :src="item.meta.link"></inner-link>
    </template>
  </transition-group>
</template>

<script setup lang="ts">
import InnerLink from '../InnerLink/index.vue'
import useTagsViewStore from '@/store/modules/tagsView'

const route = useRoute()
const tagsViewStore = useTagsViewStore()
</script>
