import type {
  SupabaseClientLike,
  SupabaseListResult,
  SupabaseQueryBuilder,
  SupabaseSingleResult,
} from '../../src/infrastructure/supabase/supabase.types.js';

export type QueryCall = {
  method: string;
  args: unknown[];
};

export const createQueryClient = <T>(options: {
  list?: SupabaseListResult<T>;
  single?: SupabaseSingleResult<T>;
  rpc?: { data: unknown; error: { message: string } | null };
}) => {
  const calls: QueryCall[] = [];
  const list = options.list ?? { data: null, error: null };
  const single = options.single ?? { data: null, error: null };
  const builder = {} as SupabaseQueryBuilder<T>;
  const chain =
    (method: string) =>
    (...args: unknown[]) => {
      calls.push({ method, args });
      return builder;
    };

  builder.select = chain('select');
  builder.insert = chain('insert');
  builder.upsert = chain('upsert');
  builder.update = chain('update');
  builder.eq = chain('eq');
  builder.neq = chain('neq');
  builder.order = chain('order');
  builder.limit = chain('limit');
  builder.single = async () => single;
  builder.maybeSingle = async () => single;
  builder.then = (onfulfilled, onrejected) =>
    Promise.resolve(list).then(onfulfilled, onrejected);

  const client = {
    from: (table: string) => {
      calls.push({ method: 'from', args: [table] });
      return builder;
    },
    rpc: async (name: string, parameters?: Record<string, unknown>) => {
      calls.push({ method: 'rpc', args: [name, parameters] });
      return options.rpc ?? { data: null, error: null };
    },
  } as SupabaseClientLike;

  return { client, calls };
};
