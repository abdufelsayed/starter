import { implement } from "@orpc/server";

import { contract } from "../contract";
import { useAuth } from "../middlewares/auth";
import { useSentry } from "../middlewares/sentry";
import type { ORPCContext } from "./context";

export const os = implement(contract).$context<ORPCContext>();

const baseProcedure = os.use(useSentry);

export const publicProcedure = baseProcedure;

export const protectedProcedure = baseProcedure.use(useAuth);
