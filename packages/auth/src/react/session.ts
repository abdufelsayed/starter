import type { BetterAuthClient } from "./client";
import { createMutation, createQuery } from "./utils";

const KEY = ["auth", "session"] as const;

export function createSessionModule(client: BetterAuthClient) {
  return {
    key: () => [...KEY],

    get: createQuery({
      key: [...KEY, "get"],
      queryFn: async () => {
        const result = await client.getSession();
        if (result.error) throw result.error;
        return result.data;
      },
      defaults: { staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000 },
    }),

    list: createQuery({
      key: [...KEY, "list"],
      queryFn: async () => {
        const result = await client.listSessions();
        if (result.error) throw result.error;
        return result.data;
      },
      defaults: { staleTime: Infinity },
    }),

    lastUsedLoginMethod: createQuery({
      key: [...KEY, "lastUsedLoginMethod"],
      queryFn: async () => {
        const lastUsedLoginMethod = await client.getLastUsedLoginMethod();
        return lastUsedLoginMethod as
          | "github"
          | "microsoft"
          | "google"
          | "email"
          | "magic_link"
          | null;
      },
      defaults: { staleTime: Infinity },
    }),

    signInEmail: createMutation({
      key: [...KEY, "signInEmail"],
      mutationFn: async (data: {
        email: string;
        password: string;
        rememberMe?: boolean;
        callbackURL?: string;
      }) => {
        const result = await client.signIn.email(data);
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    signUpEmail: createMutation({
      key: [...KEY, "signUpEmail"],
      mutationFn: async (data: {
        name: string;
        email: string;
        password: string;
        callbackURL?: string;
      }) => {
        const result = await client.signUp.email(data);
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    signInSocial: createMutation({
      key: [...KEY, "signInSocial"],
      mutationFn: async (data: { provider: "google" | "github"; callbackURL?: string }) => {
        const result = await client.signIn.social(data);
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    signOut: createMutation({
      key: [...KEY, "signOut"],
      mutationFn: async () => {
        const result = await client.signOut();
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    sendVerificationEmail: createMutation({
      key: [...KEY, "sendVerificationEmail"],
      mutationFn: async (data: { email: string; callbackURL: string }) => {
        const result = await client.sendVerificationEmail(data);
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    signInMagicLink: createMutation({
      key: [...KEY, "signInMagicLink"],
      mutationFn: async (data: { email: string; callbackURL?: string }) => {
        const result = await client.signIn.magicLink(data);
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    verifyMagicLink: createMutation({
      key: [...KEY, "verifyMagicLink"],
      mutationFn: async (data: { token: string; callbackURL?: string }) => {
        const result = await client.magicLink.verify({
          query: { token: data.token, callbackURL: data.callbackURL },
        });
        if (result.error) throw result.error;
        return result.data;
      },
    }),
  };
}
