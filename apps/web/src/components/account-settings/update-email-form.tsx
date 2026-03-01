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

const updateEmailSchema = z.object({
  email: z.email({
    message: "Please enter a valid email address.",
  }),
});

export function UpdateEmailForm() {
  const { data: session } = useQuery(authClient.session.get.queryOptions());
  const queryClient = useQueryClient();
  const changeEmail = useMutation(
    authClient.account.changeEmail.mutationOptions({
      onSuccess: () => {
        toast.success("Email update initiated", {
          description: "Please check your new email for verification.",
        });
        queryClient.invalidateQueries({ queryKey: authClient.session.key() });
      },
      onError: (error) => {
        toast.error("Failed to update email", { description: error.message });
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      email: session?.user.email ?? "",
    },
    validators: {
      onChange: updateEmailSchema,
    },
    onSubmit: async ({ value }) => {
      await changeEmail.mutateAsync({ newEmail: value.email });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <fieldset disabled={changeEmail.isPending}>
        <Card>
          <CardHeader>
            <CardTitle>Email</CardTitle>
            <CardDescription>Enter the email address you want to use to log in.</CardDescription>
          </CardHeader>
          <CardContent>
            <form.Field name="email">
              {(field) => (
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="your@email.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </form.Field>
          </CardContent>
          <CardFooter className="justify-between">
            <p className="text-xs text-muted-foreground">Please use a valid email address.</p>
            <Button
              type="submit"
              size="sm"
              disabled={!form.state.isFormValid || !form.state.isDirty}
            >
              {changeEmail.isPending && <LoaderIcon className="mr-2 size-4 animate-spin" />}
              Save
            </Button>
          </CardFooter>
        </Card>
      </fieldset>
    </form>
  );
}
