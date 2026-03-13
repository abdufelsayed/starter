import { db } from "@starter/db";

import { base } from "../lib/context";

export const useDb = base.middleware(async ({ context, next }) =>
  next({
    context: {
      db: context.db ?? db,
    },
  }),
);
