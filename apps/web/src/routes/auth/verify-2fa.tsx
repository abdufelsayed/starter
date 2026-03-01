import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { KeyRoundIcon, LoaderIcon, MailIcon, ShieldCheckIcon, SmartphoneIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@starter/ui/components/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@starter/ui/components/card";
import { Checkbox } from "@starter/ui/components/checkbox";
import { Field, FieldLabel } from "@starter/ui/components/field";
import { Input } from "@starter/ui/components/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@starter/ui/components/input-otp";

import { authClient } from "@/lib/auth";
import { Shell } from "@/routes/auth/-components/shell";

const verify2faSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth/verify-2fa")({
  validateSearch: verify2faSearchSchema,
  component: VerifyTwoFactorPage,
});

type VerifyMethod = "totp" | "email-otp" | "backup-code";

function VerifyTwoFactorPage() {
  const search = Route.useSearch();
  const redirectUrl = "redirect" in search ? search.redirect : undefined;
  const navigate = useNavigate();
  const [method, setMethod] = useState<VerifyMethod>("totp");
  const [code, setCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);

  const queryClient = useQueryClient();
  const verifyTOTP = useMutation(
    authClient.twoFactor.verifyTOTP.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: authClient.session.key() });
      },
      onError: (error) => {
        toast.error("Invalid code", { description: error.message });
      },
    }),
  );

  const sendOTP = useMutation(
    authClient.twoFactor.sendOTP.mutationOptions({
      onSuccess: () => {
        toast.success("Code sent", { description: "Check your email for the verification code." });
      },
      onError: (error) => {
        toast.error("Failed to send code", { description: error.message });
      },
    }),
  );

  const verifyOTP = useMutation(
    authClient.twoFactor.verifyOTP.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: authClient.session.key() });
      },
      onError: (error) => {
        toast.error("Invalid code", { description: error.message });
      },
    }),
  );

  const verifyBackup = useMutation(
    authClient.twoFactor.verifyBackupCode.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: authClient.session.key() });
      },
      onError: (error) => {
        toast.error("Invalid backup code", { description: error.message });
      },
    }),
  );

  const isPending = verifyTOTP.isPending || verifyOTP.isPending || verifyBackup.isPending;

  const switchMethod = (newMethod: VerifyMethod) => {
    setMethod(newMethod);
    setCode("");
    setBackupCode("");
  };

  return (
    <Shell className={undefined}>
      <CardHeader className="flex flex-col items-start justify-start">
        <CardTitle className="flex flex-col gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheckIcon className="size-5 text-primary" />
          </div>
          <span className="text-xl">Two-factor verification</span>
        </CardTitle>
        <CardDescription>
          {method === "totp" && "Enter the 6-digit code from your authenticator app."}
          {method === "email-otp" && "Enter the 6-digit code sent to your email."}
          {method === "backup-code" && "Enter one of your backup codes."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {method === "totp" && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(value) => setCode(value)}
                disabled={isPending}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Field orientation="horizontal">
              <Checkbox
                id="trust-device-totp"
                checked={trustDevice}
                onCheckedChange={(checked: boolean) => setTrustDevice(checked)}
              />
              <FieldLabel htmlFor="trust-device-totp" className="font-normal">
                Trust this device for 30 days
              </FieldLabel>
            </Field>
            <Button
              className="w-full"
              disabled={code.length !== 6 || isPending}
              onClick={() =>
                verifyTOTP.mutate(
                  { code, trustDevice },
                  { onSuccess: () => navigate({ to: redirectUrl ?? "/" }) },
                )
              }
            >
              {verifyTOTP.isPending && <LoaderIcon className="mr-2 size-4 animate-spin" />}
              Verify
            </Button>
          </div>
        )}

        {method === "email-otp" && (
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              disabled={sendOTP.isPending}
              onClick={() => sendOTP.mutate()}
            >
              {sendOTP.isPending && <LoaderIcon className="mr-2 size-4 animate-spin" />}
              <MailIcon className="mr-2 size-4" />
              Send code to email
            </Button>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(value) => setCode(value)}
                disabled={isPending}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Field orientation="horizontal">
              <Checkbox
                id="trust-device-otp"
                checked={trustDevice}
                onCheckedChange={(checked: boolean) => setTrustDevice(checked)}
              />
              <FieldLabel htmlFor="trust-device-otp" className="font-normal">
                Trust this device for 30 days
              </FieldLabel>
            </Field>
            <Button
              className="w-full"
              disabled={code.length !== 6 || isPending}
              onClick={() =>
                verifyOTP.mutate(
                  { code, trustDevice },
                  { onSuccess: () => navigate({ to: redirectUrl ?? "/" }) },
                )
              }
            >
              {verifyOTP.isPending && <LoaderIcon className="mr-2 size-4 animate-spin" />}
              Verify
            </Button>
          </div>
        )}

        {method === "backup-code" && (
          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor="backup-code">Backup code</FieldLabel>
              <Input
                id="backup-code"
                type="text"
                placeholder="Enter a backup code"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value)}
                disabled={isPending}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && backupCode)
                    verifyBackup.mutate(
                      { code: backupCode },
                      { onSuccess: () => navigate({ to: redirectUrl ?? "/" }) },
                    );
                }}
              />
            </Field>
            <Button
              className="w-full"
              disabled={!backupCode || isPending}
              onClick={() =>
                verifyBackup.mutate(
                  { code: backupCode },
                  { onSuccess: () => navigate({ to: redirectUrl ?? "/" }) },
                )
              }
            >
              {verifyBackup.isPending && <LoaderIcon className="mr-2 size-4 animate-spin" />}
              Verify
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-1 pt-2">
          {method !== "totp" && (
            <button
              type="button"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground hover:underline"
              onClick={() => switchMethod("totp")}
            >
              <SmartphoneIcon className="size-3" />
              Use authenticator app
            </button>
          )}
          {method !== "email-otp" && (
            <button
              type="button"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground hover:underline"
              onClick={() => switchMethod("email-otp")}
            >
              <MailIcon className="size-3" />
              Use email code
            </button>
          )}
          {method !== "backup-code" && (
            <button
              type="button"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground hover:underline"
              onClick={() => switchMethod("backup-code")}
            >
              <KeyRoundIcon className="size-3" />
              Use a backup code
            </button>
          )}
        </div>
      </CardContent>
    </Shell>
  );
}
