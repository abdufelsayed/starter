import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(marketing)/support")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(marketing)/support"!</div>;
}
