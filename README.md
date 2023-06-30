[TOC]

# 前端工程化项目搭建

## 1.使用 Vite 创建项目

> 1. 执行命令 npm init @vitejs/app 初始化 vite 项目
>
> 2. 对 vite 的配置文件进行简易的修改
>
>    ```typescript
>    import vue from '@vitejs/plugin-vue'
>    import { defineConfig } from 'vite'
>    // 如果编辑器提示 path 模块找不到，则可以安装一下 @types/node -> npm i @types/node -D
>    import { resolve } from 'path'
>            
>    // https://vitejs.dev/config/
>    export default defineConfig({
>      plugins: [vue()],
>      resolve: {
>        alias: {
>          '@': resolve(__dirname, 'src') //设置别名
>        }
>      },
>      base: './', //设置打包路径
>      server: {
>        port: 5000, //设置服务器启动端口
>        open: true, //设置服务器启动时是否自动打开浏览器
>        cors: true //允许跨域
>      }
>    })
>    ```

## 2.集成路由工具 VueRouter

> 1. 执行 npm i vue-router@4 下载路由依赖
>
> 2. 在 src 下创建 router 目录，然后在 router 目录下创建 index.ts 文件
>
>    ```typescript
>    import { App } from 'vue'
>    import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router'
>    import { createRouterGuards } from './premission'
>
>    const routes: RouteRecordRaw[] = []
>
>    const router = createRouter({
>      history: createWebHistory(),
>      routes
>    })
>
>    export function setupRouter(app: App) {
>      createRouterGuards(router)
>      app.use(router)
>    }
>    ```
>
> 3. 在 router 路由下创建 premission 文件用于启用路由拦截器
>
>    ```typescript
>    import { Router } from 'vue-router'
>
>    export function createRouterGuards(router: Router) {
>      router.beforeEach((to, form, next) => {
>        next()
>      })
>    }
>    ```
>
> 4. 在 main.js 中导入使用该函数
>
>    ```typescript
>    import { setupRouter } from '@/router/index'
>    import { createApp } from 'vue'
>    import App from './App.vue'
>    import './style.css'
>    const app = createApp(App)
>    setupRouter(app) //使用路由
>    app.mount('#app')
>    ```

## 3.集成 Pinia 全局状态管理

> 1. 执行 npm install pinia 下载依赖
>
> 2. 在根目录下创建 store 文件夹并在该文件夹下创建 index.ts
>
>    ```typescript
>    import { createPinia } from 'pinia'
>    import { App } from 'vue'
>    import user from './modules/user/index'
>
>    //pinia注册方法
>    const setupPinia = (app: App) => {
>      const pinia = createPinia()
>      app.use(pinia)
>    }
>
>    //暴露全部store实列
>    const Store = {
>      user
>    }
>
>    export { Store, setupPinia }
>    ```
>
> 3. 在 store 文件夹下创建 modules/user/index.ts 和 modules/user/type.ts
>
>    在 index.ts 中
>
>    ```typescript
>    import { defineStore } from 'pinia'
>    import { ref } from 'vue'
>    import { UserInfo } from './type'
>
>    const userStore = defineStore('user', () => {
>      const token = ref<string>('1213')
>      const userInfo = ref<UserInfo>()
>      return {
>        token,
>        userInfo
>      }
>    })
>    export default userStore
>    export type UserStore = ReturnType<typeof userStore>
>    ```
>
>    如果 store 中的 ts 类型较为复杂可以在 type.ts 中进行书写
>
>    ```typescript
>    enum Role {
>      Admin = 0,
>      Mannger = 1
>    }
>    interface UserInfo {
>      avatar: string
>      username: string
>      id: number
>      role: Role
>    }
>
>    export type { Role, UserInfo }
>    ```
>
> 4. 在页面中进行使用
>
>    ```typescript
>    <script setup lang="ts">
>      import {Store} from "@/store/index"; import HelloWorld from "./components/HelloWorld.vue";
>      const user = Store.user(); console.log(user.userInfo?.avatar);
>    </script>
>    ```

## 4.集成 Http 工具 Axios

