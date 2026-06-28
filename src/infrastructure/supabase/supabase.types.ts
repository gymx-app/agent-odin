export type SupabaseSingleResult<T> = {
  data: T | null;
  error: { message: string; code?: string } | null;
};

export type SupabaseListResult<T> = {
  data: T[] | null;
  error: { message: string; code?: string } | null;
};

export type SupabaseQueryBuilder<T = unknown> = {
  select: (columns?: string) => SupabaseQueryBuilder<T>;
  insert: (values: unknown) => SupabaseQueryBuilder<T>;
  upsert: (values: unknown, options?: unknown) => SupabaseQueryBuilder<T>;
  update: (values: unknown) => SupabaseQueryBuilder<T>;
  eq: (column: string, value: unknown) => SupabaseQueryBuilder<T>;
  neq: (column: string, value: unknown) => SupabaseQueryBuilder<T>;
  gte: (column: string, value: unknown) => SupabaseQueryBuilder<T>;
  lt: (column: string, value: unknown) => SupabaseQueryBuilder<T>;
  order: (column: string, options?: unknown) => SupabaseQueryBuilder<T>;
  limit: (count: number) => SupabaseQueryBuilder<T>;
  single: () => Promise<SupabaseSingleResult<T>>;
  maybeSingle: () => Promise<SupabaseSingleResult<T>>;
  then: <TResult1 = SupabaseListResult<T>, TResult2 = never>(
    onfulfilled?:
      | ((value: SupabaseListResult<T>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) => PromiseLike<TResult1 | TResult2>;
};

export type SupabaseRpcResult<T> = {
  data: T | null;
  error: { message: string; code?: string } | null;
};

export type SupabaseClientLike = {
  from: <T = unknown>(table: string) => SupabaseQueryBuilder<T>;
  rpc?: <T = unknown>(
    functionName: string,
    parameters?: Record<string, unknown>,
  ) => Promise<SupabaseRpcResult<T>>;
};

export type SupabaseAuthClientLike = SupabaseClientLike & {
  auth: {
    getUser: (token?: string) => Promise<{
      data: {
        user: {
          id: string;
          email?: string;
          app_metadata?: Record<string, unknown>;
          user_metadata?: Record<string, unknown>;
        } | null;
      };
      error: { message: string } | null;
    }>;
  };
};
