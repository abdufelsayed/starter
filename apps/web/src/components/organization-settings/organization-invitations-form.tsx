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

export function OrganizationInvitationsForm({ onBack }: { onBack?: () => void }) {
  const queryClient = useQueryClient();
  const { data: invitations } = useSuspenseQuery(
    authClient.organization.listInvitations.queryOptions(),
  );

  const cancelInvitation = useMutation(
    authClient.organization.cancelInvitation.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const resendInvitation = useMutation(
    authClient.organization.inviteMember.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  return (
    <Card className="rounded-xl shadow-none ring-0">
      <CardHeader>
        <CardTitle>Invitations</CardTitle>
        <CardDescription>Manage pending invitations for the active organization.</CardDescription>
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
          <p className="text-sm text-muted-foreground">No pending invitations.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations?.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell>{invitation.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getRoleLabel(invitation.role ?? "member")}</Badge>
                  </TableCell>
                  <TableCell>{formatOrganizationDate(invitation.expiresAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={resendInvitation.isPending}
                        onClick={async () => {
                          await resendInvitation.mutateAsync({
                            email: invitation.email,
                            organizationId: invitation.organizationId,
                            resend: true,
                            role: invitation.role ?? "member",
                          });
                          await invalidateOrganizationQueries(queryClient);
                          toast.success("Invitation resent");
                        }}
                      >
                        {resendInvitation.isPending && (
                          <LoaderIcon className="mr-2 size-4 animate-spin" />
                        )}
                        Resend
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={cancelInvitation.isPending}
                        onClick={async () => {
                          await cancelInvitation.mutateAsync({ invitationId: invitation.id });
                          await invalidateOrganizationQueries(queryClient);
                          toast.success("Invitation cancelled");
                        }}
                      >
                        {cancelInvitation.isPending && (
                          <LoaderIcon className="mr-2 size-4 animate-spin" />
                        )}
                        Cancel
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
