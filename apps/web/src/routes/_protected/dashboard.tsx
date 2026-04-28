import { createFileRoute } from "@tanstack/react-router";

import { AccountSettings } from "@/components/account-settings";

export const Route = createFileRoute("/_protected/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <AccountSettings />
    </div>
  );
}