> 1. 执行 cnpm i axios --save 下载依赖
>
> 2. 在目录中新建 requeest 文件夹并在目录下创建,request.ts,index.ts,type/type.ts 文件
>
> 3. 在 request.ts 中对 axios 进行二次封装
>
>    ```typescript
>    import axios, {
>      AxiosError,
>      AxiosInstance,
>      AxiosResponse,
>      InternalAxiosRequestConfig
>    } from 'axios'
>    import { RequestConfig, RequestInterceptors } from './type'
>    class Request {
>      public axiosInstance: AxiosInstance //定义axios实列
>      private interceptors!: RequestInterceptors //定义拦截器
>      constructor(config: RequestConfig) {
>        this.axiosInstance = axios.create(config)
>        config.interceptors && (this.interceptors = config.interceptors)
>        //全局请求拦截器封装
>        this.axiosInstance.interceptors.request.use(
>          (request: InternalAxiosRequestConfig) => {
>            return request
>          },
>          (error) => {
>            return Promise.reject(error)
>          }
>        )
>        //使用局部请求拦截器
>        this.axiosInstance.interceptors.request.use(
>          this.interceptors?.requestInterceptors,
>          this.interceptors?.requestInterceptorCatch
>        )
>        //使用局部响应拦截器
>        this.axiosInstance.interceptors.response.use(
>          this.interceptors?.responseInterceptors,
>          this.interceptors?.responseInterceptorCatch
>        )
>        //全局响应拦截器封装
>        this.axiosInstance.interceptors.response.use(
>          (response: AxiosResponse) => {
>            return response
>          },
>          (error) => {
>            return Promise.reject(error)
>          }
>        )
>      }
>      private request<T>(config: RequestConfig): Promise<T> {
>        return new Promise((reslove, reject) => {
>          //如果我们为单个请求设置拦截器,这里使用单个请求的拦截器
>          if (config.interceptors?.requestInterceptors) {
>            config = config.interceptors.requestInterceptors(config as InternalAxiosRequestConfig)
>          }
>          this.axiosInstance
>            ?.request<unknown, T>(config)
>            .then((res: any) => {
>              //如果我们为单个响应设置拦截器，这里使用单个响应拦截器
>              if (config.interceptors?.responseInterceptors) {
>                res = config.interceptors.responseInterceptors(res)
>                reslove(res)
>              } else {
>                reslove(res)
>              }
>            })
>            .catch((error: AxiosError) => reject(error))
>        })
>      }
>
>      get<T>(config: RequestConfig): Promise<T> {
>        return this.request<T>({ ...config, method: 'GET' })
>      }
>      post<T>(config: RequestConfig): Promise<T> {
>        return this.request<T>({ ...config, method: 'POST' })
>      }
>
>      delete<T>(config: RequestConfig): Promise<T> {
>        return this.request<T>({ ...config, method: 'DELETE' })
>      }
>
>      put<T>(config: RequestConfig): Promise<T> {
>        return this.request<T>({ ...config, method: 'PUT' })
>      }
>
>      patch<T>(config: RequestConfig): Promise<T> {
>        return this.request<T>({ ...config, method: 'PATCH' })
>      }
>    }
>
>    export default Request
>    ```
>
> 4. 在 type.ts 文件中书写 ts 类型
>
>    ```typescript
>    import type {
>      AxiosError,
>      AxiosRequestConfig,
>      AxiosResponse,
>      InternalAxiosRequestConfig
>    } from 'axios'
>
>    export enum BadServerStatus {
>      TIMEOUT = 10000, // 请求超时 request timeout
>      FAIL = 500, // 服务器异常 server error
>      LOGINTIMEOUT = 401, // 登录超时 login timeout
>      SUCCESS = 200 // 请求成功 request successfully
>    }
>
>    export enum SuccessStatus {
>      PARAMS_ERR = 202, //参数错误
>      NOTFOUND = 203, //未找到
>      SUCCESS = 200 //成功请求
>    }
>
>    interface GetResponse<T = unknown> {
>      code: SuccessStatus
>      msg: string
>      page: T
>    }
>
>    interface RequestInterceptors {
>      //请求拦截器
>      requestInterceptors?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig
>      requestInterceptorCatch?: (err: AxiosError) => AxiosError | Promise<AxiosError>
>      //响应拦截器
>      responseInterceptors?: (config: AxiosResponse<GetResponse>) => AxiosResponse<GetResponse>
>      responseInterceptorCatch?: (error: AxiosError) => AxiosError | Promise<AxiosError>
>    }
>
>    //请求参数配置
>    interface RequestConfig extends AxiosRequestConfig {
>      interceptors?: RequestInterceptors
>      retry?: number
>      retryDelay?: number
>      _retryCount?: number
>    }
>    export type { GetResponse, RequestConfig, RequestInterceptors }
>    ```
>
> 5. 在 index.ts 中创建 request 实列对象
>
>    ```typescript
>    import Request from './request'
>
>    const http = new Request({
>      baseURL: 'http://localhost:5000',
>      timeout: 5000,
>      interceptors: {
>        //请求拦截器
>        requestInterceptors: (config) => {
>          return config
>        },
>        //响应拦截器
>        responseInterceptors: (response) => {
>          return response
>        },
>        //全局响应错误处理
>        responseInterceptorCatch(err) {
>          return err
>        }
>      }
>    })
>    export { http }
>    ```
>
> 6. 在页面中使用
>
>    ```typescript
>    <script setup lang="ts">
>    import { http } from "@/request/index";
>    import { Store } from "@/store/index";
>    import { onMounted } from "vue";
>    import HelloWorld from "./components/HelloWorld.vue";
>    interface Student {
>      name: string;
>      age: string;
>    }
>    const user = Store.user();
>            
>    const init = async () => {
>      const res = await http.get<Student>({ url: "localhost:5999" });
>    };
>            
>    onMounted(() => {
>      init();
>    });
>    </script>
>    ```

## 5.集成 css 预编译 Stylus/Sass/Less

> 1. 执行命令 cnpm i sass -D

## 6.代码规范化

### 6.1.使用 EditorConfig

