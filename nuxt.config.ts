declare const process: {
    env: Record<string, string | undefined>
}

export default defineNuxtConfig({
    css: ['@/assets/css/main.css'],
    runtimeConfig: {
        public: {
            appName:
                process.env.NUXT_PUBLIC_APP_NAME || 'Rainstorm Dev Platform',
            apiBase:
                process.env.NUXT_PUBLIC_API_BASE || 'https://dev.rainstorm.space'
        }
    },
    vite: {
        server: {
            allowedHosts: ['dev.rainstorm.space']
        },
        optimizeDeps: {
            include: ['markdown-it', 'highlight.js']
        }
    },
    modules: ['@nuxtjs/tailwindcss']
})
