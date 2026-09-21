import axios from 'axios';

/**
 * 后端 HTTP 客户端（设计 §8.1）。baseURL 来自 VITE_API_BASE_URL，默认 127.0.0.1:13000；
 * withCredentials 使 cookie 会话随跨端口请求发送（后端 same-site lax + CORS credentials）。
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:13000',
  withCredentials: true,
  timeout: 15_000,
});

// 响应统一解包 data（与后端 JSON 契约对应）。
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // 统一错误处理可在此扩展（401 → 跳登录等）；占位。
    return Promise.reject(error);
  },
);