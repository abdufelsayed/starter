import type { BetterAuthClient } from "./client";
import { createMutation, createQuery, createQueryWithInput } from "./utils";

const KEY = ["auth", "organization"] as const;

type OrgRole = "member" | "admin" | "owner";

export function createOrganizationModule(client: BetterAuthClient) {
  return {
    key: () => [...KEY],

    list: createQuery({
      key: [...KEY, "list"],
      queryFn: async () => {
        const result = await client.organization.list();
        if (result.error) throw result.error;
        return result.data;
      },
      defaults: { staleTime: 5 * 60 * 1000 },
    }),

    getFullOrganization: createQueryWithInput({
      key: [...KEY, "getFullOrganization"],
      queryFn: async (input: { organizationId?: string; organizationSlug?: string }) => {
        const result = await client.organization.getFullOrganization({
          query: input,
        });
        if (result.error) throw result.error;
        return result.data;
      },
      defaults: { staleTime: 5 * 60 * 1000 },
    }),

    listMembers: createQueryWithInput({
      key: [...KEY, "listMembers"],
      queryFn: async (input: { organizationId?: string }) => {
        const result = await client.organization.listMembers({
          query: input,
        });
        if (result.error) throw result.error;
        return result.data;
      },
      defaults: { staleTime: 5 * 60 * 1000 },
    }),

    getActiveMember: createQueryWithInput({
      key: [...KEY, "getActiveMember"],
      queryFn: async (input: { organizationId?: string }) => {
        const result = await client.organization.getActiveMember({
          query: input,
        });
        if (result.error) throw result.error;
        return result.data;
      },
      defaults: { staleTime: 5 * 60 * 1000 },
    }),

    listInvitations: createQueryWithInput({
      key: [...KEY, "listInvitations"],
      queryFn: async (input: { organizationId?: string }) => {
        const result = await client.organization.listInvitations({
          query: input,
        });
        if (result.error) throw result.error;
        return result.data;
      },
      defaults: { staleTime: 5 * 60 * 1000 },
    }),

    listUserInvitations: createQuery({
      key: [...KEY, "listUserInvitations"],
      queryFn: async () => {
        const result = await client.organization.listUserInvitations();
        if (result.error) throw result.error;
        return result.data;
      },
      defaults: { staleTime: 5 * 60 * 1000 },
    }),

    checkSlug: createQueryWithInput({
      key: [...KEY, "checkSlug"],
      queryFn: async (input: { slug: string }) => {
        const result = await client.organization.checkSlug({
          slug: input.slug,
        });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    create: createMutation({
      key: [...KEY, "create"],
      mutationFn: async (data: {
        name: string;
        slug: string;
        logo?: string;
        metadata?: Record<string, string>;
      }) => {
        const result = await client.organization.create(data);
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    update: createMutation({
      key: [...KEY, "update"],
      mutationFn: async (data: {
        organizationId?: string;
        data: { name?: string; slug?: string; logo?: string; metadata?: Record<string, string> };
      }) => {
        const result = await client.organization.update({
          organizationId: data.organizationId,
          data: data.data,
        });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    delete: createMutation({
      key: [...KEY, "delete"],
      mutationFn: async (data: { organizationId: string }) => {
        const result = await client.organization.delete({
          organizationId: data.organizationId,
        });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    setActive: createMutation({
      key: [...KEY, "setActive"],
      mutationFn: async (data: { organizationId?: string; organizationSlug?: string }) => {
        const result = await client.organization.setActive(data);
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    removeMember: createMutation({
      key: [...KEY, "removeMember"],
      mutationFn: async (data: { memberIdOrEmail: string; organizationId?: string }) => {
        const result = await client.organization.removeMember(data);
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    updateMemberRole: createMutation({
      key: [...KEY, "updateMemberRole"],
      mutationFn: async (data: { memberId: string; role: OrgRole; organizationId?: string }) => {
        const result = await client.organization.updateMemberRole(data);
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    leave: createMutation({
      key: [...KEY, "leave"],
      mutationFn: async (data: { organizationId: string }) => {
        const result = await client.organization.leave({
          organizationId: data.organizationId,
        });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    inviteMember: createMutation({
      key: [...KEY, "inviteMember"],
      mutationFn: async (data: {
        email: string;
        role: OrgRole;
        organizationId?: string;
        resend?: boolean;
      }) => {
        const result = await client.organization.inviteMember(data);
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    cancelInvitation: createMutation({
      key: [...KEY, "cancelInvitation"],
      mutationFn: async (data: { invitationId: string }) => {
        const result = await client.organization.cancelInvitation({
          invitationId: data.invitationId,
        });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    acceptInvitation: createMutation({
      key: [...KEY, "acceptInvitation"],
      mutationFn: async (data: { invitationId: string }) => {
        const result = await client.organization.acceptInvitation({
          invitationId: data.invitationId,
        });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    rejectInvitation: createMutation({
      key: [...KEY, "rejectInvitation"],
      mutationFn: async (data: { invitationId: string }) => {
        const result = await client.organization.rejectInvitation({
          invitationId: data.invitationId,
        });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    hasPermission: createMutation({
      key: [...KEY, "hasPermission"],
      mutationFn: async (data: {
        permissions: {
          organization?: ("update" | "delete")[];
          member?: ("create" | "update" | "delete")[];
          invitation?: ("create" | "cancel")[];
          team?: ("create" | "update" | "delete")[];
        };
        organizationId?: string;
      }) => {
        const result = await client.organization.hasPermission(data);
        if (result.error) throw result.error;
        return result.data;
      },
    }),
  };
}
