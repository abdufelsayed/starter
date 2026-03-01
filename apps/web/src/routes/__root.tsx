import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "better-themes";
import { Toaster } from "sonner";

import { webEnv } from "@starter/env/web";
import { TooltipProvider } from "@starter/ui/components/tooltip";
import appCss from "@starter/ui/globals.css?url";

import { seo } from "@/lib/seo";
import { routeLoggingMiddleware } from "@/middleware/route-logging";
import { ErrorBoundary } from "../components/error-boundary";
import { NotFound } from "../components/not-found";
import TanStackQueryDevtools from "../lib/tanstack-query/devtools";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  server: { middleware: [routeLoggingMiddleware] },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      ...seo({
        title: "Starter - A modern full-stack boilerplate for building web applications",
        description:
          "A production-ready starter boilerplate with modern tooling for building full-stack web applications, APIs, and automation workflows.",
        keywords: "boilerplate, starter template, full-stack, web development",
        image: webEnv.VITE_WEB_URL + "/icon.png",
        url: webEnv.VITE_WEB_URL,
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "icon", href: "/icon.png", type: "image/png", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-icon.png", sizes: "180x180" },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
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
      <body className="flex min-h-screen w-full flex-col font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <Toaster />
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
          </TooltipProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
