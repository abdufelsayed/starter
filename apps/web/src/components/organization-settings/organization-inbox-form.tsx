import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRightIcon, LoaderIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@starter/ui/components/badge";
import { Button } from "@starter/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@starter/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@starter/ui/components/table";

import { authClient } from "@/lib/auth";
import { formatOrganizationDate, getRoleLabel, invalidateOrganizationQueries } from "./utils";

export function OrganizationInboxForm({ onBack }: { onBack?: () => void }) {
  const queryClient = useQueryClient();
  const { data: invitations } = useSuspenseQuery(
    authClient.organization.listUserInvitations.queryOptions(),
  );

  const acceptInvitation = useMutation(
    authClient.organization.acceptInvitation.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const rejectInvitation = useMutation(
    authClient.organization.rejectInvitation.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const setActiveOrganization = useMutation(
    authClient.organization.setActive.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const isPending =
    acceptInvitation.isPending || rejectInvitation.isPending || setActiveOrganization.isPending;

  return (
    <Card className="rounded-xl shadow-none ring-0">
      <CardHeader>
        <CardTitle>Pending Invites</CardTitle>
        <CardDescription>Review invitations sent to your account.</CardDescription>
        {onBack ? (
          <CardAction>
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowRightIcon className="size-3.5" />
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        {invitations?.length === 0 ? (
          <p className="text-sm text-muted-foreground">You do not have any pending invitations.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations?.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium">{invitation.organizationName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getRoleLabel(invitation.role ?? "member")}</Badge>
                  </TableCell>
                  <TableCell>{formatOrganizationDate(invitation.expiresAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={isPending}
                        onClick={async () => {
                          await acceptInvitation.mutateAsync({ invitationId: invitation.id });
                          await setActiveOrganization.mutateAsync({
                            organizationId: invitation.organizationId,
                          });
                          await invalidateOrganizationQueries(queryClient);
                          toast.success("Invitation accepted");
                        }}
                      >
                        {acceptInvitation.isPending && (
                          <LoaderIcon className="mr-2 size-4 animate-spin" />
                        )}
                        Accept
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isPending}
                        onClick={async () => {
                          await rejectInvitation.mutateAsync({ invitationId: invitation.id });
                          await invalidateOrganizationQueries(queryClient);
                          toast.success("Invitation rejected");
                        }}
                      >
                        {rejectInvitation.isPending && (
                          <LoaderIcon className="mr-2 size-4 animate-spin" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
