export const seo = ({
  title,
  description,
  keywords,
  image,
  url,
}: {
  title: string;
  description?: string;
  image?: string;
  keywords?: string;
  url?: string;
}) => {
  const tags = [
    { title },
    { content: description, name: "description" },
    { content: keywords, name: "keywords" },
    // Twitter Card tags
    { content: title, name: "twitter:title" },
    { content: description, name: "twitter:description" },
    { content: "@abdufelsayed", name: "twitter:creator" },
    { content: "@abdufelsayed", name: "twitter:site" },
    { content: image ? "summary_large_image" : "summary", name: "twitter:card" },
    // Open Graph tags (use property, not name)
    { content: "website", property: "og:type" },
    { content: title, property: "og:title" },
    { content: description, property: "og:description" },
    ...(url
      ? [
          { content: url, property: "og:url" },
          { content: url, name: "twitter:url" },
        ]
      : []),
    ...(image
      ? [
          { content: image, name: "twitter:image" },
          { content: image, property: "og:image" },
        ]
      : []),
  ];

  return tags;
};
