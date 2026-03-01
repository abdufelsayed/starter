import {
  queryOptions,
  type DefaultError,
  type QueryKey,
  type UseMutationOptions,
  type UndefinedInitialDataOptions,
} from "@tanstack/react-query";

// --- Query procedure (no input) ---

type QueryOpts<TData> = Partial<
  Omit<UndefinedInitialDataOptions<TData, DefaultError, TData, QueryKey>, "queryKey" | "queryFn">
>;

export function createQuery<TData>(config: {
  key: QueryKey;
  queryFn: () => Promise<TData>;
  defaults?: QueryOpts<TData>;
}) {
  return {
    queryOptions: (opts?: QueryOpts<TData>) =>
      queryOptions({
        queryKey: config.key,
        queryFn: config.queryFn,
        ...config.defaults,
        ...opts,
      }),
    queryKey: () => config.key,
    key: () => config.key,
  };
}

// --- Query procedure (with input) ---

type QueryWithInputOpts<TData> = Partial<
  Omit<UndefinedInitialDataOptions<TData, DefaultError, TData, QueryKey>, "queryKey" | "queryFn">
>;

export function createQueryWithInput<TInput, TData>(config: {
  key: QueryKey;
  queryFn: (input: TInput) => Promise<TData>;
  defaults?: QueryWithInputOpts<TData>;
}) {
  return {
    queryOptions: (opts: { input: TInput } & QueryWithInputOpts<TData>) => {
      const { input, ...rest } = opts;
      return queryOptions({
        queryKey: [...config.key, input],
        queryFn: () => config.queryFn(input),
        ...config.defaults,
        ...rest,
      });
    },
    queryKey: (opts: { input: TInput }) => [...config.key, opts.input],
    key: (opts?: { input?: TInput }) =>
      opts?.input !== undefined ? [...config.key, opts.input] : config.key,
  };
}

// --- Mutation procedure ---

type MutationOpts<TData, TVariables> = Partial<
  Omit<UseMutationOptions<TData, DefaultError, TVariables>, "mutationFn">
>;

export function createMutation<TData, TVariables = void>(config: {
  key: QueryKey;
  mutationFn: (input: TVariables) => Promise<TData>;
}): {
  mutationOptions: (
    opts?: MutationOpts<TData, TVariables>,
  ) => { mutationKey: QueryKey; mutationFn: (input: TVariables) => Promise<TData> } & MutationOpts<
    TData,
    TVariables
  >;
  mutationKey: () => QueryKey;
  key: () => QueryKey;
} {
  return {
    mutationOptions: (opts?: MutationOpts<TData, TVariables>) => ({
      mutationKey: config.key,
      mutationFn: config.mutationFn,
      ...opts,
    }),
    mutationKey: () => config.key,
    key: () => config.key,
  };
}
