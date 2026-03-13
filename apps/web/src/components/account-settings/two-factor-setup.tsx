import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowRightIcon,
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  LoaderIcon,
  ShieldCheckIcon,
  ShieldOffIcon,
} from "lucide-react";
import { useState } from "react";
import QRCode from "react-qr-code";
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
import { Badge } from "@starter/ui/components/badge";
import { Button } from "@starter/ui/components/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@starter/ui/components/card";
import { Field, FieldDescription, FieldLabel, FieldTitle } from "@starter/ui/components/field";
import { Input } from "@starter/ui/components/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@starter/ui/components/input-otp";

import { authClient } from "@/lib/auth";

type SetupStep = "idle" | "password" | "qr" | "backup-codes";

export function TwoFactorSetup({ onBack }: { onBack?: () => void }) {
  const { data: session } = useSuspenseQuery(authClient.getSession.queryOptions());
  const queryClient = useQueryClient();
  const twoFactorEnabled = session?.user.twoFactorEnabled;

  const [step, setStep] = useState<SetupStep>("idle");
  const [password, setPassword] = useState("");
  const [totpURI, setTotpURI] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyCode, setVerifyCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [regenPassword, setRegenPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const enableTwoFactor = useMutation(
    authClient.twoFactor.enable.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const disableTwoFactor = useMutation(
    authClient.twoFactor.disable.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: async () => {
        toast.success("Two-factor authentication disabled");
        await queryClient.invalidateQueries({ queryKey: authClient.getSession.key() });
      },
    }),
  );

  const verifyTOTP = useMutation(
    authClient.twoFactor.verifyTotp.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: authClient.getSession.key() });
      },
    }),
  );

  const generateBackupCodes = useMutation(
    authClient.twoFactor.generateBackupCodes.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const resetState = () => {
    setStep("idle");
    setPassword("");
    setTotpURI("");
    setBackupCodes([]);
    setVerifyCode("");
    setCopied(false);
  };

  const copyBackupCodes = async () => {
    await navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "starter-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const manualKey = totpURI ? (new URL(totpURI).searchParams.get("secret") ?? "") : "";

  // 2FA is enabled — show status + disable/regenerate actions
  if (twoFactorEnabled && step === "idle") {
    return (
      <Card className="rounded-xl shadow-none ring-0">
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          {onBack ? (
            <CardAction>
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowRightIcon className="size-3.5" />
              </Button>
            </CardAction>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <FieldDescription>
              Your account is protected with two-factor authentication.
            </FieldDescription>
            <Badge variant="default" className="bg-green-600 hover:bg-green-600">
              Enabled
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
                <ShieldOffIcon className="mr-2 size-4" />
                Disable 2FA
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disable Two-Factor Authentication</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the extra security layer from your account. Enter your password
                    to confirm.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Field>
                  <FieldLabel htmlFor="disable-password">Password</FieldLabel>
                  <Input
                    id="disable-password"
                    type="password"
                    placeholder="Enter your password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                  />
                </Field>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    size="sm"
                    variant="outline"
                    onClick={() => setDisablePassword("")}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={!disablePassword || disableTwoFactor.isPending}
                    onClick={(e) => {
                      e.preventDefault();
                      disableTwoFactor.mutate(
                        { password: disablePassword },
                        {
                          onSuccess: () => {
                            resetState();
                            setDisablePassword("");
                          },
                        },
                      );
                    }}
                  >
                    {disableTwoFactor.isPending && (
                      <LoaderIcon className="mr-2 size-4 animate-spin" />
                    )}
                    Disable 2FA
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
                Regenerate Backup Codes
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Regenerate Backup Codes</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will invalidate your existing backup codes and generate new ones. Enter
                    your password to confirm.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Field>
                  <FieldLabel htmlFor="regen-password">Password</FieldLabel>
                  <Input
                    id="regen-password"
                    type="password"
                    placeholder="Enter your password"
                    value={regenPassword}
                    onChange={(e) => setRegenPassword(e.target.value)}
                  />
                </Field>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    size="sm"
                    variant="outline"
                    onClick={() => setRegenPassword("")}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={!regenPassword || generateBackupCodes.isPending}
                    onClick={(e) => {
                      e.preventDefault();
                      generateBackupCodes.mutate(
                        { password: regenPassword },
                        {
                          onSuccess: (data) => {
                            if (!data) {
                              return;
                            }
                            setBackupCodes(data.backupCodes);
                            setStep("backup-codes");
                            setRegenPassword("");
                          },
                        },
                      );
                    }}
                  >
                    {generateBackupCodes.isPending && (
                      <LoaderIcon className="mr-2 size-4 animate-spin" />
                    )}
                    Regenerate
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 2FA setup flow
  return (
    <Card className="rounded-xl shadow-none ring-0">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        {onBack ? (
          <CardAction>
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowRightIcon className="size-3.5" />
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <FieldDescription>
          {step === "idle" &&
            "Add an extra layer of security to your account by enabling two-factor authentication."}
          {step === "password" && "Enter your password to enable two-factor authentication."}
          {step === "qr" &&
            "Scan the QR code with your authenticator app, then enter the code to verify."}
          {step === "backup-codes" &&
            "Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator."}
        </FieldDescription>

        {step === "idle" && (
          <Button size="sm" onClick={() => setStep("password")}>
            <ShieldCheckIcon className="mr-2 size-4" />
            Enable 2FA
          </Button>
        )}

        {step === "password" && (
          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor="enable-password">Password</FieldLabel>
              <Input
                id="enable-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && password) {
                    enableTwoFactor.mutate(
                      { password },
                      {
                        onSuccess: (data) => {
                          if (!data) return;
                          setTotpURI(data.totpURI);
                          setBackupCodes(data.backupCodes);
                          setStep("qr");
                          setPassword("");
                        },
                      },
                    );
                  }
                }}
              />
            </Field>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={!password || enableTwoFactor.isPending}
                onClick={() =>
                  enableTwoFactor.mutate(
                    { password },
                    {
                      onSuccess: (data) => {
                        if (!data) {
                          return;
                        }
                        setTotpURI(data.totpURI);
                        setBackupCodes(data.backupCodes);
                        setStep("qr");
                        setPassword("");
                      },
                    },
                  )
                }
              >
                {enableTwoFactor.isPending && <LoaderIcon className="mr-2 size-4 animate-spin" />}
                Continue
              </Button>
              <Button size="sm" variant="ghost" onClick={resetState}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {step === "qr" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-lg bg-white p-3">
                <QRCode value={totpURI} size={160} />
              </div>
              <div className="w-full space-y-1">
                <FieldDescription>Can't scan? Enter this key manually:</FieldDescription>
                <code className="block rounded bg-muted px-3 py-2 text-xs break-all">
                  {manualKey}
                </code>
              </div>
            </div>
            <div className="space-y-2">
              <FieldTitle>Enter the 6-digit code from your authenticator app</FieldTitle>
              <InputOTP maxLength={6} value={verifyCode} onChange={(value) => setVerifyCode(value)}>
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
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={verifyCode.length !== 6 || verifyTOTP.isPending}
                onClick={() =>
                  verifyTOTP.mutate(
                    { code: verifyCode },
                    {
                      onSuccess: async () => {
                        setStep("backup-codes");
                        setVerifyCode("");
                        await queryClient.invalidateQueries({
                          queryKey: authClient.getSession.key(),
                        });
                      },
                    },
                  )
                }
              >
                {verifyTOTP.isPending && <LoaderIcon className="mr-2 size-4 animate-spin" />}
                Verify
              </Button>
              <Button size="sm" variant="ghost" onClick={resetState}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {step === "backup-codes" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
              {backupCodes.map((code) => (
                <code key={code} className="font-mono text-sm">
                  {code}
                </code>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyBackupCodes}>
                {copied ? (
                  <CheckIcon className="mr-2 size-4" />
                ) : (
                  <CopyIcon className="mr-2 size-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button size="sm" variant="outline" onClick={downloadBackupCodes}>
                <DownloadIcon className="mr-2 size-4" />
                Download
              </Button>
            </div>
            <Button size="sm" onClick={resetState}>
              Done
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
