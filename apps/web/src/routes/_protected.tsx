import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { authClient } from "@/lib/auth";

export const Route = createFileRoute("/_protected")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(
      authClient.session.get.queryOptions(),
    );
    if (!session) {
      throw redirect({ to: "/auth/sign-in" });
    }
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  return <Outlet />;
}
