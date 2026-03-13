import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLoaderData, useNavigate, useSearch } from "@tanstack/react-router";
import { AtSignIcon, EyeIcon, EyeOffIcon, LoaderIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { webEnv } from "@starter/env/web";
import { magicLinkSignInSchema, signInSchema } from "@starter/schemas/auth";
import { Badge } from "@starter/ui/components/badge";
import { Button } from "@starter/ui/components/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@starter/ui/components/card";
import { Checkbox } from "@starter/ui/components/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@starter/ui/components/field";
import { Input } from "@starter/ui/components/input";

import { authClient } from "@/lib/auth";
import { Separator } from "./separator";
import { Shell } from "./shell";
import { Socials } from "./socials";
import { SupportLinks } from "./support-links";

export function SignInForm({ className }: { className?: string }) {
  const { lastUsedLoginMethod } = useLoaderData({ from: "/auth" });
  const search = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [showPasswordMethod, setShowPasswordMethod] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();

  const signIn = useMutation(
    authClient.signIn.email.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: async (data) => {
        if (!data) return;

        if (!data.redirect) {
          await queryClient.invalidateQueries({ queryKey: authClient.getSession.key() });
        }
      },
    }),
  );

  const signInMagicLink = useMutation(
    authClient.signIn.magicLink.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const magicLinkForm = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      await signInMagicLink.mutateAsync(
        {
          email: value.email,
          callbackURL: search.redirect ?? webEnv.VITE_WEB_URL,
          errorCallbackURL: `${webEnv.VITE_WEB_URL}/auth/error`,
        },
        {
          onSuccess: async () => {
            await navigate({
              to: "/auth/magic-link-sent",
              search: { email: value.email },
            });
          },
        },
      );
    },
    validators: {
      onChange: magicLinkSignInSchema,
    },
  });

  const passwordForm = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    onSubmit: async ({ value }) => {
      await signIn.mutateAsync(
        {
          email: value.email,
          password: value.password,
          rememberMe: value.rememberMe,
          callbackURL: search.redirect ?? webEnv.VITE_WEB_URL,
        },
        {
          onSuccess: async (data) => {
            if (!data) return;

            if (data.redirect) {
              await navigate({
                to: "/auth/verify-2fa",
                search: { redirect: search.redirect },
              });
            }
          },
        },
      );
    },
    validators: {
      onChange: signInSchema,
    },
  });

  return (
    <Shell className={className}>
      <CardHeader className="flex flex-col items-start justify-start">
        <CardTitle className="flex flex-col gap-4">
          <img src="/logo192.png" alt="Logo" className="size-10" />
          <span className="text-xl">Sign in to Starter</span>
        </CardTitle>
        <CardDescription>Welcome back! Please sign in to continue</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Socials disabled={signInMagicLink.isPending || signIn.isPending} />
        {showPasswordMethod && (
          <Button
            variant="default"
            className="relative grid grid-cols-12"
            onClick={() => setShowPasswordMethod(false)}
          >
            <div className="col-end-5">
              <AtSignIcon className="size-4" />
            </div>
            <span>Continue with email</span>
            {lastUsedLoginMethod === "email" && (
              <Badge
                variant="outline"
                className="absolute -top-2.5 -right-2 bg-background dark:bg-muted"
              >
                Last used
              </Badge>
            )}
          </Button>
        )}
        <Separator />
        {showPasswordMethod ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await passwordForm.handleSubmit();
            }}
          >
            <fieldset disabled={signIn.isPending}>
              <FieldGroup>
                <passwordForm.Field name="email">
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
                          onChange={(e) => {
                            field.handleChange(e.target.value);
                          }}
                          aria-invalid={isInvalid}
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </passwordForm.Field>
                <passwordForm.Field name="password">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <div className="flex items-center justify-between">
                          <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                          <Link
                            to="/auth/forgot-password"
                            className="text-xs text-primary hover:underline"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <div className="relative">
                          <Input
                            id={field.name}
                            name={field.name}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-1/2 right-0.5 size-7 -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOffIcon className="size-3" />
                            ) : (
                              <EyeIcon className="size-3" />
                            )}
                          </Button>
                        </div>
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </passwordForm.Field>
                <passwordForm.Field name="rememberMe">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field orientation="horizontal" data-invalid={isInvalid}>
                        <Checkbox
                          id={field.name}
                          name={field.name}
                          checked={field.state.value}
                          onCheckedChange={(checked: boolean) => {
                            field.handleChange(checked);
                          }}
                          aria-invalid={isInvalid}
                        />
                        <FieldLabel htmlFor={field.name} className="font-normal">
                          Remember me
                        </FieldLabel>
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </passwordForm.Field>
                <passwordForm.Subscribe selector={(state) => state.canSubmit}>
                  {(canSubmit) => (
                    <Button
                      variant="outline"
                      className="relative w-full"
                      type="submit"
                      disabled={!canSubmit}
                    >
                      {signIn.isPending && <LoaderIcon className="mr-1 size-3 animate-spin" />}
                      Sign in
                      {lastUsedLoginMethod === "email" && (
                        <Badge variant="outline" className="absolute right-2">
                          Last used
                        </Badge>
                      )}
                    </Button>
                  )}
                </passwordForm.Subscribe>
              </FieldGroup>
            </fieldset>
          </form>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await magicLinkForm.handleSubmit();
            }}
          >
            <fieldset disabled={signInMagicLink.isPending}>
              <FieldGroup>
                <magicLinkForm.Field name="email">
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
                          onChange={(e) => {
                            field.handleChange(e.target.value);
                          }}
                          aria-invalid={isInvalid}
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </magicLinkForm.Field>
                <magicLinkForm.Subscribe selector={(state) => state.canSubmit}>
                  {(canSubmit) => (
                    <Button className="relative w-full" type="submit" disabled={!canSubmit}>
                      {signInMagicLink.isPending && (
                        <LoaderIcon className="mr-1 size-3 animate-spin" />
                      )}
                      Continue
                      {lastUsedLoginMethod === "magic_link" && (
                        <Badge variant="outline" className="absolute right-2">
                          Last used
                        </Badge>
                      )}
                    </Button>
                  )}
                </magicLinkForm.Subscribe>
              </FieldGroup>
            </fieldset>
          </form>
        )}
        <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground md:flex-row md:gap-0">
          <div className="flex items-center gap-1">
            No account?{" "}
            <Link to="/auth/sign-up" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
          {!showPasswordMethod && (
            <Button
              variant="link"
              size="xs"
              onClick={() => setShowPasswordMethod(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              Use password instead
            </Button>
          )}
        </div>
        <SupportLinks />
      </CardContent>
    </Shell>
  );
}
