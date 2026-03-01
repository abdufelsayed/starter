import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@starter/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@starter/ui/components/card";
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

export function UpdateNameForm() {
  const { data: session } = useQuery(authClient.session.get.queryOptions());
  const queryClient = useQueryClient();
  const updateUser = useMutation(
    authClient.account.updateUser.mutationOptions({
      onSuccess: () => {
        toast.success("Profile updated", {
          description: "Your name has been updated successfully.",
        });
        queryClient.invalidateQueries({ queryKey: authClient.session.key() });
      },
      onError: (error) => {
        toast.error("Failed to update profile", { description: error.message });
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
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <fieldset disabled={updateUser.isPending}>
        <Card>
          <CardHeader>
            <CardTitle>Name</CardTitle>
            <CardDescription>Please enter your full name, or a display name.</CardDescription>
          </CardHeader>
          <CardContent>
            <form.Field name="name">
              {(field) => (
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="Your name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </form.Field>
          </CardContent>
          <CardFooter className="justify-between">
            <p className="text-xs text-muted-foreground">Please use 32 characters at maximum.</p>
            <Button
              type="submit"
              size="sm"
              disabled={!form.state.isFormValid || !form.state.isDirty}
            >
              {updateUser.isPending && <LoaderIcon className="mr-2 size-4 animate-spin" />}
              Save
            </Button>
          </CardFooter>
        </Card>
      </fieldset>
    </form>
  );
}
