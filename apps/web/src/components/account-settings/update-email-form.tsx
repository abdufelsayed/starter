import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
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

const updateEmailSchema = z.object({
  email: z.email({
    message: "Please enter a valid email address.",
  }),
});

export function UpdateEmailForm({ onBack }: { onBack?: () => void }) {
  const { data: session } = useSuspenseQuery(authClient.getSession.queryOptions());
  const queryClient = useQueryClient();
  const changeEmail = useMutation(
    authClient.changeEmail.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: async () => {
        toast.success("Email update initiated", {
          description: "Please check your new email for verification.",
        });
        await queryClient.invalidateQueries({ queryKey: authClient.getSession.key() });
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      email: session!.user.email,
    },
    onSubmit: async ({ value }) => {
      await changeEmail.mutateAsync({ newEmail: value.email });
    },
    validators: {
      onChange: updateEmailSchema,
    },
  });

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await form.handleSubmit();
      }}
    >
      <fieldset disabled={changeEmail.isPending}>
        <Card className="rounded-xl shadow-none ring-0">
          <CardHeader>
            <CardTitle>Email</CardTitle>
            <CardDescription>Enter the email address you want to use to log in.</CardDescription>
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
                        placeholder="your@email.com"
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
            <p className="text-xs text-muted-foreground">Please use a valid email address.</p>
            <form.Subscribe selector={(state) => [state.isFormValid, state.isDirty] as const}>
              {([isFormValid, isDirty]) => (
                <Button
                  type="submit"
                  size="sm"
                  className="ml-auto"
                  disabled={!isFormValid || !isDirty}
                >
                  {changeEmail.isPending && <LoaderIcon className="mr-2 size-4 animate-spin" />}
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
