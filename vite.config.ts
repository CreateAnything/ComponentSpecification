import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), visualizer({ open: true })],
  base: './', //设置打包路径
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src') //设置别名
    }
  },
  server: {
    port: 5000, //设置服务器启动端口
    open: true, //设置服务器启动时是否自动打开浏览器
    cors: true //允许跨域
  },
  build: {
    minify: 'terser',
    outDir: 'build', // 打包文件的输出目录
    assetsDir: 'static', //指定生成静态资源的存放目录。默认值为assets
    assetsInlineLimit: 4096, //当图片小于4090转换为base64 编码
    terserOptions: {
      compress: {
        drop_console: true, //去除生产环境的打印
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js', // 引入文件名的名称
        entryFileNames: 'js/[name]-[hash].js', // 包的入口文件名称
        assetFileNames: '[ext]/[name]-[hash].[ext]', // 资源文件像 字体，图片等
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 让每个插件都打包成独立的文件
            return id.toString().split('node_modules/')[1].split('/')[0].toString()
          }
        }
      }
    }
  }
})
