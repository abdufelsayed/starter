import type {
  DefaultError,
  QueryKey,
  UndefinedInitialDataOptions,
  UseMutationOptions,
} from "@tanstack/react-query";

// ── Type helpers ──

// Use object call-signature with `infer` for args to extract concrete types
// from BA's generic method signatures (using `any[]` collapses to `any`)
type InferData<TFn> = TFn extends { (...args: infer _A): Promise<infer R> }
  ? R extends { data: infer D }
    ? D
    : never
  : never;

// Handles both required [First, ...] and optional [First?, ...] tuple params
type InferInput<TFn> = TFn extends { (...args: infer A): any }
  ? A extends [infer First, ...any[]]
    ? First
    : A extends [(infer First)?, ...any[]]
      ? First | undefined
      : void
  : void;

type QueryOpts<TData> = Partial<
  Omit<UndefinedInitialDataOptions<TData, DefaultError, TData>, "queryKey" | "queryFn">
>;

type MutationOpts<TData, TVariables> = Partial<
  Omit<UseMutationOptions<TData, DefaultError, TVariables>, "mutationFn">
>;

// When input includes undefined, make it optional; when required, make it required
type InputField<TFn> =
  undefined extends InferInput<TFn>
    ? { input?: Exclude<InferInput<TFn>, undefined> }
    : { input: InferInput<TFn> };

// For mutations: void when no input, optional when all-optional params, required otherwise
type MutVar<TFn> =
  InferInput<TFn> extends void
    ? void
    : undefined extends InferInput<TFn>
      ? Exclude<InferInput<TFn>, undefined> | void
      : InferInput<TFn>;

type QueryReturn<TFn> = {
  queryKey: QueryKey;
  queryFn: () => Promise<InferData<TFn>>;
} & QueryOpts<InferData<TFn>>;

type WithQueryExtensions<TFn> = {
  queryOptions: InferInput<TFn> extends void
    ? (opts?: QueryOpts<InferData<TFn>>) => QueryReturn<TFn>
    : (opts?: InputField<TFn> & QueryOpts<InferData<TFn>>) => QueryReturn<TFn>;
  mutationOptions: (opts?: MutationOpts<InferData<TFn>, MutVar<TFn>>) => {
    mutationKey: QueryKey;
    mutationFn: (input: MutVar<TFn>) => Promise<InferData<TFn>>;
  } & MutationOpts<InferData<TFn>, MutVar<TFn>>;
  key: () => QueryKey;
};

// ── Recursive mapped type ──

export type TanstackQueryClient<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? T[K] & WithQueryExtensions<T[K]>
    : T[K] extends object
      ? TanstackQueryClient<T[K]> & { key: () => QueryKey }
      : T[K];
} & { key: () => QueryKey };

// ── Bypass set — properties that must not be proxied ──

const BYPASS = new Set(["then", "catch", "finally", "toJSON", "$$typeof"]);

// ── Runtime helpers ──

function unwrap(result: any) {
  if (result?.error) throw result.error;
  // BA methods return { data, error }; plugin actions return raw values
  return result && typeof result === "object" && "data" in result ? result.data : result;
}

// ── Runtime proxy ──

const proxyTarget = function proxyTarget() {};

function createTanstackProxy(current: any, path: string[]): any {
  return new Proxy(proxyTarget, {
    get(_, prop) {
      if (typeof prop === "symbol") return undefined;
      if (BYPASS.has(prop)) return undefined;

      if (prop === "queryOptions") {
        return (opts?: any) => {
          const { input, ...rest } = opts ?? {};
          return {
            queryKey: input !== undefined ? [...path, input] : path,
            queryFn: async () => unwrap(await current(input)),
            ...rest,
          };
        };
      }

      if (prop === "mutationOptions") {
        return (opts?: any) => {
          return {
            mutationKey: path,
            mutationFn: async (input: any) => unwrap(await current(input)),
            ...opts,
          };
        };
      }

      if (prop === "key") {
        return () => [...path];
      }

      const next = current[prop];
      if (next === undefined) return undefined;

      return createTanstackProxy(next, [...path, prop]);
    },

    apply(_, __, args) {
      return current(...args);
    },
  });
}

export function tanstackQuery<T extends object>(client: T): TanstackQueryClient<T> {
  return createTanstackProxy(client, ["auth"]);
}
