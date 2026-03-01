import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(marketing)/terms")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(marketing)/terms"!</div>;
}
