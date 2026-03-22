export const useAuth = () => {
    const accessToken = useState<string | null>('accessToken', () => null)
    const refreshToken = useState<string | null>('refreshToken', () => null)

    const setTokens = (access: string, refresh: string) => {
        accessToken.value = access
        refreshToken.value = refresh

        if (import.meta.client) {
            localStorage.setItem('accessToken', access)
            localStorage.setItem('refreshToken', refresh)
        }
    }

    const loadTokens = () => {
        if (!import.meta.client) return

        accessToken.value = localStorage.getItem('accessToken')
        refreshToken.value = localStorage.getItem('refreshToken')
    }

    const clearTokens = () => {
        accessToken.value = null
        refreshToken.value = null

        if (import.meta.client) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('token')
        }
    }

    const logout = async () => {
        try {
            const config = useRuntimeConfig()
            const apiBase = config.public.apiBase
            const token = import.meta.client ? localStorage.getItem('accessToken') : null

            if (token) {
                await $fetch(`${apiBase}/api/logout`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
            }
        } catch {
            // 忽略后端退出异常
        } finally {
            clearTokens()

            if (import.meta.client) {
                window.location.href = `/login?t=${Date.now()}`
            }
        }
    }

    return {
        accessToken,
        refreshToken,
        setTokens,
        loadTokens,
        clearTokens,
        logout
    }
}
