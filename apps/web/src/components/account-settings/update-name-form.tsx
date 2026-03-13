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

const updateNameSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(32, {
      message: "Name cannot be longer than 32 characters.",
    })
    .regex(/^[a-zA-Z\s'-]+$/, {
      message: "Name can only contain letters, spaces, hyphens and apostrophes.",
    }),
});

export function UpdateNameForm({ onBack }: { onBack?: () => void }) {
  const { data: session } = useSuspenseQuery(authClient.getSession.queryOptions());
  const queryClient = useQueryClient();
  const updateUser = useMutation(
    authClient.updateUser.mutationOptions({
      onSuccess: async () => {
        toast.success("Profile updated", {
          description: "Your name has been updated successfully.",
        });
        await queryClient.invalidateQueries({ queryKey: authClient.getSession.key() });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      name: session?.user.name ?? "",
    },
    validators: {
      onChange: updateNameSchema,
    },
    onSubmit: async ({ value }) => {
      await updateUser.mutateAsync({ name: value.name });
    },
  });

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await form.handleSubmit();
      }}
    >
      <fieldset disabled={updateUser.isPending}>
        <Card className="rounded-xl shadow-none ring-0">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Please enter your full name, or a display name.</CardDescription>
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
              <form.Field name="name">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="Your name"
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
            <p className="text-xs text-muted-foreground">Please use 32 characters at maximum.</p>
            <form.Subscribe selector={(state) => [state.isFormValid, state.isDirty] as const}>
              {([isFormValid, isDirty]) => (
                <Button
                  type="submit"
                  size="sm"
                  className="ml-auto"
                  disabled={!isFormValid || !isDirty}
                >
                  {updateUser.isPending && <LoaderIcon className="mr-2 size-4 animate-spin" />}
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
