import { createFileRoute } from "@tanstack/react-router";

import { AccountSettings } from "@/components/account-settings";

export const Route = createFileRoute("/_protected/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-screen w-full justify-center pt-20">
      <div>
        <AccountSettings />
      </div>
    </div>
  );
}
