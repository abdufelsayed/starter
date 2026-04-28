import { useMutation, useQuery, useQueryClient, useSuspenseQueries } from "@tanstack/react-query";
import { ArrowRightIcon, Building2Icon, LoaderIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@starter/ui/components/badge";
import { Button } from "@starter/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@starter/ui/components/card";
import { NativeSelect, NativeSelectOption } from "@starter/ui/components/native-select";

import { authClient } from "@/lib/auth";
import { getRoleLabel, getRoleVariant, invalidateOrganizationQueries } from "./utils";

export function OrganizationSummary({
  onBack,
  onCreate,
}: {
  onBack?: () => void;
  onCreate?: () => void;
}) {
  const queryClient = useQueryClient();
  const [{ data: session }, { data: organizations }] = useSuspenseQueries({
    queries: [authClient.getSession.queryOptions(), authClient.organization.list.queryOptions()],
  });
  const activeOrganization = organizations?.find(
    (organization) => organization.id === session?.session.activeOrganizationId,
  );
  const { data: activeRole } = useQuery(
    authClient.organization.getActiveMemberRole.queryOptions({
      enabled: Boolean(activeOrganization),
      input: activeOrganization ? { query: { organizationId: activeOrganization.id } } : undefined,
      retry: false,
    }),
  );

  const setActive = useMutation(
    authClient.organization.setActive.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: async () => {
        await invalidateOrganizationQueries(queryClient);
      },
    }),
  );

  return (
    <Card className="rounded-xl shadow-none ring-0">
      <CardHeader>
        <CardTitle>Organization</CardTitle>
        <CardDescription>Switch between organizations and manage the active one.</CardDescription>
        {onBack ? (
          <CardAction>
            <Button type="button" variant="ghost" size="icon" onClick={onBack}>
              <ArrowRightIcon className="size-3.5" />
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <Building2Icon className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-medium">
                {activeOrganization?.name ?? "No active organization"}
              </span>
              {activeRole ? (
                <Badge variant={getRoleVariant(activeRole.role)}>
                  {getRoleLabel(activeRole.role)}
                </Badge>
              ) : null}
            </div>
            {activeOrganization?.slug ? (
              <p className="text-xs text-muted-foreground">/{activeOrganization.slug}</p>
            ) : null}
          </div>
        </div>

        {organizations?.length ? (
          <NativeSelect
            className="w-full"
            value={session?.session.activeOrganizationId ?? ""}
            disabled={setActive.isPending}
            onChange={(event) => {
              const organizationId = event.target.value;
              if (!organizationId || organizationId === session?.session.activeOrganizationId) {
                return;
              }

              setActive.mutate({ organizationId });
            }}
          >
            {organizations.map((organization) => (
              <NativeSelectOption key={organization.id} value={organization.id}>
                {organization.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        ) : null}
      </CardContent>
      <CardFooter>
        <Button type="button" size="sm" variant="outline" className="ml-auto" onClick={onCreate}>
          {setActive.isPending ? (
            <LoaderIcon className="mr-2 size-4 animate-spin" />
          ) : (
            <PlusIcon className="mr-2 size-4" />
          )}
          Create Organization
        </Button>
      </CardFooter>
    </Card>
  );
}
