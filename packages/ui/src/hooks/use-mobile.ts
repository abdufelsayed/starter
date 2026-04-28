import * as React from "react";

const MOBILE_BREAKPOINT = 768;
const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

const subscribers = new Set<() => void>();
let mobileMediaQuery: MediaQueryList | undefined;

function getMobileMediaQuery() {
  if (typeof window === "undefined") {
    return undefined;
  }

  mobileMediaQuery ??= window.matchMedia(MOBILE_MEDIA_QUERY);
  return mobileMediaQuery;
}

function notifySubscribers() {
  for (const subscriber of subscribers) {
    subscriber();
  }
}

function subscribe(callback: () => void) {
  const mediaQuery = getMobileMediaQuery();
  if (!mediaQuery) {
    return () => {};
  }

  subscribers.add(callback);

  if (subscribers.size === 1) {
    mediaQuery.addEventListener("change", notifySubscribers);
  }

  return () => {
    subscribers.delete(callback);

    if (subscribers.size === 0) {
      mediaQuery.removeEventListener("change", notifySubscribers);
    }
  };
}

function getSnapshot() {
  return getMobileMediaQuery()?.matches ?? false;
}

function getServerSnapshot() {
  return false;
}

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
