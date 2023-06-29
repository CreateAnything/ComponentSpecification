import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
// 如果编辑器提示 path 模块找不到，则可以安装一下 @types/node -> npm i @types/node -D
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src') //设置别名
    }
  },
  base: './', //设置打包路径
  server: {
    port: 5000, //设置服务器启动端口
    open: true, //设置服务器启动时是否自动打开浏览器
    cors: true //允许跨域
  }
})
