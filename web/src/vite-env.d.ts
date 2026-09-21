/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 后端 API 基础地址（设计 §7：13000） */
  readonly VITE_API_BASE_URL?: string;
  /** dev 服务器端口（设计 §7：15173） */
  readonly VITE_PORT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}