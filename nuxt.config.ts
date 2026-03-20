declare const process: {
  env: Record<string, string | undefined>
}

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Rainstorm Dev Platform',
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080'
    }
  },
  vite: {
    server: {
      allowedHosts: ['dev.rainstorm.space']
    }
  },
  modules: ['@nuxtjs/tailwindcss']
})