import { implement } from "@orpc/server";

import { contract } from "../contract";
import { useAuth } from "../middlewares/auth";
import { retry } from "../middlewares/retry";
import { useSentry } from "../middlewares/sentry";
import type { ORPCContext } from "./context";

export const os = implement(contract).$context<ORPCContext>();

const _base = os.use(retry({ maxAttempts: 3 })).use(useSentry);

export const publicProcedure = _base;

export const protectedProcedure = _base.use(useAuth);
