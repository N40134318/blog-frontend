export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const token = localStorage.getItem('token')

  const publicPages = ['/login', '/register']

  if (!token && !publicPages.includes(to.path)) {
    return navigateTo('/login')
  }
})