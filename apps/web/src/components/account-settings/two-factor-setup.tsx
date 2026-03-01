import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@starter/ui/components/card";
import { Field, FieldLabel } from "@starter/ui/components/field";
import { Input } from "@starter/ui/components/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@starter/ui/components/input-otp";

import { authClient } from "@/lib/auth";

type SetupStep = "idle" | "password" | "qr" | "backup-codes";

export function TwoFactorSetup() {
  const { data: session } = useQuery(authClient.session.get.queryOptions());
  const queryClient = useQueryClient();
  const twoFactorEnabled = session?.user?.twoFactorEnabled ?? false;

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
        toast.error("Failed to enable 2FA", { description: error.message });
      },
    }),
  );

  const disableTwoFactor = useMutation(
    authClient.twoFactor.disable.mutationOptions({
      onSuccess: () => {
        toast.success("Two-factor authentication disabled");
        queryClient.invalidateQueries({ queryKey: authClient.session.key() });
      },
      onError: (error) => {
        toast.error("Failed to disable 2FA", { description: error.message });
      },
    }),
  );

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

  const generateBackupCodes = useMutation(
    authClient.twoFactor.generateBackupCodes.mutationOptions({
      onError: (error) => {
        toast.error("Failed to generate backup codes", { description: error.message });
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

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
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

  if (twoFactorEnabled && step === "idle") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Two-Factor Authentication
            <Badge variant="default" className="bg-green-600 hover:bg-green-600">
              Enabled
            </Badge>
          </CardTitle>
          <CardDescription>
            Your account is protected with two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  <AlertDialogCancel onClick={() => setDisablePassword("")}>
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
                  <AlertDialogCancel onClick={() => setRegenPassword("")}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={!regenPassword || generateBackupCodes.isPending}
                    onClick={(e) => {
                      e.preventDefault();
                      generateBackupCodes.mutate(
                        { password: regenPassword },
                        {
                          onSuccess: (data) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          {step === "idle" &&
            "Add an extra layer of security to your account by enabling two-factor authentication."}
          {step === "password" && "Enter your password to enable two-factor authentication."}
          {step === "qr" &&
            "Scan the QR code with your authenticator app, then enter the code to verify."}
          {step === "backup-codes" &&
            "Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator."}
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                  if (e.key === "Enter" && password)
                    enableTwoFactor.mutate(
                      { password },
                      {
                        onSuccess: (data) => {
                          setTotpURI(data.totpURI);
                          setBackupCodes(data.backupCodes);
                          setStep("qr");
                          setPassword("");
                        },
                      },
                    );
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
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-lg bg-white p-4">
                <QRCode value={totpURI} size={180} />
              </div>
              <div className="w-full space-y-1">
                <p className="text-xs text-muted-foreground">
                  Can't scan? Enter this key manually:
                </p>
                <code className="block rounded bg-muted px-3 py-2 text-xs break-all">
                  {manualKey}
                </code>
              </div>
            </div>
            <div className="space-y-2">
              <FieldLabel>Enter the 6-digit code from your authenticator app</FieldLabel>
              <div className="flex items-center gap-3">
                <InputOTP
                  maxLength={6}
                  value={verifyCode}
                  onChange={(value) => setVerifyCode(value)}
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
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={verifyCode.length !== 6 || verifyTOTP.isPending}
                onClick={() =>
                  verifyTOTP.mutate(
                    { code: verifyCode },
                    {
                      onSuccess: () => {
                        setStep("backup-codes");
                        setVerifyCode("");
                        queryClient.invalidateQueries({ queryKey: authClient.session.key() });
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
            <div className="grid grid-cols-2 gap-2 rounded-lg border p-4">
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
