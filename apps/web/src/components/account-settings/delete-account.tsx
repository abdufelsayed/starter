import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { LoaderIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@starter/ui/components/alert-dialog";
import { Button } from "@starter/ui/components/button";
import { Field, FieldLabel } from "@starter/ui/components/field";
import { Input } from "@starter/ui/components/input";

import { authClient } from "@/lib/auth";

const CONFIRMATION_TEXT = "delete my account";

export function DeleteAccount() {
  const { data: session } = useSuspenseQuery(authClient.getSession.queryOptions());
  const queryClient = useQueryClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const deleteUser = useMutation(
    authClient.deleteUser.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: async () => {
        queryClient.clear();
        await router.navigate({ to: "/auth/sign-in" });
        toast.success("Account deleted", {
          description: "Your account has been permanently deleted.",
        });
      },
    }),
  );

  const isConfirmed = confirmText === CONFIRMATION_TEXT && password.length > 0;

  const resetState = () => {
    setPassword("");
    setConfirmText("");
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-destructive/80">
        Permanently remove your account and all of its contents. This action is not reversible, so
        please continue with caution.
      </p>
      <div className="flex items-center justify-between border-t border-destructive/20 pt-3">
        <div />
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
            Delete Account
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your account{" "}
                <span className="font-semibold text-foreground">{session?.user.email}</span>, remove
                all of your data, cancel any active subscriptions, and revoke all sessions. This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4">
              <Field>
                <FieldLabel htmlFor="delete-confirm-text">
                  To confirm, type{" "}
                  <span className="font-semibold text-destructive select-none">
                    {CONFIRMATION_TEXT}
                  </span>{" "}
                  below
                </FieldLabel>
                <Input
                  id="delete-confirm-text"
                  placeholder={CONFIRMATION_TEXT}
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="delete-password">Enter your password to confirm</FieldLabel>
                <Input
                  id="delete-password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel size="sm" variant="outline" onClick={resetState}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={!isConfirmed || deleteUser.isPending}
                onClick={() => {
                  deleteUser.mutate({
                    callbackURL: "/auth/sign-in",
                    password,
                  });
                }}
              >
                {deleteUser.isPending && <LoaderIcon className="mr-2 size-4 animate-spin" />}
                Permanently Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
