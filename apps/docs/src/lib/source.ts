import { type InferPageType, loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { docs } from "fumadocs-mdx:collections/server";
import type { DocMethods } from "fumadocs-mdx/runtime/types";

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: "/docs",
  plugins: [lucideIconsPlugin()],
});

export type SourcePage = InferPageType<typeof source> & {
  data: DocMethods;
};

export async function getLLMText(page: SourcePage) {
  const processed = await page.data.getText("processed");

  return `# ${page.data.title}

${processed}`;
}
