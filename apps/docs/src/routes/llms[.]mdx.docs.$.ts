import { createFileRoute, notFound } from "@tanstack/react-router";

import { source, toSourcePage } from "@/lib/source";

export const Route = createFileRoute("/llms.mdx/docs/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const slugs = params._splat?.split("/") ?? [];
        const page = source.getPage(slugs);
        if (!page) throw notFound();
        const sourcePage = toSourcePage(page);

        return new Response(await sourcePage.data.getText("processed"), {
          headers: {
            "Content-Type": "text/markdown",
          },
        });
      },
    },
  },
});
