import { webUrls } from "@starter/env/web";

function isAppPath(path: string): path is `/${string}` {
  return path.startsWith("/") && !path.startsWith("//");
}

export function getSafeRedirectPath(redirect: string | undefined): string | undefined {
  if (!redirect) return undefined;
  if (!isAppPath(redirect)) return undefined;
  return redirect;
}

function getSafeAppPath(redirect: string | undefined): `/${string}` {
  if (!redirect) return "/";
  if (!isAppPath(redirect)) return "/";
  return redirect;
}

export function getAuthCallbackURL(redirect: string | undefined): string {
  return webUrls.appPath(getSafeAppPath(redirect));
}
