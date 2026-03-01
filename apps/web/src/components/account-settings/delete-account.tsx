import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { LoaderIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@starter/ui/components/alert-dialog";
import { Button } from "@starter/ui/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@starter/ui/components/card";
import { Field, FieldLabel } from "@starter/ui/components/field";
import { Input } from "@starter/ui/components/input";

import { authClient } from "@/lib/auth";

const CONFIRMATION_TEXT = "delete my account";

export function DeleteAccount() {
  const { data: session } = useQuery(authClient.session.get.queryOptions());
  const queryClient = useQueryClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const deleteUser = useMutation(
    authClient.account.deleteUser.mutationOptions({
      onSuccess: () => {
        queryClient.clear();
        router.navigate({ to: "/auth/sign-in" });
        toast.success("Account deleted", {
          description: "Your account has been permanently deleted.",
        });
      },
      onError: (error) => {
        toast.error("Failed to delete account", { description: error.message });
      },
    }),
  );

  const isConfirmed = confirmText === CONFIRMATION_TEXT && password.length > 0;

  const resetState = () => {
    setPassword("");
    setConfirmText("");
  };

  return (
    <Card className="border-destructive/30 ring-destructive/20">
      <CardHeader>
        <CardTitle className="text-destructive">Delete Account</CardTitle>
        <CardDescription>
          Permanently remove your account and all of its contents. This action is not reversible, so
          please continue with caution.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-end border-destructive/30 bg-destructive/5">
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
              <AlertDialogCancel onClick={resetState}>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                disabled={!isConfirmed || deleteUser.isPending}
                onClick={() => {
                  deleteUser.mutate({
                    password,
                    callbackURL: "/auth/sign-in",
                  });
                }}
              >
                {deleteUser.isPending && <LoaderIcon className="mr-2 size-4 animate-spin" />}
                Permanently Delete Account
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
