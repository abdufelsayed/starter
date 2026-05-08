import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { NotFound } from "./components/not-found";
import * as TanstackQuery from "./lib/tanstack-query/root-provider";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const reactQueryContext = TanstackQuery.getContext();

  const router = createRouter({
    Wrap: (props: { children: React.ReactNode }) => {
      return (
        <TanstackQuery.Provider {...reactQueryContext}>{props.children}</TanstackQuery.Provider>
      );
    },
    context: { ...reactQueryContext },
    defaultNotFoundComponent: NotFound,
    defaultPreload: "intent",
    routeTree,
  });

  setupRouterSsrQueryIntegration({
    queryClient: reactQueryContext.queryClient,
    router,
  });

  if (!import.meta.env.SSR && !import.meta.env.DEV) {
    void (async () => {
      const Sentry = await import("@sentry/tanstackstart-react");
      const integrations = [
        Sentry.tanstackRouterBrowserTracingIntegration(router),
        Sentry.replayIntegration(),
        Sentry.browserProfilingIntegration(),
      ];

      Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.MODE,
        release: import.meta.env.VITE_APP_VERSION ?? "development",

        // Adds request headers and IP for users, for more info visit:
        // https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react/configuration/options/#sendDefaultPii
        sendDefaultPii: true,

        integrations,

        // Adjust sample rates for production vs development
        tracesSampleRate: import.meta.env.DEV ? 0.1 : 1,

        // Capture Replay for 10% of all sessions,
        // Plus for 100% of sessions with an error.
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1,

        // Enable profiling for performance insights
        profilesSampleRate: import.meta.env.DEV ? 0.1 : 1,
      });
    })();
  }

  return router;
};
