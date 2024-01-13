// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@sidebase/nuxt-auth', '@nuxt/ui', 'nuxt-lodash'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },
  css: ['~/assets/main.scss'],
  ui: {
    icons: ['mdi', 'heroicons'],
    global: true
  },
  colorMode: {
    preference: 'light'
  },
  build: {
    transpile: [
      'trpc-nuxt'
    ]
  },
  typescript: {
    shim: true
  }
})
