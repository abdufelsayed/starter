import { type InferPageType, loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import type { DocMethods } from "fumadocs-mdx/runtime/types";
import { docs } from "fumadocs-mdx:collections/server";

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: "/docs",
  plugins: [lucideIconsPlugin()],
});

type LoaderPage = InferPageType<typeof source>;
export type SourcePage = LoaderPage & {
  data: LoaderPage["data"] & DocMethods;
};

export function toSourcePage(page: LoaderPage): SourcePage {
  return page as SourcePage;
}

export async function getLLMText(page: LoaderPage) {
  const sourcePage = toSourcePage(page);
  const processed = await sourcePage.data.getText("processed");

  return `# ${sourcePage.data.title}

${processed}`;
}
