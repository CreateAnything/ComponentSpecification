import Request from './request'

const http = new Request({
  baseURL: 'http://localhost:5000',
  timeout: 5000,
  interceptors: {
    //请求拦截器
    requestInterceptors: (config) => {
      return config
    },
    //响应拦截器
    responseInterceptors: (response) => {
      return response
    },
    //全局响应错误处理
    responseInterceptorCatch(err) {
      return err
    }
  }
})
export { http }
