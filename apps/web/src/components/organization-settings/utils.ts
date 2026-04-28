import type { QueryClient } from "@tanstack/react-query";

import { authClient } from "@/lib/auth";

const ORGANIZATION_ROLES = ["owner", "admin", "member"] as const;

export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];
type RoleVariant = "default" | "outline" | "secondary";

const ROLE_LABELS: Record<OrganizationRole, string> = {
  admin: "Admin",
  member: "Member",
  owner: "Owner",
};

const ROLE_VARIANTS = {
  admin: "secondary",
  member: "outline",
  owner: "default",
} as const satisfies Record<OrganizationRole, RoleVariant>;

export function isOrganizationRole(role: string): role is OrganizationRole {
  return ORGANIZATION_ROLES.some((allowedRole) => allowedRole === role);
}

export function getRoleLabel(role: string) {
  return isOrganizationRole(role) ? ROLE_LABELS[role] : role;
}

export function getRoleVariant(role: string) {
  return isOrganizationRole(role) ? ROLE_VARIANTS[role] : "outline";
}

export function getAssignableRoles(currentRole: string | null | undefined) {
  if (currentRole === "owner") {
    return ORGANIZATION_ROLES;
  }

  if (currentRole === "admin") {
    return ["admin", "member"] as const;
  }

  return [] as const;
}

export function formatOrganizationDate(value: Date | string | null | undefined) {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}

export async function invalidateOrganizationQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: authClient.getSession.key() }),
    queryClient.invalidateQueries({ queryKey: authClient.organization.key() }),
  ]);
}
