import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import { authClient } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  beforeLoad: async ({ context, location }) => {
    if (location.pathname === "/auth/error") return;
    const session = await context.queryClient.ensureQueryData(authClient.getSession.queryOptions());
    if (session) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
  loader: async ({ context }) => {
    const lastUsedLoginMethod = await context.queryClient.ensureQueryData(
      authClient.getLastUsedLoginMethod.queryOptions(),
    );
    return { lastUsedLoginMethod };
  },
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
});

function RouteComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Outlet />
    </div>
  );
}
