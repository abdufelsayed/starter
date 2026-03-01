import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { LoaderIcon } from "lucide-react";
import { toast } from "sonner";

import { forgotPasswordSchema } from "@starter/schemas/auth";
import { Button } from "@starter/ui/components/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@starter/ui/components/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@starter/ui/components/field";
import { Input } from "@starter/ui/components/input";

import { authClient } from "@/lib/auth";
import { Shell } from "./shell";
import { SupportLinks } from "./support-links";

export function ForgotPasswordForm({ className }: { className?: string }) {
  const navigate = useNavigate();
  const requestPasswordReset = useMutation(
    authClient.account.requestPasswordReset.mutationOptions({
      onError: (error) => {
        toast.error("Failed to send reset link", { description: error.message });
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onChange: forgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      await requestPasswordReset.mutateAsync(
        {
          email: value.email,
          redirectTo: "/auth/reset-password",
        },
        {
          onSuccess: () => {
            toast.success("Reset link sent successfully");
            navigate({ to: "/auth/forget-password/confirm" });
          },
        },
      );
    },
  });

  return (
    <Shell className={className}>
      <CardHeader className="flex flex-col items-start justify-start">
        <CardTitle className="flex flex-col gap-4">
          <img src="/logo192.png" className="size-10" />
          <span className="text-xl">Reset your password</span>
        </CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <fieldset disabled={form.state.isSubmitting} className="space-y-4">
            <FieldGroup>
              <form.Field name="email">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        placeholder="Enter your email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>
            </FieldGroup>
            <Button className="w-full" type="submit">
              {form.state.isSubmitting && <LoaderIcon className="mr-1 size-3 animate-spin" />}
              Send reset link
            </Button>
          </fieldset>
        </form>
        <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground md:flex-row md:gap-0">
          <div>
            Remember your password?{" "}
            <Link to="/auth/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
          <SupportLinks />
        </div>
      </CardContent>
    </Shell>
  );
}
