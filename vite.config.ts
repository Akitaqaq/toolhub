import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // 使用相对路径，支持任意子目录部署
  server: {
    port: 3000,
    open: true
  }
})