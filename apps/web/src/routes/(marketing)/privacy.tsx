import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(marketing)/privacy")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(marketing)/privacy"!</div>;
}
