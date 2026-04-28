import { and, asc, desc, eq, gt, lt, or, type AnyColumn, type SQL } from "drizzle-orm";

type SortOrder = "asc" | "desc";

interface CursorColumnDef<TColumn extends AnyColumn = AnyColumn> {
  column: TColumn;
  order: SortOrder;
}

type CursorConfig = Record<string, CursorColumnDef>;

interface PaginateResult<TRow> {
  items: TRow[];
  nextCursor: string | null;
}

type TaggedValue = { __t: "d"; v: string } | { __t: "r"; v: string | number | boolean };

function isTaggedValue(value: unknown): value is TaggedValue {
  if (!value || typeof value !== "object") return false;
  if (!("__t" in value) || !("v" in value)) return false;

  if (value["__t"] === "d") {
    return typeof value.v === "string";
  }

  if (value["__t"] === "r") {
    return (
      typeof value.v === "string" || typeof value.v === "number" || typeof value.v === "boolean"
    );
  }

  return false;
}

function isTaggedValueArray(value: unknown): value is TaggedValue[] {
  return Array.isArray(value) && value.every(isTaggedValue);
}

function serialize(value: unknown): TaggedValue {
  if (value instanceof Date) {
    return { __t: "d", v: value.toISOString() };
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return { __t: "r", v: value };
  }
  throw new Error(`Unsupported cursor value type: ${typeof value}`);
}

function deserialize(tagged: TaggedValue): Date | string | number | boolean {
  return tagged["__t"] === "d" ? new Date(tagged.v) : tagged.v;
}

function encodeCursor(keys: string[], row: Record<string, unknown>): string {
  const values = keys.map((key) => serialize(row[key]));
  return Buffer.from(JSON.stringify(values)).toString("base64url");
}

function decodeCursor(keys: string[], cursor: string): Record<string, unknown> | undefined {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString());
    if (!isTaggedValueArray(parsed) || parsed.length !== keys.length) return undefined;
    const result: Record<string, unknown> = {};
    for (let i = 0; i < keys.length; i++) {
      result[keys[i]] = deserialize(parsed[i]);
    }
    return result;
  } catch {
    return undefined;
  }
}

function buildKeysetCondition(
  defs: CursorColumnDef[],
  keys: string[],
  values: Record<string, unknown>,
): SQL | undefined {
  const branches: SQL[] = [];

  for (let i = 0; i < keys.length; i++) {
    const parts: SQL[] = [];

    for (let j = 0; j < i; j++) {
      parts.push(eq(defs[j].column, values[keys[j]]));
    }

    const cmp = defs[i].order === "desc" ? lt : gt;
    parts.push(cmp(defs[i].column, values[keys[i]]));

    const branch = parts.length === 1 ? parts[0] : and(...parts);
    if (branch) branches.push(branch);
  }

  if (branches.length === 0) return undefined;
  return branches.length === 1 ? branches[0] : or(...branches);
}

interface Cursor<T extends CursorConfig> {
  orderBy: SQL[];
  where(cursor: string | undefined | null): SQL | undefined;
  paginate<TRow extends Record<keyof T, unknown>>(
    rows: TRow[],
    limit: number,
  ): PaginateResult<TRow>;
}

export function createCursor<T extends CursorConfig>(config: T): Cursor<T> {
  const keys = Object.keys(config);
  const defs = keys.map((key) => config[key]);

  const orderByArr: SQL[] = defs.map((def) =>
    def.order === "desc" ? desc(def.column) : asc(def.column),
  );

  return {
    orderBy: orderByArr,

    where(cursor) {
      if (!cursor) return undefined;
      const values = decodeCursor(keys, cursor);
      if (!values) return undefined;
      return buildKeysetCondition(defs, keys, values);
    },

    paginate<TRow extends Record<keyof T, unknown>>(
      rows: TRow[],
      limit: number,
    ): PaginateResult<TRow> {
      const hasMore = rows.length > limit;
      const items = hasMore ? rows.slice(0, limit) : rows;
      const last = items[items.length - 1];
      const nextCursor = hasMore && last ? encodeCursor(keys, last) : null;
      return { items, nextCursor };
    },
  };
}
