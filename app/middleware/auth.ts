export default defineNuxtRouteMiddleware((to) => {
    if (import.meta.server) return

    const accessToken = localStorage.getItem('accessToken')

    if (!accessToken) {
        return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
})
