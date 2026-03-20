<script setup lang="ts">
import '../assets/css/main.css'

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
