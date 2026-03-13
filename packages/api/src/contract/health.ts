import { oc } from "@orpc/contract";
import { z } from "zod";

export const health = oc
  .route({
    method: "GET",
    tags: ["Health"],
    path: "/health",
    successStatus: 200,
    description: "Health check endpoint",
    summary: "Health check",
  })
  .output(
    z.object({
      status: z.literal("healthy"),
      timestamp: z.date(),
    }),
  );

export const ready = oc
  .route({
    method: "GET",
    tags: ["Health"],
    path: "/ready",
    successStatus: 200,
    description: "Readiness check endpoint",
    summary: "Readiness check",
  })
  .output(
    z.object({
      status: z.enum(["ready", "not_ready"]),
      timestamp: z.date(),
    }),
  );
