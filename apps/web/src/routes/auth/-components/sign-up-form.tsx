import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { AtSignIcon, EyeIcon, EyeOffIcon, LoaderIcon, MailIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { magicLinkSchema, signUpSchema } from "@starter/schemas/auth";
import { Button } from "@starter/ui/components/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@starter/ui/components/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@starter/ui/components/field";
import { Input } from "@starter/ui/components/input";

import { authClient } from "@/lib/auth";
import { Separator } from "./separator";
import { Shell } from "./shell";
import { Socials } from "./socials";
import { SupportLinks } from "./support-links";

export function SignUpForm({ className }: { className?: string }) {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const [showPasswordMethod, setShowPasswordMethod] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const signUp = useMutation(
    authClient.session.signUpEmail.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: authClient.session.key() });
      },
      onError: (error) => {
        toast.error("Failed to sign up", { description: error.message });
      },
    }),
  );

  const signInMagicLink = useMutation(
    authClient.session.signInMagicLink.mutationOptions({
      onSuccess: () => {
        toast.success("Magic link sent", {
          description: "Check your email for the sign-in link.",
        });
      },
      onError: (error) => {
        toast.error("Failed to send magic link", { description: error.message });
      },
    }),
  );

  const magicLinkForm = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onChange: magicLinkSchema,
    },
    onSubmit: async ({ value }) => {
      await signInMagicLink.mutateAsync(
        {
          email: value.email,
          callbackURL: search.redirect ?? "/",
        },
        {
          onSuccess: () => {
            setMagicLinkSent(true);
          },
        },
      );
    },
  });

  const passwordForm = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      await signUp.mutateAsync(
        {
          name: `${value.firstName} ${value.lastName}`,
          email: value.email,
          password: value.password,
          callbackURL: search.redirect ?? "/",
        },
        {
          onSuccess: () => {
            navigate({ to: "/" });
          },
        },
      );
    },
  });

  if (magicLinkSent) {
    return (
      <Shell className={className}>
        <CardHeader className="flex flex-col items-start justify-start">
          <CardTitle className="flex flex-col gap-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <MailIcon className="size-5 text-primary" />
            </div>
            <span className="text-xl">Check your email</span>
          </CardTitle>
          <CardDescription>
            We sent a sign-in link to your email. Click the link in the email to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button variant="outline" className="w-full" onClick={() => setMagicLinkSent(false)}>
            Back to sign up
          </Button>
          <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground md:flex-row md:gap-0">
            <div className="flex items-center gap-1">
              Have an account?{" "}
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

  return (
    <Shell className={className}>
      <CardHeader className="flex flex-col items-start justify-start">
        <CardTitle className="flex flex-col gap-4">
          <img src="/logo192.png" className="size-10" />
          <span className="text-xl">Sign up to Starter</span>
        </CardTitle>
        <CardDescription>Welcome! Please fill in the details to get started.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Socials disabled={magicLinkForm.state.isSubmitting || passwordForm.state.isSubmitting} />
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
          </Button>
        )}
        <Separator />
        {showPasswordMethod ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              passwordForm.handleSubmit();
            }}
            className="space-y-4"
          >
            <fieldset disabled={passwordForm.state.isSubmitting} className="space-y-4">
              <FieldGroup>
                <div className="flex flex-col gap-4 md:flex-row md:gap-2">
                  <passwordForm.Field name="firstName">
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid} className="size-full">
                          <FieldLabel htmlFor={field.name}>First name</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            placeholder="Your first name"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                          />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </passwordForm.Field>
                  <passwordForm.Field name="lastName">
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid} className="size-full">
                          <FieldLabel htmlFor={field.name}>Last name</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            placeholder="Your last name"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                          />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </passwordForm.Field>
                </div>
                <passwordForm.Field name="email">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Email address</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="email"
                          placeholder="Your email address"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
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
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                        <div className="relative">
                          <Input
                            id={field.name}
                            name={field.name}
                            type={showPassword ? "text" : "password"}
                            placeholder="Your password"
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
                <passwordForm.Field name="confirmPassword">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
                        <div className="relative">
                          <Input
                            id={field.name}
                            name={field.name}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
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
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
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
              </FieldGroup>
              <Button variant="outline" className="w-full" type="submit">
                {passwordForm.state.isSubmitting && (
                  <LoaderIcon className="mr-1 size-3 animate-spin" />
                )}
                Sign up
              </Button>
            </fieldset>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              magicLinkForm.handleSubmit();
            }}
            className="space-y-4"
          >
            <fieldset disabled={magicLinkForm.state.isSubmitting} className="space-y-4">
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
              </FieldGroup>
              <Button className="w-full" type="submit">
                {magicLinkForm.state.isSubmitting && (
                  <LoaderIcon className="mr-1 size-3 animate-spin" />
                )}
                Continue
              </Button>
            </fieldset>
          </form>
        )}
        <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground md:flex-row md:gap-0">
          <div className="flex items-center gap-1">
            Have an account?{" "}
            <Link to="/auth/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
          {!showPasswordMethod && (
            <button
              type="button"
              onClick={() => setShowPasswordMethod(true)}
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              Use password instead
            </button>
          )}
        </div>
        <SupportLinks />
      </CardContent>
    </Shell>
  );
}
