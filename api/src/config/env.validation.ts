import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  validateSync,
  type ValidationError,
} from 'class-validator';
import { plainToInstance } from 'class-transformer';

const LOG_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal', 'silent'] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

/**
 * 全部环境变量统一 PRAXIS_ 前缀。每个字段给出默认值（对齐 .env.example /
 * 设计 §7：端口 13000、库 15432、Web 15173），未设置时回落到默认值。
 */
export class EnvVariables {
  @IsOptional()
  @IsIn(['development', 'test', 'production'])
  @IsString()
  PRAXIS_NODE_ENV: 'development' | 'test' | 'production' = 'development';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(65535)
  PRAXIS_PORT: number = 13000;

  @IsOptional()
  @IsString()
  @MaxLength(2083)
  PRAXIS_PUBLIC_URL: string = 'http://127.0.0.1:13000';

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  PRAXIS_DATABASE_URL: string = 'postgres://postgres:postgres@127.0.0.1:15432/praxis';

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  PRAXIS_AUTH_SECRET: string = '';

  @IsOptional()
  @IsString()
  @MaxLength(2083)
  PRAXIS_CORS_ORIGIN: string = 'http://127.0.0.1:15173';

  @IsOptional()
  @IsIn(LOG_LEVELS)
  @IsString()
  PRAXIS_LOG_LEVEL: LogLevel = 'debug';

  @IsOptional()
  @IsBoolean()
  PRAXIS_LOG_FILE: boolean = false;
}

const PRAXIS_KEYS = new Set([
  'PRAXIS_NODE_ENV',
  'PRAXIS_PORT',
  'PRAXIS_PUBLIC_URL',
  'PRAXIS_DATABASE_URL',
  'PRAXIS_AUTH_SECRET',
  'PRAXIS_CORS_ORIGIN',
  'PRAXIS_LOG_LEVEL',
  'PRAXIS_LOG_FILE',
]);

function pickPraxisEnv(raw: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(raw ?? {}).filter(([key]) => PRAXIS_KEYS.has(key)),
  );
}

/**
 * 供 ConfigModule.forRoot({ validate }) 使用。筛选 PRAXIS_ 键、填入默认值、
 * 用 class-validator（同步 validateSync）校验，非法配置在启动时立即抛错。
 * 注：Nest ConfigModule 同步调用 validate，故此处不用 async validate()。
 */
export function validateEnv(
  raw: Record<string, unknown>,
): EnvVariables {
  const picked = pickPraxisEnv(raw);
  const instance = plainToInstance(EnvVariables, picked, {
    enableImplicitConversion: true,
  });

  const errors: ValidationError[] = validateSync(instance, {
    whitelist: true,
    forbidNonWhitelisted: false,
  });

  if (errors.length > 0) {
    const details = errors
      .map((e) => Object.entries(e.constraints ?? {}).map(([, msg]) => msg).join('; '))
      .join(' | ');
    throw new Error(`环境变量校验失败: ${details}`);
  }

  return instance;
}