import { QueryClient } from '@tanstack/react-query';

/** 应用级 QueryClient（服务端状态，设计 §8.1）。 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export const queryClient = createQueryClient();