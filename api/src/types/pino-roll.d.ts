declare module 'pino-roll' {
  import type { Writable } from 'node:stream';

  export interface LimitOptions {
    /** 保留文件数（不含当前文件）。 */
    count?: number;
    /** 滚动时是否一并移除匹配旧文件。 */
    removeOtherLogFiles?: boolean;
  }

  export interface PinoRollOptions {
    /** 目标文件路径。 */
    file: string | (() => string);
    /** 按大小滚动，如 '10MB' 或 `'1g'`。 */
    size?: string | number;
    /** 按时间滚动：'daily' | 'hourly' | 数值(ms) 等。 */
    frequency?: string | number;
    /** 追加到文件名的后缀。 */
    extension?: string;
    /** 旧文件清理策略。 */
    limit?: LimitOptions;
    /** 为当前日志文件建符号链接（便于 tail 固定路径）。 */
    symlink?: boolean;
    /** 文件名追加日期格式（date-fns 格式）。 */
    dateFormat?: string;
    [key: string]: unknown;
  }

  /**
   * pino-roll 是 CommonJS，且默认导出就是这个 async 工厂函数
   * （不提供命名 createStream 导出）。返回 SonicBoom 可写流，可直接作为 pino destination。
   */
  const pinoRoll: (options?: PinoRollOptions) => Promise<Writable>;
  export default pinoRoll;
}