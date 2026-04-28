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
import { Checkbox } from "@starter/ui/components/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@starter/ui/components/field";
import { Input } from "@starter/ui/components/input";

import { authClient } from "@/lib/auth";
import { invalidateOrganizationQueries } from "./utils";

const createOrganizationSchema = z.object({
  logo: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || z.url().safeParse(value).success, {
      message: "Logo must be a valid URL.",
    }),
  name: z.string().min(2, "Name must be at least 2 characters."),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters.")
    .max(48, "Slug must be 48 characters or fewer.")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens."),
  switchToOrganization: z.boolean(),
});

export function CreateOrganizationForm({ onBack }: { onBack?: () => void }) {
  const queryClient = useQueryClient();

  const createOrganization = useMutation(
    authClient.organization.create.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const setActive = useMutation(
    authClient.organization.setActive.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      logo: "",
      name: "",
      slug: "",
      switchToOrganization: true,
    },
    onSubmit: async ({ value }) => {
      const parsed = createOrganizationSchema.safeParse(value);
      if (!parsed.success) {
        return;
      }

      const slugStatus = await queryClient.fetchQuery(
        authClient.organization.checkSlug.queryOptions({
          input: {
            slug: parsed.data.slug,
          },
        }),
      );

      if (!slugStatus?.status) {
        toast.error("That organization URL is already taken.");
        return;
      }

      const organization = await createOrganization.mutateAsync({
        keepCurrentActiveOrganization: !parsed.data.switchToOrganization,
        logo: parsed.data.logo || undefined,
        name: parsed.data.name,
        slug: parsed.data.slug,
      });

      if (organization && parsed.data.switchToOrganization) {
        await setActive.mutateAsync({ organizationId: organization.id });
      }

      await invalidateOrganizationQueries(queryClient);
      form.reset();
      toast.success("Organization created");
      onBack?.();
    },
    validators: {
      onChange: createOrganizationSchema,
    },
  });

  const isPending = createOrganization.isPending || setActive.isPending;

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await form.handleSubmit();
      }}
    >
      <fieldset disabled={isPending}>
        <Card className="rounded-xl shadow-none ring-0">
          <CardHeader>
            <CardTitle>Create Organization</CardTitle>
            <CardDescription>
              Create an organization for a customer, team, or tenant.
            </CardDescription>
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
                        placeholder="Acme Inc"
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

              <form.Field name="slug">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Slug</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="acme-inc"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value.trim())}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="logo">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Logo URL</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="https://example.com/logo.png"
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

              <form.Field name="switchToOrganization">
                {(field) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      checked={field.state.value}
                      onCheckedChange={(checked) => field.handleChange(checked)}
                    />
                    <FieldLabel>Switch to the new organization</FieldLabel>
                  </Field>
                )}
              </form.Field>
            </FieldGroup>
          </CardContent>
          <CardFooter>
            <form.Subscribe selector={(state) => [state.isFormValid, state.isDirty] as const}>
              {([isFormValid, isDirty]) => (
                <Button
                  type="submit"
                  size="sm"
                  className="ml-auto"
                  disabled={!isFormValid || !isDirty || isPending}
                >
                  {isPending && <LoaderIcon className="mr-2 size-4 animate-spin" />}
                  Create Organization
                </Button>
              )}
            </form.Subscribe>
          </CardFooter>
        </Card>
      </fieldset>
    </form>
  );
}