> 1. 描述:EditorConfig 有助于为不同 IDE 编辑器上处理同一项目的多个开发人员维护一致的编码风格
>
> 2. 官网:[editorconfig.org](https://link.juejin.cn/?target=http%3A%2F%2Feditorconfig.org)
>
> 3. 在项目根目录下创建.editorconfig 文件夹并在该文件中输入配置项
>
>    ```markdown
>    # Editor configuration, see http://editorconfig.org
>
>    # 表示是最顶层的 EditorConfig 配置文件
>    root = true
>
>    [*] # 表示所有文件适用
>    charset = utf-8 # 设置文件字符集为 utf-8
>    indent_style = space # 缩进风格（tab | space）
>    indent_size = 2 # 缩进大小
>    end_of_line = lf # 控制换行类型(lf | cr | crlf)
>    trim_trailing_whitespace = true # 去除行首的任意空白字符
>    insert_final_newline = true # 始终在文件末尾插入一个新行
>
>    [*.md] # 表示仅 md 文件适用以下规则
>    max_line_length = off
>    trim_trailing_whitespace = false
>    ```
>
> 4. 注意:
>
>    - VSCode 使用 EditorConfig 需要去插件市场下载插件 **EditorConfig for VS Code**
>    - JetBrains 系列（WebStorm、IntelliJ IDEA 等）则不用额外安装插件，可直接使用 EditorConfig 配置。

### 6.2.使用 Prettier

> 1. 描述
>
>    Prettier 是一款强大的代码格式化工具，支持 JavaScript、TypeScript、CSS、SCSS、Less、JSX、Angular、Vue、GraphQL、JSON、Markdown 等语言，基本上前端能用到的文件格式它都可以搞定，是当下最流行的代码格式化工具。
>
> 2. 官网
>
>    [prettier.io/](https://link.juejin.cn/?target=https%3A%2F%2Fprettier.io%2F)
>
> 3. 执行 npm i prettier -D 下载依赖
>
> 4. 创建 Prettier 配置文件并配置格式化要求
>
>    ```json
>    {
>      "useTabs": false,
>      "tabWidth": 2,
>      "printWidth": 100,
>      "singleQuote": true,
>      "trailingComma": "none",
>      "bracketSpacing": true,
>      "semi": false
>    }
>    
>    ```
>
> 5. 在package.json中可以配置统一格式化的命令
>
>    ```json
>      "scripts": {
>        "dev": "vite",
>        "build": "vue-tsc && vite build",
>        "preview": "vite preview",
>        "format": "npx prettier --write ."
>      },
>    ```
>
> 6. 注意:
>
>    - VSCode 编辑器使用 Prettier 配置需要下载插件 **Prettier - Code formatter**
>    - JetBrains 系列编辑器（WebStorm、IntelliJ IDEA 等）则不用额外安装插件，可直接使用 Prettier 配置。

### 6.3.使用 Eslint

> 1. 执行 npm i eslint -D 下载相关依赖
>
> 2. ESLint 安装成功后，执行 `npx eslint --init`，然后按照终端操作提示完成一系列设置来创建配置文件。
>
> 3. 此时会创建一个eslint.cjs文件如下
>
>    ```js
>    module.exports = {
>        "env": {
>            "browser": true,
>            "es2021": true,
>            "node":true,
>        },
>        "extends": [
>            "eslint:recommended",
>            "plugin:vue/vue3-essential",
>            "plugin:@typescript-eslint/recommended"
>        ],
>        "overrides": [
>        ],
>        "parser": "vue-eslint-parser",
>        "parserOptions": {
>          "parser":"@typescript-eslint/parser"
>        },
>        "plugins": [
>            "vue",
>            "@typescript-eslint"
>        ],
>        "rules": {
>            "no-var": "error",
>            "no-alert": "error",  // 禁止使用alert confirm prompt
>          }
>    }
>    ```
>
>    ![image-20230627235129801](C:\Users\wmq39\AppData\Roaming\Typora\typora-user-images\image-20230627235129801.png)
>
> 4. 在package.json中配置统一eslint错误修复
>
>    ```json
>      "scripts": {
>        "dev": "vite",
>        "build": "vue-tsc && vite build",
>        "preview": "vite preview",
>        "format": "npx prettier --write .",
>        "lint": "eslint . --ext .vue,.js,.ts,.jsx,.tsx --fix"
>      },
>    ```
>
>    
>
> 5. 这里是一些eslint的rules规则大全
>
>    - 错误级别
>
>      "off"或者0，不启用这个规则
>
>      "error"或者2，出现问题会报错
>
>      warn"或者1，出现问题会有警告
>
>    - 常见错误大全
>
>      ```js
>      {
>             'space-before-function-paren': 0, // 方法名和括号之间需要有一格空格
>             '@typescript-eslint/no-unused-vars': 'off',// 声明了变量而未使用时出现的警告
>         		'comma-dangle': 'off',// 对象、数据组等字面量的项尾不能有逗号
>              "@typescript-eslint/explicit-function-return-type": "off",    // 显式函数返回类型
>              "@typescript-eslint/interface-name-prefix": "off",    // 
>              "@typescript-eslint/no-unused-vars": "off",    // 关闭当声明了变量而未使用时出现的警告
>              "@typescript-eslint/no-explicit-any": "off",
>              "no-alert": 0,    // 禁止使用alert confirm prompt
>              "no-array-constructor": 2,    // 禁止使用数组构造器
>              "no-bitwise": 0,    // 禁止使用按位运算符
>              "no-caller": 1,    // 禁止使用arguments.caller或arguments.callee
>              "no-catch-shadow": 2,    // 禁止catch子句参数与外部作用域变量同名
>              "no-class-assign": 2,    // 禁止给类赋值
>              "no-cond-assign": 2,    // 禁止在条件表达式中使用赋值语句
>              "no-console": 2,    // 禁止使用console
>              "no-const-assign": 2,    // 禁止修改const声明的变量
>              "no-constant-condition": 2,    // 禁止在条件中使用常量表达式 if(true) if(1)
>              "no-continue": 0,    // 禁止使用continue
>              "no-control-regex": 2,    // 禁止在正则表达式中使用控制字符
>              "no-debugger": 2,    // 禁止使用debugger
>              "no-delete-var": 2,    // 不能对var声明的变量使用delete操作符
>              "no-div-regex": 1,    // 不能使用看起来像除法的正则表达式/=foo/
>              "no-dupe-keys": 2,    // 在创建对象字面量时不允许键重复 {a:1,a:1}
>              "no-dupe-args": 2,    // 函数参数不能重复
>              "no-duplicate-case": 2,    // switch中的case标签不能重复
>              "no-else-return": 2,    // 如果if语句里面有return,后面不能跟else语句
>              "no-empty": 2,    // 块语句中的内容不能为空
>              "no-empty-character-class": 2,    // 正则表达式中的[]内容不能为空
>              "no-empty-label": 2,    // 禁止使用空label
>              "no-eq-null": 2,    // 禁止对null使用==或!=运算符
>              "no-eval": 1,    // 禁止使用eval
>              "no-ex-assign": 2,    // 禁止给catch语句中的异常参数赋值
>              "no-extend-native": 2,    // 禁止扩展native对象
>              "no-extra-bind": 2,    // 禁止不必要的函数绑定
>              "no-extra-boolean-cast": 2,    // 禁止不必要的bool转换
>              "no-extra-parens": 2,    // 禁止非必要的括号
>              "no-extra-semi": 2,    // 禁止多余的冒号
>              "no-fallthrough": 1,    // 禁止switch穿透
>              "no-floating-decimal": 2,    // 禁止省略浮点数中的0 .5 3.
>              "no-func-assign": 2,    // 禁止重复的函数声明
>              "no-implicit-coercion": 1,    // 禁止隐式转换
>              "no-implied-eval": 2,    // 禁止使用隐式eval
>              "no-inline-comments": 0,    // 禁止行内备注
>              "no-inner-declarations": [2, "functions"],    // 禁止在块语句中使用声明（变量或函数）
>              "no-invalid-regexp": 2,    // 禁止无效的正则表达式
>              "no-invalid-this": 2,    // 禁止无效的this，只能用在构造器，类，对象字面量
>              "no-irregular-whitespace": 2,    // 不能有不规则的空格
>              "no-iterator": 2,    // 禁止使用__iterator__ 属性
>              "no-label-var": 2,    // label名不能与var声明的变量名相同
>              "no-labels": 2,    // 禁止标签声明
>              "no-lone-blocks": 2,    // 禁止不必要的嵌套块
>              "no-lonely-if": 2,    // 禁止else语句内只有if语句
>              "no-loop-func": 1,    // 禁止在循环中使用函数（如果没有引用外部变量不形成闭包就可以）
>              "no-mixed-requires": [0, false],    // 声明时不能混用声明类型
>              "no-mixed-spaces-and-tabs": [2, false],    // 禁止混用tab和空格
>              "linebreak-style": [0, "windows"],    // 换行风格
>              "no-multi-spaces": 1,    // 不能用多余的空格
>              "no-multi-str": 2,    // 字符串不能用\换行
>              "no-multiple-empty-lines": [1, {"max": 2}],    // 空行最多不能超过2行
>              "no-native-reassign": 2,    // 不能重写native对象
>              "no-negated-in-lhs": 2,    // in 操作符的左边不能有!
>              "no-nested-ternary": 0,    // 禁止使用嵌套的三目运算
>              "no-new": 1,    // 禁止在使用new构造一个实例后不赋值
>              "no-new-func": 1,    // 禁止使用new Function
>              "no-new-object": 2,    // 禁止使用new Object()
>              "no-new-require": 2,    // 禁止使用new require
>              "no-new-wrappers": 2,    // 禁止使用new创建包装实例，new String new Boolean new Number
>              "no-obj-calls": 2,    // 不能调用内置的全局对象，比如Math() JSON()
>              "no-octal": 2,    // 禁止使用八进制数字
>              "no-octal-escape": 2,    // 禁止使用八进制转义序列
>              "no-param-reassign": 2,    // 禁止给参数重新赋值
>              "no-path-concat": 0,    // node中不能使用__dirname或__filename做路径拼接
>              "no-plusplus": 0,    // 禁止使用++，--
>              "no-process-env": 0,    // 禁止使用process.env
>              "no-process-exit": 0,    // 禁止使用process.exit()
>              "no-proto": 2,    // 禁止使用__proto__属性
>              "no-redeclare": 2,    // 禁止重复声明变量
>              "no-regex-spaces": 2,    // 禁止在正则表达式字面量中使用多个空格 /foo bar/
>              "no-restricted-modules": 0,    // 如果禁用了指定模块，使用就会报错
>              "no-return-assign": 1,    // return 语句中不能有赋值表达式
>              "no-script-url": 0,    // 禁止使用javascript:void(0)
>              "no-self-compare": 2,    // 不能比较自身
>              "no-sequences": 0,    // 禁止使用逗号运算符
>              "no-shadow": 2,    // 外部作用域中的变量不能与它所包含的作用域中的变量或参数同名
>              "no-shadow-restricted-names": 2,    // 严格模式中规定的限制标识符不能作为声明时的变量名使用
>              "no-spaced-func": 2,    // 函数调用时 函数名与()之间不能有空格
>              "no-sparse-arrays": 2,    // 禁止稀疏数组， [1,,2]
>              "no-sync": 0,    // nodejs 禁止同步方法
>              "no-ternary": 0,    // 禁止使用三目运算符
>              "no-trailing-spaces": 1,    // 一行结束后面不要有空格
>              "no-this-before-super": 0,    // 在调用super()之前不能使用this或super
>              "no-throw-literal": 2,    // 禁止抛出字面量错误 throw "error";
>              "no-undef": 1,    // 不能有未定义的变量
>              "no-undef-init": 2,    // 变量初始化时不能直接给它赋值为undefined
>              "no-undefined": 2,    // 不能使用undefined
>              "no-unexpected-multiline": 2,    // 避免多行表达式
>              "no-underscore-dangle": 1,    // 标识符不能以_开头或结尾
>              "no-unneeded-ternary": 2,    // 禁止不必要的嵌套 var isYes = answer === 1 ? true : false;
>              "no-unreachable": 2,    // 不能有无法执行的代码
>              "no-unused-expressions": 2,    // 禁止无用的表达式
>              "no-unused-vars": [2, {"vars": "all", "args": "after-used"}],    // 不能有声明后未被使用的变量或参数
>              "no-use-before-define": 2,    // 未定义前不能使用
>              "no-useless-call": 2,    // 禁止不必要的call和apply
>              "no-void": 2,    // 禁用void操作符
>              "no-var": 0,    // 禁用var，用let和const代替
>              "no-warning-comments": [1, { "terms": ["todo", "fixme", "xxx"], "location": "start" }], // 不能有警告备注
>              "no-with": 2,    // 禁用with
>              "array-bracket-spacing": [2, "never"],    // 是否允许非空数组里面有多余的空格
>              "arrow-parens": 0,    // 箭头函数用小括号括起来
>              "arrow-spacing": 0,    // =>的前/后括号
>              "accessor-pairs": 0,    // 在对象中使用getter/setter
>              "block-scoped-var": 0,    // 块语句中使用var
>              "brace-style": [1, "1tbs"],    // 大括号风格
>              "callback-return": 1,    // 避免多次调用回调什么的
>              "camelcase": 2,    // 强制驼峰法命名
>              "comma-dangle": [2, "never"],    // 对象字面量项尾不能有逗号
>              "comma-spacing": 0,    // 逗号前后的空格
>              "comma-style": [2, "last"],    // 逗号风格，换行时在行首还是行尾
>              "complexity": [0, 11],    // 循环复杂度
>              "computed-property-spacing": [0, "never"],    // 是否允许计算后的键名什么的
>              "consistent-return": 0,    // return 后面是否允许省略
>              "consistent-this": [2, "that"],    // this别名
>              "constructor-super": 0,    // 非派生类不能调用super，派生类必须调用super
>              "curly": [2, "all"],    // 必须使用 if(){} 中的{}
>              "default-case": 2,    // switch语句最后必须有default
>              "dot-location": 0,    // 对象访问符的位置，换行的时候在行首还是行尾
>              "dot-notation": [0, { "allowKeywords": true }],    // 避免不必要的方括号
>              "eol-last": 0,    // 文件以单一的换行符结束
>              "eqeqeq": 2,    // 必须使用全等
>              "func-names": 0,    // 函数表达式必须有名字
>              "func-style": [0, "declaration"],    // 函数风格，规定只能使用函数声明/函数表达式
>              "generator-star-spacing": 0,    // 生成器函数*的前后空格
>              "guard-for-in": 0,    // for in循环要用if语句过滤
>              "handle-callback-err": 0,    // nodejs 处理错误
>              "id-length": 0,    // 变量名长度
>              "indent": [2, 4],    // 缩进风格
>              "init-declarations": 0,    // 声明时必须赋初值
>              "key-spacing": [0, { "beforeColon": false, "afterColon": true }],    // 对象字面量中冒号的前后空格
>              "lines-around-comment": 0,    // 行前/行后备注
>              "max-depth": [0, 4],    // 嵌套块深度
>              "max-len": [0, 80, 4],    // 字符串最大长度
>              "max-nested-callbacks": [0, 2],    // 回调嵌套深度
>              "max-params": [0, 3],    // 函数最多只能有3个参数
>              "max-statements": [0, 10],    // 函数内最多有几个声明
>              "new-cap": 2,    // 函数名首行大写必须使用new方式调用，首行小写必须用不带new方式调用
>              "new-parens": 2,    // new时必须加小括号
>              "newline-after-var": 2,    // 变量声明后是否需要空一行
>              "object-curly-spacing": [0, "never"],    // 大括号内是否允许不必要的空格
>              "object-shorthand": 0,    // 强制对象字面量缩写语法
>              "one-var": 1,    // 连续声明
>              "operator-assignment": [0, "always"],    // 赋值运算符 += -=什么的
>              "operator-linebreak": [2, "after"],    // 换行时运算符在行尾还是行首
>              "padded-blocks": 0,    // 块语句内行首行尾是否要空行
>              "prefer-const": 0,    // 首选const
>              "prefer-spread": 0,    // 首选展开运算
>              "prefer-reflect": 0,    // 首选Reflect的方法
>              "quotes": [1, "single"],    // 引号类型 `` "" ''
>              "quote-props":[2, "always"],    // 对象字面量中的属性名是否强制双引号
>              "radix": 2,    // parseInt必须指定第二个参数
>              "id-match": 0,    // 命名检测
>              "require-yield": 0,    // 生成器函数必须有yield
>              "semi": [2, "always"],    // 语句强制分号结尾
>              "semi-spacing": [0, {"before": false, "after": true}],    // 分号前后空格
>              "sort-vars": 0,    // 变量声明时排序
>              "space-after-keywords": [0, "always"],    // 关键字后面是否要空一格
>              "space-before-blocks": [0, "always"],    // 不以新行开始的块{前面要不要有空格
>              "space-before-function-paren": [0, "always"],    // 函数定义时括号前面要不要有空格
>              "space-in-parens": [0, "never"],    // 小括号里面要不要有空格
>              "space-infix-ops": 0,    // 中缀操作符周围要不要有空格
>              "space-return-throw-case": 2,    // return throw case后面要不要加空格
>              "space-unary-ops": [0, { "words": true, "nonwords": false }],    // 一元运算符的前/后要不要加空格
>              "spaced-comment": 0,    // 注释风格要不要有空格什么的
>              "strict": 2,    // 使用严格模式
>              "use-isnan": 2,    // 禁止比较时使用NaN，只能用isNaN()
>              "valid-jsdoc": 0,    // jsdoc规则
>              "valid-typeof": 2,    // 必须使用合法的typeof的值
>              "vars-on-top": 2,    // var必须放在作用域顶部
>              "wrap-iife": [2, "inside"],    // 立即执行函数表达式的小括号风格
>              "wrap-regex": 0,    // 正则表达式字面量用小括号包起来
>              "yoda": [2, "never"]// 禁止尤达条件
>      }
>      ```
>
>      

### 6.4.解决 Prettier 和 Eslint 的冲突

> 1. 执行npm i eslint-plugin-prettier eslint-config-prettier -D下载依赖
>
> 2. 在 `.eslintrc.cjs` 添加 prettier 插件
>
>    ```js
>    module.exports = {
>      env: {
>        browser: true,
>        es2021: true,
>        node: true
>      },
>      extends: [
>        'eslint:recommended',
>        'plugin:vue/vue3-essential',
>        'plugin:@typescript-eslint/recommended',
>        'plugin:prettier/recommended' //添加插件
>      ],
>      overrides: [],
>      parser: 'vue-eslint-parser',
>      parserOptions: {
>        parser: '@typescript-eslint/parser'
>      },
>      plugins: ['vue', '@typescript-eslint'],
>      rules: {
>        'no-var': 'error',
>        'no-alert': 'error' // 禁止使用alert confirm prompt
>      }
>    }
>    ```
>
>    

### 6.5.集成 husky 和 lint-statge

> 1. 描述
>
>    我们在项目中已集成 ESLint 和 Prettier，在编码时，这些工具可以对我们写的代码进行实时校验，在一定程度上能有效规范我们写的代码，但团队可能会有些人觉得这些条条框框的限制很麻烦，选择视“提示”而不见，依旧按自己的一套风格来写代码，或者干脆禁用掉这些工具，开发完成就直接把代码提交到了仓库，日积月累，ESLint 也就形同虚设。
>
>    所以，我们还需要做一些限制，让没通过 ESLint 检测和修复的代码禁止提交，从而保证仓库代码都是符合规范的
>
>    为了解决这个问题，我们需要用到 Git Hook，在本地执行 `git commit` 的时候，就对所提交的代码进行 ESLint 检测和修复（即执行 `eslint --fix`），如果这些代码没通过 ESLint 规则校验，则禁止提交
>
>    实现这一功能，我们借助 [husky](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Ftypicode%2Fhusky) + [lint-staged](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fokonet%2Flint-staged) 
>
>    > [husky](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Ftypicode%2Fhusky) —— Git Hook 工具，可以设置在 git 各个阶段（`pre-commit`、`commit-msg`、`pre-push` 等）触发我们的命令。
>    >
>    > [lint-staged](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fokonet%2Flint-staged) —— 在 git 暂存的文件上运行 linters。
>
> 2. 配置husky
>
>    > 1. 执行 npm i husky -D 下载相关依赖
>    >
>    > 2. 创建 Git hooks 执行 npx husky install
>    >
>    >    ![image-20230629233248712](C:\Users\wmq39\AppData\Roaming\Typora\typora-user-images\image-20230629233248712.png)
>
> 3. #### 配置lint-staged
>
>    lint-staged 这个工具一般结合 husky 来使用，它可以让 husky 的 `hook` 触发的命令只作用于 `git add`那些文件（即 git 暂存区的文件），而不会影响到其他文件。
>
>    > 1. 执行npm i lint-staged -D下载依赖
>    >
>    > 2. 在.husky文件夹下的pre-commit里面配置
>    >
>    >    ```makefile
>    >    #!/usr/bin/env sh
>    >    . "$(dirname -- "$0")/_/husky.sh"
>    >          
>    >    npx lint-staged
>    >    ```
>    >
>    >    
>    >
>    > 3. 在 `package.json`里增加 lint-staged 配置项
>    >
>    >    ```json
>    >    {
>    >      "name": "vue3-app",
>    >      "private": true,
>    >      "version": "0.0.0",
>    >      "type": "module",
>    >      "scripts": {
>    >        "dev": "vite",
>    >        "build": "vue-tsc && vite build",
>    >        "preview": "vite preview",
>    >        "format": "npx prettier --write .",
>    >        "lint": "eslint . --ext .vue,.js,.ts,.jsx,.tsx --fix",
>    >        "prepare": "husky install"
>    >      },
>    >      "lint-staged": { //这行命令表示：只对 git 暂存区的 .vue、.js、.ts 文件执行 eslint --fix。
>    >        "*.{vue,js,ts}": "eslint --fix"
>    >      },
>    >      "dependencies": {
>    >        "@types/node": "^20.3.1",
>    >        "axios": "^1.4.0",
>    >        "pinia": "^2.1.4",
>    >        "vue": "^3.2.47",
>    >        "vue-router": "^4.2.2"
>    >      },
>    >      "devDependencies": {
>    >        "@typescript-eslint/eslint-plugin": "^5.60.1",
>    >        "@typescript-eslint/parser": "^5.60.1",
>    >        "@vitejs/plugin-vue": "^4.1.0",
>    >        "eslint": "^8.43.0",
>    >        "eslint-config-prettier": "^8.8.0",
>    >        "eslint-plugin-prettier": "^4.2.1",
>    >        "eslint-plugin-vue": "^9.15.1",
>    >        "husky": "^8.0.0",
>    >        "lint-staged": "^13.2.3",
>    >        "prettier": "^2.8.8",
>    >        "sass": "^1.63.6",
>    >        "typescript": "^4.9.3",
>    >        "vite": "^4.2.0",
>    >        "vue-tsc": "^1.2.0"
>    >      }
>    >    }
>    >    ```
>

### 6.6. commit message格式化规范

> 1. 简介
>
>    前面我们已经统一代码规范，并且在提交代码时进行强约束来保证仓库代码质量。多人协作的项目中，在提交代码这个环节，也存在一种情况：不能保证每个人对提交信息的准确描述，因此会出现提交信息紊乱、风格不一致的情况。
>
>    如果 `git commit` 的描述信息精准，在后期维护和 Bug 处理时会变得有据可查，项目开发周期内还可以根据规范的提交信息快速生成开发日志，从而方便我们追踪项目和把控进度
>
> 2. commit message 由 Header、Body、Footer 组成
>
>    ```
>    <Header>
>       
>    <Body>
>       
>    <Footer>
>    ```
>
>    - Header 部分包括三个字段 type（必需）、scope（可选）和 subject（必需）
>
>      ```
>      <type>(<scope>): <subject>
>      ```
>
>    - type用于说明 commit 的提交类型（必须是以下几种之一）
>
>      |    值    |                             描述                             |
>      | :------: | :----------------------------------------------------------: |
>      |   feat   |                         新增一个功能                         |
>      |   fix    |                         修复一个 Bug                         |
>      |   docs   |                           文档变更                           |
>      |  style   |       代码格式（不影响功能，例如空格、分号等格式修正）       |
>      | refactor |                           代码重构                           |
>      |   perf   |                           改善性能                           |
>      |   test   |                             测试                             |
>      |  build   | 变更项目构建或外部依赖（例如 scopes: webpack、gulp、npm 等） |
>      |    ci    | 更改持续集成软件的配置文件和 package 中的 scripts 命令，例如 scopes: Travis, Circle 等 |
>      |  chore   |                    变更构建流程或辅助工具                    |
>      |  revert  |                           代码回退                           |
>
>    - scope 用于指定本次 commit 影响的范围。scope 依据项目而定，例如在业务项目中可以依据菜单或者功能模块划分，如果是组件库开发，则可以依据组件划分。（scope 可省略）
>
>      subject 是本次 commit 的简洁描述，长度约定在 50 个字符以内
>
>    - body是对本次 commit 的详细描述，可以分成多行。（body 可省略）跟 subject 类似，用动词开头，body 应该说明修改的原因和更改前后的行为对比。
>    
>    - footer如果本次提交的代码是突破性的变更或关闭缺陷，则 Footer 必需，否则可以省略。
>
>    - 参考列子
>
>      - fix
>
>        ```
>       fix(compile): couple of unit tests for IE9
>    
>       Older IEs serialize html uppercased, but IE9 does not...
>        Would be better to expect case insensitive, unfortunately jasmine does
>       not allow to user regexps for throw expectations.
>    
>       Closes #392
>        Breaks foo.bar api, foo.baz should be used instead
>       ```
>    
>     - feat
>    
>       ```
>        feat(browser): onUrlChange event (popstate/hashchange/polling)
>    
>               Added new event to browser:
>        - forward popstate event if available
>        - forward hashchange event if popstate not available
>        - do polling when neither popstate nor hashchange available
>        
>        Breaks $browser.onHashChange, which was removed (use onUrlChange instead)
>        ```
>    
>     - style
>    
>       ```
>        style(location): add couple of missing semi colons
>        ```
>        
>      - chore
>    
>        ```
>        chore(release): v3.4.2
>               ```
>    
>    - 规范commit的好处
>
>      1. 首行就是简洁实用的关键信息，方便在 git history 中快速浏览。
>     2. 具有更加详细的 body 和 footer，可以清晰的看出某次提交的目的和影响。
>      3. 可以通过 type 过滤出想要查找的信息，也可以通过关键字快速查找相关提交。
>      4. 可以直接从 commit 生成 change log。

### 6.7.集成 Commitizen 实现规范提交

> 上面介绍了 Angular 规范提交的格式，初次接触的同学咋一看可能会觉得复杂，其实不然，如果让大家在 `git commit` 的时候严格按照上面的格式来写，肯定是有压力的，首先得记住不同的类型到底是用来定义什么，subject 怎么写，body 怎么写，footer 要不要写等等问题，懒才是程序员第一生产力，为此我们使用 Commitizen 工具来帮助我们自动生成 commit message 格式，从而实现规范提交。
>
> > Commitizen 是一个帮助撰写规范 commit message 的工具。它有一个命令行工具 cz-cli。
>
> 1. 执行 npm install commitizen -D 下载依赖
>
> 2. 初始化项目
>
>    成功安装 Commitizen 后，我们用 **cz-conventional-changelog** 适配器来初始化项目：
>
>    > 执行命令npm i cz-conventional-changelog -D下载依赖
>    >
>    > 仔package.json文件中配置config
>    >
>    > ```json
>    > {
>    >   "name": "vue3-app",
>    >   "private": true,
>    >   "version": "0.0.0",
>    >   "type": "module",
>    >   "scripts": {
>    >     "dev": "vite",
>    >     "build": "vue-tsc && vite build",
>    >     "preview": "vite preview",
>    >     "format": "npx prettier --write .",
>    >     "lint": "eslint . --ext .vue,.js,.ts,.jsx,.tsx --fix",
>    >     "prepare": "husky install"
>    >   },
>    >   "lint-staged": {
>    >     "*.{vue,js,ts}": "eslint --fix"
>    >   },
>    >   "dependencies": {
>    >     "@types/node": "^20.3.1",
>    >     "axios": "^1.4.0",
>    >     "pinia": "^2.1.4",
>    >     "vue": "^3.2.47",
>    >     "vue-router": "^4.2.2"
>    >   },
>    >   "devDependencies": {
>    >     "@typescript-eslint/eslint-plugin": "^5.60.1",
>    >     "@typescript-eslint/parser": "^5.60.1",
>    >     "@vitejs/plugin-vue": "^4.1.0",
>    >     "commitizen": "^4.3.0",
>    >     "cz-conventional-changelog": "^3.3.0",
>    >     "eslint": "^8.43.0",
>    >     "eslint-config-prettier": "^8.8.0",
>    >     "eslint-plugin-prettier": "^4.2.1",
>    >     "eslint-plugin-vue": "^9.15.1",
>    >     "husky": "^8.0.0",
>    >     "lint-staged": "^13.2.3",
>    >     "prettier": "^2.8.8",
>    >     "sass": "^1.63.6",
>    >     "typescript": "^4.9.3",
>    >     "vite": "^4.2.0",
>    >     "vue-tsc": "^1.2.0"
>    >   },
>    >   "config": {
>    >     "commitizen": {
>    >       "path": "./node_modules/cz-conventional-changelog"//配置cz-conventional-changelog的path
>    >     }
>    >   }
>    > }
>    > ```
>    >
>    > 以前我们提交代码都是 `git commit -m "xxx"`，现在改为 `git cz`，然后按照终端操作提示，逐步填入信息，就能自动生成规范的 commit message
>    >
>    > ![image-20230630213751867](C:\Users\wmq39\AppData\Roaming\Typora\typora-user-images\image-20230630213751867.png)
>    >

### 6.8.使用 cz-customizable 自定义提交

> 从上面的截图可以看到，`git cz` 终端操作提示都是英文的，如果想改成中文的或者自定义这些配置选项，我们使用 **cz-customizable** 适配器
>
> 1. ##### 执行 npm i cz-customizable  -D下载依赖
>
> 2. 修改package.json中修改config的配置
>
>    ```json
>    "config": {
>      "commitizen": {
>        "path": "./node_modules/cz-customizable"
>      }
>    }
>    ```
>
> 3. 在根目录新建cz-config.js并配置提交信息
>
>    ```javascript
>    module.exports = {
>      // type 类型（定义之后，可通过上下键选择）
>      types: [
>        { value: 'feat', name: 'feat:     新增功能' },
>        { value: 'fix', name: 'fix:      修复 bug' },
>        { value: 'docs', name: 'docs:     文档变更' },
>        { value: 'style', name: 'style:    代码格式（不影响功能，例如空格、分号等格式修正）' },
>        { value: 'refactor', name: 'refactor: 代码重构（不包括 bug 修复、功能新增）' },
>        { value: 'perf', name: 'perf:     性能优化' },
>        { value: 'test', name: 'test:     添加、修改测试用例' },
>        {
>          value: 'build',
>          name: 'build:    构建流程、外部依赖变更（如升级 npm 包、修改 webpack 配置等）'
>        },
>        { value: 'ci', name: 'ci:       修改 CI 配置、脚本' },
>        { value: 'chore', name: 'chore:    对构建过程或辅助工具和库的更改（不影响源文件、测试用例）' },
>        { value: 'revert', name: 'revert:   回滚 commit' }
>      ],
>    
>      // scope 类型（定义之后，可通过上下键选择）
>      scopes: [
>        ['components', '组件相关'],
>        ['hooks', 'hook 相关'],
>        ['utils', 'utils 相关'],
>        ['element-ui', '对 element-ui 的调整'],
>        ['styles', '样式相关'],
>        ['deps', '项目依赖'],
>        ['auth', '对 auth 修改'],
>        ['other', '其他修改'],
>        // 如果选择 custom，后面会让你再输入一个自定义的 scope。也可以不设置此项，把后面的 allowCustomScopes 设置为 true
>        ['custom', '以上都不是？我要自定义']
>      ].map(([value, description]) => {
>        return {
>          value,
>          name: `${value.padEnd(30)} (${description})`
>        }
>      }),
>    
>      // 是否允许自定义填写 scope，在 scope 选择的时候，会有 empty 和 custom 可以选择。
>      // allowCustomScopes: true,
>    
>      // allowTicketNumber: false,
>      // isTicketNumberRequired: false,
>      // ticketNumberPrefix: 'TICKET-',
>      // ticketNumberRegExp: '\\d{1,5}',
>    
>      // 针对每一个 type 去定义对应的 scopes，例如 fix
>      /*
>      scopeOverrides: {
>        fix: [
>          { name: 'merge' },
>          { name: 'style' },
>          { name: 'e2eTest' },
>          { name: 'unitTest' }
>        ]
>      },
>      */
>      // 交互提示信息
>      messages: {
>        type: '确保本次提交遵循 Angular 规范！\n选择你要提交的类型：',
>        scope: '\n选择一个 scope（可选）：',
>        // 选择 scope: custom 时会出下面的提示
>        customScope: '请输入自定义的 scope：',
>        subject: '填写简短精炼的变更描述：\n',
>        body: '填写更加详细的变更描述（可选）。使用 "|" 换行：\n',
>        breaking: '列举非兼容性重大的变更（可选）：\n',
>        footer: '列举出所有变更的 ISSUES CLOSED（可选）。 例如: #31, #34：\n',
>        confirmCommit: '确认提交？'
>      },
>    
>      // 设置只有 type 选择了 feat 或 fix，才询问 breaking message
>      allowBreakingChanges: ['feat', 'fix'],
>      // 跳过要询问的步骤
>      skipQuestions: ['body', 'footer'],
>      // subject 限制长度
>      subjectLimit: 100,
>      breaklineChar: '|' // 支持 body 和 footer
>      // footerPrefix : 'ISSUES CLOSED:'
>      // askForBreakingChangeFirst : true,
>    }
>    ```
>
>    建议大家结合项目实际情况来自定义配置提交规则，例如很多时候我们不需要写长描述，公司内部的代码仓库也不需要管理 issue，那么可以把询问 body 和 footer 的步骤跳过（在 `.cz-config.js` 中修改成 `skipQuestions: ['body', 'footer']`）。
>
>    
>
>    

### 6.9.集成 commitlint 验证提交规范
