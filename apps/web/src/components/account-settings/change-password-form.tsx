import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRightIcon, LoaderIcon } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@starter/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@starter/ui/components/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@starter/ui/components/field";
import { Input } from "@starter/ui/components/input";

import { authClient } from "@/lib/auth";

const changePasswordSchema = z
  .object({
    confirmPassword: z.string(),
    currentPassword: z.string().min(1, {
      message: "Current password is required.",
    }),
    newPassword: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters.",
      })
      .max(100, {
        message: "Password cannot be longer than 100 characters.",
      })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export function ChangePasswordForm({ onBack }: { onBack?: () => void }) {
  const queryClient = useQueryClient();
  const changePassword = useMutation(
    authClient.changePassword.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: async () => {
        toast.success("Password updated", {
          description: "Your password has been updated successfully.",
        });
        await queryClient.invalidateQueries({ queryKey: authClient.getSession.key() });
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      await changePassword.mutateAsync(
        {
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
        },
        {
          onSuccess: () => {
            form.reset();
          },
        },
      );
    },
    validators: {
      onChange: changePasswordSchema,
    },
  });

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await form.handleSubmit();
      }}
    >
      <fieldset disabled={changePassword.isPending}>
        <Card className="rounded-xl shadow-none ring-0">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Enter your current password and a new password.</CardDescription>
            {onBack ? (
              <CardAction>
                <Button type="button" variant="ghost" size="icon" onClick={onBack}>
                  <ArrowRightIcon className="size-3.5" />
                </Button>
              </CardAction>
            ) : null}
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <form.Field name="currentPassword">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Current Password</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        placeholder="Current Password"
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
              <form.Field name="newPassword">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        placeholder="New Password"
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
              <form.Field name="confirmPassword">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        placeholder="Confirm Password"
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
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">Please use 8 characters at minimum.</p>
            <form.Subscribe selector={(state) => [state.isFormValid, state.isDirty] as const}>
              {([isFormValid, isDirty]) => (
                <Button
                  type="submit"
                  size="sm"
                  className="ml-auto"
                  disabled={changePassword.isPending || !isFormValid || !isDirty}
                >
                  {changePassword.isPending && <LoaderIcon className="mr-2 size-4 animate-spin" />}
                  Save
                </Button>
              )}
            </form.Subscribe>
          </CardFooter>
        </Card>
      </fieldset>
    </form>
  );
}
