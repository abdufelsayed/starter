import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { z } from "zod";

import { authClient } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(
      authClient.session.get.queryOptions(),
    );
    if (session) {
      throw redirect({ to: "/" });
    }
  },
  loader: async ({ context }) => {
    const lastUsedLoginMethod = await context.queryClient.ensureQueryData(
      authClient.session.lastUsedLoginMethod.queryOptions(),
    );
    return { lastUsedLoginMethod };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Outlet />
    </div>
  );
}
