import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
  build: {
    rollupOptions: {
      external: ['vue'], // 这些库不会被打包
      // UMD 格式需要 globals
      // output: {
      //   globals: {
      //     vue: 'Vue', // 运行时从全局变量 Vue 获取, 大写，对应 window.Vue
      //   },
      // },
    },
  },
})
