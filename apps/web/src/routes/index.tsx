import { Link, createFileRoute } from "@tanstack/react-router";

import { buttonVariants } from "@starter/ui/components/button";

import { authClient } from "@/lib/auth";
import { routeLoggingMiddleware } from "@/middleware/route-logging";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(authClient.getSession.queryOptions());
    return { session };
  },
  server: { middleware: [routeLoggingMiddleware] },
});

function RouteComponent() {
  const { session } = Route.useLoaderData();

  return (
    <div className="flex min-h-screen items-center justify-center">
      {session ? (
        <Link to="/dashboard" className={buttonVariants({ variant: "default" })}>
          Dashboard
        </Link>
      ) : (
        <>
          <Link to="/auth/sign-in" className={buttonVariants({ variant: "default" })}>
            Sign In
          </Link>
          <Link to="/auth/sign-up" className={buttonVariants({ variant: "outline" })}>
            Sign Up
          </Link>
        </>
      )}
    </div>
  );
}
