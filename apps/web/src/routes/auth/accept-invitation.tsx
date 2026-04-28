import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertCircleIcon,
  CheckIcon,
  LoaderIcon,
  LogInIcon,
  UserPlusIcon,
  UserRoundPlusIcon,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@starter/ui/components/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@starter/ui/components/card";

import { authClient } from "@/lib/auth";
import { Shell } from "@/routes/auth/-components/shell";
import { SupportLinks } from "@/routes/auth/-components/support-links";

const acceptInvitationSearchSchema = z.object({
  invitationId: z.string().optional(),
});

export const Route = createFileRoute("/auth/accept-invitation")({
  component: AcceptInvitationPage,
  validateSearch: acceptInvitationSearchSchema,
});

function AcceptInvitationPage() {
  const { invitationId } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session } = useSuspenseQuery(authClient.getSession.queryOptions());

  const acceptInvitation = useMutation(
    authClient.organization.acceptInvitation.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: authClient.getSession.key() });
        toast.success("Invitation accepted");
        await navigate({ to: "/dashboard" });
      },
      onError: (error) => {
        toast.error("Unable to accept invitation", {
          description: error.message,
        });
      },
    }),
  );

  if (!invitationId) {
    return (
      <Shell>
        <CardHeader className="flex flex-col items-start justify-start">
          <CardTitle className="flex flex-col gap-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircleIcon className="size-5 text-destructive" />
            </div>
            <span className="text-xl">Invalid invitation link</span>
          </CardTitle>
          <CardDescription>
            This invitation link is missing its invitation ID. Ask for a new invitation and try
            again.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button variant="outline" render={<Link to="/auth/sign-in" />}>
            Back to sign in
          </Button>
          <div className="flex items-center justify-end text-xs text-muted-foreground">
            <SupportLinks />
          </div>
        </CardContent>
      </Shell>
    );
  }

  if (!session) {
    const redirect = `/auth/accept-invitation?invitationId=${encodeURIComponent(invitationId)}`;

    return (
      <Shell>
        <CardHeader className="flex flex-col items-start justify-start">
          <CardTitle className="flex flex-col gap-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <LogInIcon className="size-5 text-primary" />
            </div>
            <span className="text-xl">Sign in to accept</span>
          </CardTitle>
          <CardDescription>
            Sign in with the invited email address before accepting this organization invitation.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button render={<Link to="/auth/sign-in" search={{ redirect }} />}>
            <LogInIcon className="size-4" />
            Sign in
          </Button>
          <Button variant="outline" render={<Link to="/auth/sign-up" search={{ redirect }} />}>
            <UserRoundPlusIcon className="size-4" />
            Create account
          </Button>
          <div className="flex items-center justify-end text-xs text-muted-foreground">
            <SupportLinks />
          </div>
        </CardContent>
      </Shell>
    );
  }

  return (
    <Shell>
      <CardHeader className="flex flex-col items-start justify-start">
        <CardTitle className="flex flex-col gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <UserPlusIcon className="size-5 text-primary" />
          </div>
          <span className="text-xl">Accept invitation</span>
        </CardTitle>
        <CardDescription>
          Accept this invitation to join the organization with your current account.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button
          disabled={acceptInvitation.isPending}
          onClick={() => acceptInvitation.mutate({ invitationId })}
        >
          {acceptInvitation.isPending ? (
            <LoaderIcon className="size-4 animate-spin" />
          ) : (
            <CheckIcon className="size-4" />
          )}
          Accept invitation
        </Button>
        <div className="flex items-center justify-end text-xs text-muted-foreground">
          <SupportLinks />
        </div>
      </CardContent>
    </Shell>
  );
}
