<script setup lang="ts">

const { loadToken } = useAuth()

onMounted(() => {
  loadToken()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
