export const useAuth = () => {
  const token = useState<string | null>('token', () => null)

  const setToken = (t: string) => {
    token.value = t
    localStorage.setItem('token', t)
  }

  const loadToken = () => {
    const t = localStorage.getItem('token')
    if (t) {
      token.value = t
    }
  }

  const clearToken = () => {
    token.value = null
    localStorage.removeItem('token')
  }

  const logout = () => {
    token.value = null
    localStorage.removeItem('token')
    return navigateTo('/login')
  }

  return {
    token,
    setToken,
    loadToken,
    clearToken,
    logout
  }
}