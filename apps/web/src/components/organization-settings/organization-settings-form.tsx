import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRightIcon, Building2Icon, LoaderIcon } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

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
import {
  formatOrganizationDate,
  getRoleLabel,
  getRoleVariant,
  invalidateOrganizationQueries,
} from "./utils";

const organizationSettingsSchema = z.object({
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
});

export function OrganizationSettingsForm({ onBack }: { onBack?: () => void }) {
  const queryClient = useQueryClient();
  const { data: session } = useSuspenseQuery(authClient.getSession.queryOptions());
  const { data: organization } = useSuspenseQuery(
    authClient.organization.getFullOrganization.queryOptions(),
  );
  const { data: activeRole } = useSuspenseQuery(
    authClient.organization.getActiveMemberRole.queryOptions(),
  );

  const updateOrganization = useMutation(
    authClient.organization.update.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const leaveOrganization = useMutation(
    authClient.organization.leave.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const deleteOrganization = useMutation(
    authClient.organization.delete.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      logo: organization?.logo ?? "",
      name: organization?.name ?? "",
      slug: organization?.slug ?? "",
    },
    onSubmit: async ({ value }) => {
      if (!organization) {
        return;
      }

      await updateOrganization.mutateAsync({
        data: {
          logo: value.logo || undefined,
          name: value.name,
          slug: value.slug,
        },
        organizationId: organization.id,
      });

      await invalidateOrganizationQueries(queryClient);
      toast.success("Organization updated");
    },
    validators: {
      onChange: organizationSettingsSchema,
    },
  });

  if (!organization || !activeRole) {
    return null;
  }

  const isOwner = activeRole.role === "owner";
  const isPending =
    updateOrganization.isPending || leaveOrganization.isPending || deleteOrganization.isPending;

  const handleOrganizationExit = async () => {
    await invalidateOrganizationQueries(queryClient);
    onBack?.();
  };

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
            <CardTitle>Organization Settings</CardTitle>
            <CardDescription>Update the active organization's profile and URL.</CardDescription>
            {onBack ? (
              <CardAction>
                <Button type="button" variant="ghost" size="icon" onClick={onBack}>
                  <ArrowRightIcon className="size-3.5" />
                </Button>
              </CardAction>
            ) : null}
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <Building2Icon className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-medium">{organization.name}</span>
                  <Badge variant={getRoleVariant(activeRole.role)}>
                    {getRoleLabel(activeRole.role)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Created {formatOrganizationDate(organization.createdAt)}
                </p>
              </div>
            </div>

            <FieldGroup>
              <form.Field name="name">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                      <Input
                        id={field.name}
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

            <div className="flex flex-col gap-3 border-t pt-4">
              <div>
                <h3 className="text-sm font-medium">Danger Zone</h3>
                <p className="text-xs text-muted-foreground">
                  Leaving removes your access. Owners can delete the organization.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <AlertDialog>
                  <AlertDialogTrigger render={<Button type="button" variant="outline" size="sm" />}>
                    Leave Organization
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Leave this organization?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will lose access to this organization unless another member invites you
                        again.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel size="sm">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        size="sm"
                        onClick={async () => {
                          await leaveOrganization.mutateAsync({
                            organizationId: organization.id,
                          });
                          await handleOrganizationExit();
                          toast.success("You left the organization");
                        }}
                      >
                        {leaveOrganization.isPending && (
                          <LoaderIcon className="mr-2 size-4 animate-spin" />
                        )}
                        Leave Organization
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {isOwner ? (
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={<Button type="button" variant="destructive" size="sm" />}
                    >
                      Delete Organization
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this organization?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This permanently removes the organization, its members, and invitations.
                          Billing data is managed separately.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel size="sm">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            await deleteOrganization.mutateAsync({
                              organizationId: organization.id,
                            });
                            await handleOrganizationExit();
                            toast.success("Organization deleted");
                          }}
                        >
                          {deleteOrganization.isPending && (
                            <LoaderIcon className="mr-2 size-4 animate-spin" />
                          )}
                          Delete Organization
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : null}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Active org: {session?.session.activeOrganizationId === organization.id ? "Yes" : "No"}
            </p>
            <form.Subscribe selector={(state) => [state.isFormValid, state.isDirty] as const}>
              {([isFormValid, isDirty]) => (
                <Button
                  type="submit"
                  size="sm"
                  className="ml-auto"
                  disabled={!isFormValid || !isDirty || isPending}
                >
                  {updateOrganization.isPending && (
                    <LoaderIcon className="mr-2 size-4 animate-spin" />
                  )}
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
