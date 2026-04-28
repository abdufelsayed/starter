import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient, useSuspenseQueries } from "@tanstack/react-query";
import { ArrowRightIcon, LoaderIcon, Trash2Icon } from "lucide-react";
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
import { NativeSelect, NativeSelectOption } from "@starter/ui/components/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@starter/ui/components/table";

import { authClient } from "@/lib/auth";
import {
  getAssignableRoles,
  getRoleLabel,
  getRoleVariant,
  invalidateOrganizationQueries,
  isOrganizationRole,
  type OrganizationRole,
} from "./utils";

const rolePresets = ["member", "admin", "owner"] as const satisfies readonly OrganizationRole[];

const inviteMemberSchema = z.object({
  email: z.email("Enter a valid email address."),
  role: z.enum(rolePresets),
});

export function OrganizationMembersForm({ onBack }: { onBack?: () => void }) {
  const queryClient = useQueryClient();
  const [{ data: session }, { data: membersData }, { data: activeRoleData }] = useSuspenseQueries({
    queries: [
      authClient.getSession.queryOptions(),
      authClient.organization.listMembers.queryOptions(),
      authClient.organization.getActiveMemberRole.queryOptions(),
    ],
  });

  const inviteMember = useMutation(
    authClient.organization.inviteMember.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const updateMemberRole = useMutation(
    authClient.organization.updateMemberRole.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const removeMember = useMutation(
    authClient.organization.removeMember.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      email: "",
      role: "member" as OrganizationRole,
    },
    onSubmit: async ({ value }) => {
      const parsed = inviteMemberSchema.safeParse(value);
      if (!parsed.success) {
        return;
      }

      await inviteMember.mutateAsync({
        email: parsed.data.email,
        role: parsed.data.role,
      });

      await invalidateOrganizationQueries(queryClient);
      form.reset();
      toast.success("Invitation sent");
    },
    validators: {
      onChange: inviteMemberSchema,
    },
  });

  if (!activeRoleData || !membersData) {
    return null;
  }

  const currentRole = activeRoleData.role;
  const assignableRoles = getAssignableRoles(currentRole);
  const isPending = inviteMember.isPending || updateMemberRole.isPending || removeMember.isPending;

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
            <CardTitle>Members</CardTitle>
            <CardDescription>Invite teammates and manage organization access.</CardDescription>
            {onBack ? (
              <CardAction>
                <Button type="button" variant="ghost" size="icon" onClick={onBack}>
                  <ArrowRightIcon className="size-3.5" />
                </Button>
              </CardAction>
            ) : null}
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {assignableRoles.length > 0 ? (
              <FieldGroup>
                <form.Field name="email">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Invite by email</FieldLabel>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="teammate@example.com"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="role">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                      <NativeSelect
                        id={field.name}
                        value={field.state.value}
                        onChange={(e) => {
                          if (isOrganizationRole(e.target.value)) {
                            field.handleChange(e.target.value);
                          }
                        }}
                      >
                        {assignableRoles.map((role) => (
                          <NativeSelectOption key={role} value={role}>
                            {getRoleLabel(role)}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </Field>
                  )}
                </form.Field>

                <div className="flex justify-end">
                  <form.Subscribe selector={(state) => [state.isFormValid, state.isDirty] as const}>
                    {([isFormValid, isDirty]) => (
                      <Button type="submit" size="sm" disabled={!isFormValid || !isDirty}>
                        {inviteMember.isPending && (
                          <LoaderIcon className="mr-2 size-4 animate-spin" />
                        )}
                        Send Invite
                      </Button>
                    )}
                  </form.Subscribe>
                </div>
              </FieldGroup>
            ) : null}

            <div className="flex flex-col gap-3">
              <div className="text-sm font-medium">Current members</div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {membersData.members.map((member) => {
                    const memberRole = member.role;
                    const canEditRole =
                      currentRole === "owner"
                        ? member.userId !== session?.user.id && isOrganizationRole(memberRole)
                        : currentRole === "admin"
                          ? member.userId !== session?.user.id &&
                            memberRole !== "owner" &&
                            isOrganizationRole(memberRole)
                          : false;
                    const canRemove =
                      currentRole === "owner"
                        ? member.userId !== session?.user.id
                        : currentRole === "admin"
                          ? member.userId !== session?.user.id && memberRole !== "owner"
                          : false;

                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{member.user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {member.user.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={getRoleVariant(memberRole)}>
                              {getRoleLabel(memberRole)}
                            </Badge>
                            {canEditRole ? (
                              <NativeSelect
                                size="sm"
                                value={memberRole}
                                onChange={async (e) => {
                                  if (!isOrganizationRole(e.target.value)) {
                                    return;
                                  }

                                  const nextRole = e.target.value;
                                  if (nextRole === memberRole) {
                                    return;
                                  }

                                  await updateMemberRole.mutateAsync({
                                    memberId: member.id,
                                    role: nextRole,
                                  });
                                  await invalidateOrganizationQueries(queryClient);
                                  toast.success("Member role updated");
                                }}
                              >
                                {assignableRoles.map((option) => (
                                  <NativeSelectOption key={option} value={option}>
                                    {getRoleLabel(option)}
                                  </NativeSelectOption>
                                ))}
                              </NativeSelect>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {canRemove ? (
                            <AlertDialog>
                              <AlertDialogTrigger render={<Button size="icon" variant="ghost" />}>
                                <Trash2Icon className="size-4" />
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove {member.user.name}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    They will lose access to this organization immediately.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel size="sm">Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    variant="destructive"
                                    size="sm"
                                    onClick={async () => {
                                      await removeMember.mutateAsync({
                                        memberIdOrEmail: member.id,
                                      });
                                      await invalidateOrganizationQueries(queryClient);
                                      toast.success("Member removed");
                                    }}
                                  >
                                    {removeMember.isPending && (
                                      <LoaderIcon className="mr-2 size-4 animate-spin" />
                                    )}
                                    Remove Member
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              {membersData.total} {membersData.total === 1 ? "member" : "members"} in this
              organization
            </p>
          </CardFooter>
        </Card>
      </fieldset>
    </form>
  );
}
