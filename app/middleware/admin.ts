export default defineNuxtRouteMiddleware(() => {
    if (import.meta.server) return

    const role = localStorage.getItem('role')

    if (!role) {
        return navigateTo('/login', { replace: true })
    }

    if (role !== 'admin') {
        return navigateTo('/', { replace: true })
    }
})
