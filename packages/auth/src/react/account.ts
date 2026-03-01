import type { BetterAuthClient } from "./client";
import { createMutation, createQuery } from "./utils";

const KEY = ["auth", "account"] as const;

export function createAccountModule(client: BetterAuthClient) {
  return {
    key: () => [...KEY],

    updateUser: createMutation({
      key: [...KEY, "updateUser"],
      mutationFn: async (data: { name?: string; image?: string }) => {
        const result = await client.updateUser(data);
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    changeEmail: createMutation({
      key: [...KEY, "changeEmail"],
      mutationFn: async (data: { newEmail: string }) => {
        const result = await client.changeEmail({ newEmail: data.newEmail });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    changePassword: createMutation({
      key: [...KEY, "changePassword"],
      mutationFn: async (data: {
        currentPassword: string;
        newPassword: string;
        revokeOtherSessions?: boolean;
      }) => {
        const result = await client.changePassword(data);
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    revokeSession: createMutation({
      key: [...KEY, "revokeSession"],
      mutationFn: async (data: { token: string }) => {
        const result = await client.revokeSession({ token: data.token });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    requestPasswordReset: createMutation({
      key: [...KEY, "requestPasswordReset"],
      mutationFn: async (data: { email: string; redirectTo?: string }) => {
        const result = await client.requestPasswordReset({
          email: data.email,
          redirectTo: data.redirectTo ?? "/auth/reset-password",
        });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    resetPassword: createMutation({
      key: [...KEY, "resetPassword"],
      mutationFn: async (data: { newPassword: string; token: string }) => {
        const result = await client.resetPassword({
          newPassword: data.newPassword,
          token: data.token,
        });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    listAccounts: createQuery({
      key: [...KEY, "listAccounts"],
      queryFn: async () => {
        const result = await client.listAccounts();
        if (result.error) throw result.error;
        return result.data;
      },
      defaults: { staleTime: Infinity },
    }),

    linkSocial: createMutation({
      key: [...KEY, "linkSocial"],
      mutationFn: async (data: { provider: "google" | "github"; callbackURL?: string }) => {
        const result = await client.linkSocial(data);
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    unlinkAccount: createMutation({
      key: [...KEY, "unlinkAccount"],
      mutationFn: async (data: { providerId: string; accountId?: string }) => {
        const result = await client.unlinkAccount(data);
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    deleteUser: createMutation({
      key: [...KEY, "deleteUser"],
      mutationFn: async (data: { password?: string; callbackURL?: string }) => {
        const result = await client.deleteUser(data);
        if (result.error) throw result.error;
        return result.data;
      },
    }),
  };
}
