import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Laptop, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { UAParser } from "ua-parser-js";

import { Button } from "@starter/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@starter/ui/components/card";

import { authClient } from "@/lib/auth";

export function SessionsList() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: sessionData } = useQuery(authClient.session.get.queryOptions());
  const { data: sessions } = useQuery(authClient.session.list.queryOptions());
  const revokeSession = useMutation(
    authClient.account.revokeSession.mutationOptions({
      onSuccess: () => {
        toast.success("Session revoked successfully");
        queryClient.invalidateQueries({ queryKey: authClient.session.key() });
      },
      onError: () => {
        toast.error("Failed to revoke session");
      },
    }),
  );
  const signOut = useMutation(
    authClient.session.signOut.mutationOptions({
      onSuccess: () => {
        queryClient.clear();
        router.navigate({ to: "/auth/sign-in" });
      },
      onError: (error) => {
        toast.error("Failed to sign out", { description: error.message });
      },
    }),
  );

  const currentSession = sessionData?.session;

  const handleRevoke = (session: { id: string; token: string }) => {
    if (session.id === currentSession?.id) {
      signOut.mutate();
      return;
    }
    revokeSession.mutate({ token: session.token });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions</CardTitle>
        <CardDescription>Manage your active sessions and revoke access.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {sessions?.map((s) => {
            const parser = UAParser(s.userAgent as string);
            const isMobile = parser.device.type === "mobile";
            const isCurrentSession = s.id === currentSession?.id;

            const isRevoking =
              (revokeSession.isPending && revokeSession.variables?.token === s.token) ||
              (isCurrentSession && signOut.isPending);

            return (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {isMobile ? <Smartphone className="size-4" /> : <Laptop className="size-4" />}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {isCurrentSession ? "Current Session" : s.ipAddress}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {parser.os.name}, {parser.browser.name}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  disabled={isRevoking}
                  size="sm"
                  variant="outline"
                  onClick={() => handleRevoke(s)}
                >
                  {isRevoking && <Loader2 className="mr-2 size-4 animate-spin" />}
                  {isCurrentSession ? "Sign Out" : "Revoke"}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
