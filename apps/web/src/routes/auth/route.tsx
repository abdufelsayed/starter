import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import { authClient } from "@/lib/auth";
import { getSafeRedirectPath } from "@/lib/auth-redirect";

export const Route = createFileRoute("/auth")({
  beforeLoad: async ({ context, location }) => {
    if (location.pathname === "/auth/error" || location.pathname === "/auth/accept-invitation") {
      return;
    }
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
    redirect: z.string().optional().transform(getSafeRedirectPath),
  }),
});

function RouteComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Outlet />
    </div>
  );
}
