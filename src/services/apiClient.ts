import axios from 'axios'
import serverConfig from './config/server.config'

const apiClient = axios.create({
  baseURL: serverConfig.url,
  headers: {
    Accept: 'application/json'
  }
})

apiClient.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default apiClient
