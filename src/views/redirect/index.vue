<template>
  <div></div>
</template>

<script setup lang="ts">
const router = useRouter()
const { params, query } = useRoute()
const { path } = params

router.replace({ path: '/' + path, query })
</script>
