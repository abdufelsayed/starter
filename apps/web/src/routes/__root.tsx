import type { QueryClient } from "@tanstack/react-query";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { ThemeProvider } from "better-themes";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

import { webUrls } from "@starter/env/web";
import { TooltipProvider } from "@starter/ui/components/tooltip";
import appCss from "@starter/ui/globals.css?url";

import { seo } from "@/lib/seo";
import { routeLoggingMiddleware } from "@/middleware/route-logging";
import { ErrorBoundary } from "../components/error-boundary";
import { NotFound } from "../components/not-found";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      ...seo({
        title: "Starter - A modern full-stack boilerplate for building web applications",
        description:
          "A production-ready starter boilerplate with modern tooling for building full-stack web applications, APIs, and automation workflows.",
        keywords: "boilerplate, starter template, full-stack, web development",
        image: webUrls.appPath("/icon.png"),
        url: webUrls.app,
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "icon", href: "/icon.png", type: "image/png", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-icon.png", sizes: "180x180" },
    ],
  }),
  notFoundComponent: NotFound,
  server: { middleware: [routeLoggingMiddleware] },
  shellComponent: RootDocument,
});

function RootComponent() {
  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body
        className="flex min-h-screen w-full flex-col font-sans antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <Toaster />
            <ClientDevtools />
          </TooltipProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

function ClientDevtools() {
  const [Devtools, setDevtools] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (import.meta.env.SSR || !import.meta.env.DEV) return undefined;

    let mounted = true;

    async function loadDevtools() {
      const [
        { TanStackDevtools },
        { TanStackRouterDevtoolsPanel },
        { default: TanStackQueryDevtools },
      ] = await Promise.all([
        import("@tanstack/react-devtools"),
        import("@tanstack/react-router-devtools"),
        import("../lib/tanstack-query/devtools"),
      ]);

      if (!mounted) return;

      setDevtools(
        () =>
          function DevtoolsPanel() {
            return (
              <TanStackDevtools
                config={{
                  position: "bottom-left",
                }}
                plugins={[
                  {
                    name: "Tanstack Router",
                    render: <TanStackRouterDevtoolsPanel />,
                  },
                  TanStackQueryDevtools,
                ]}
              />
            );
          },
      );
    }

    void loadDevtools();

    return () => {
      mounted = false;
    };
  }, []);

  return Devtools ? <Devtools /> : null;
}
