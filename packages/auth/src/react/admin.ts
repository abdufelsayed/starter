import type { BetterAuthClient } from "./client";
import { createMutation, createQueryWithInput } from "./utils";

const KEY = ["auth", "admin"] as const;

export function createAdminModule(client: BetterAuthClient) {
  return {
    key: () => [...KEY],

    listUsers: createQueryWithInput({
      key: [...KEY, "listUsers"],
      queryFn: async (
        input:
          | {
              searchValue?: string;
              searchField?: "email" | "name";
              searchOperator?: "contains" | "starts_with" | "ends_with";
              limit?: number | string;
              offset?: number | string;
              sortBy?: string;
              sortDirection?: "asc" | "desc";
              filterField?: string;
              filterValue?: string;
              filterOperator?: "eq" | "ne" | "lt" | "lte" | "gt" | "gte";
            }
          | undefined,
      ) => {
        const result = await client.admin.listUsers({ query: input ?? {} });
        if (result.error) throw result.error;
        return result.data;
      },
      defaults: { staleTime: Infinity },
    }),

    getUser: createQueryWithInput({
      key: [...KEY, "getUser"],
      queryFn: async (input: { userId: string }) => {
        const result = await client.admin.getUser({ query: { id: input.userId } });
        if (result.error) throw result.error;
        return result.data;
      },
      defaults: { staleTime: Infinity },
    }),

    listUserSessions: createQueryWithInput({
      key: [...KEY, "listUserSessions"],
      queryFn: async (input: { userId: string }) => {
        const result = await client.admin.listUserSessions({ userId: input.userId });
        if (result.error) throw result.error;
        return result.data;
      },
      defaults: { staleTime: Infinity },
    }),

    createUser: createMutation({
      key: [...KEY, "createUser"],
      mutationFn: async (data: {
        email: string;
        password: string;
        name: string;
        role?: "user" | "admin";
        data?: Record<string, unknown>;
      }) => {
        const result = await client.admin.createUser(data);
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    updateUser: createMutation({
      key: [...KEY, "updateUser"],
      mutationFn: async (data: { userId: string; data: Record<string, unknown> }) => {
        const result = await client.admin.updateUser({
          userId: data.userId,
          data: data.data,
        });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    removeUser: createMutation({
      key: [...KEY, "removeUser"],
      mutationFn: async (data: { userId: string }) => {
        const result = await client.admin.removeUser({ userId: data.userId });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    setRole: createMutation({
      key: [...KEY, "setRole"],
      mutationFn: async (data: { userId: string; role: "user" | "admin" }) => {
        const result = await client.admin.setRole({
          userId: data.userId,
          role: data.role,
        });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    setUserPassword: createMutation({
      key: [...KEY, "setUserPassword"],
      mutationFn: async (data: { userId: string; newPassword: string }) => {
        const result = await client.admin.setUserPassword({
          userId: data.userId,
          newPassword: data.newPassword,
        });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    banUser: createMutation({
      key: [...KEY, "banUser"],
      mutationFn: async (data: { userId: string; banReason?: string; banExpiresIn?: number }) => {
        const result = await client.admin.banUser(data);
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    unbanUser: createMutation({
      key: [...KEY, "unbanUser"],
      mutationFn: async (data: { userId: string }) => {
        const result = await client.admin.unbanUser({ userId: data.userId });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    revokeUserSession: createMutation({
      key: [...KEY, "revokeUserSession"],
      mutationFn: async (data: { sessionToken: string }) => {
        const result = await client.admin.revokeUserSession({
          sessionToken: data.sessionToken,
        });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    revokeUserSessions: createMutation({
      key: [...KEY, "revokeUserSessions"],
      mutationFn: async (data: { userId: string }) => {
        const result = await client.admin.revokeUserSessions({ userId: data.userId });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    impersonateUser: createMutation({
      key: [...KEY, "impersonateUser"],
      mutationFn: async (data: { userId: string }) => {
        const result = await client.admin.impersonateUser({ userId: data.userId });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    stopImpersonating: createMutation({
      key: [...KEY, "stopImpersonating"],
      mutationFn: async () => {
        const result = await client.admin.stopImpersonating();
        if (result.error) throw result.error;
        return result.data;
      },
    }),
  };
}
