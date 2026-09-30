const NODE_ENVS = ['development', 'test', 'production'] as const;

type NodeEnv = (typeof NODE_ENVS)[number];

export type Env = {
  PRAXIS_NODE_ENV: NodeEnv;
  PRAXIS_PORT: number;
  PRAXIS_DATABASE_URL: string;
};

function isNodeEnv(value: string): value is NodeEnv {
  return (NODE_ENVS as readonly string[]).includes(value);
}

export function validateEnv(config: Record<string, unknown>): Env {
  const nodeEnvRaw =
    typeof config.PRAXIS_NODE_ENV === 'string'
      ? config.PRAXIS_NODE_ENV
      : 'development';

  if (!isNodeEnv(nodeEnvRaw)) {
    throw new Error('PRAXIS_NODE_ENV must be development, test, or production');
  }

  const databaseUrl = config.PRAXIS_DATABASE_URL;
  if (typeof databaseUrl !== 'string' || databaseUrl.length === 0) {
    throw new Error('PRAXIS_DATABASE_URL is required');
  }

  const portRaw = config.PRAXIS_PORT ?? 13000;
  const port = typeof portRaw === 'number' ? portRaw : Number(portRaw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PRAXIS_PORT must be an integer from 1 to 65535');
  }

  return {
    PRAXIS_NODE_ENV: nodeEnvRaw,
    PRAXIS_PORT: port,
    PRAXIS_DATABASE_URL: databaseUrl,
  };
}
