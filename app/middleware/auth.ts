export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const token = localStorage.getItem('token')
  const route = useRoute()

  if (!token) {
    return navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
  }
})