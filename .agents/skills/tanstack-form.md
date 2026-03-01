# TanStack Form — Form Creation Guide

This skill teaches how to create forms in this project using `@tanstack/react-form` with Zod validation, following the exact patterns established in the codebase.

---

## Core Principles

1. All forms use `useForm` from `@tanstack/react-form`.
2. Validation is always powered by Zod schemas from `@weldr/schemas/*`.
3. UI components come exclusively from `@weldr/ui/components/*`.
4. Error feedback uses `toast` from `sonner` for submission errors and inline `FieldError` for field-level validation.
5. Forms track loading state with both a local `isSubmitting` state and `form.state.isSubmitting`.
6. Form components live in `-components/` folders next to their route files and are named descriptively (e.g., `create-todo-form.tsx`, `edit-profile-form.tsx`).

---

## Required Imports

Every form file should import from these packages as needed:

```typescript
import { useForm } from "@tanstack/react-form";
import { LoaderIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { mySchema } from "@weldr/schemas/my-domain";
import { Button } from "@weldr/ui/components/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@weldr/ui/components/field";
import { Input } from "@weldr/ui/components/input";
```

Additional UI imports when needed:

```typescript
import { Checkbox } from "@weldr/ui/components/checkbox";
import { Textarea } from "@weldr/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@weldr/ui/components/select";
import { FieldDescription, FieldSet, FieldContent, FieldTitle } from "@weldr/ui/components/field";
```

---

## Step 1: Define a Zod Schema

Schemas live in `packages/schemas/src/`. Create or reuse a schema file for the domain.

```typescript
// packages/schemas/src/todos.ts
import { z } from "zod";

export const createTodoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  completed: z.boolean(),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  completed: z.boolean(),
});
```

---

## Step 2: Set Up the Form Hook

Use `useForm` with `defaultValues`, `validators` (always `onChange` mode), and `onSubmit`.

```typescript
const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

const form = useForm({
  defaultValues: {
    title: "",
    description: "",
    completed: false,
  },
  validators: {
    onChange: createTodoSchema,
  },
  onSubmit: async ({ value }) => {
    // Handle submission here — see submission patterns below
  },
});
```

Key rules:

- `defaultValues` must include every field in the schema with its correct type (empty string for text, `false` for booleans, etc.).
- `validators.onChange` is always set to the Zod schema. This enables real-time validation as the user types.
- Always declare `const [isSubmitting, setIsSubmitting] = useState<boolean>(false)` alongside the form for tracking loading state from async operations.

---

## Step 3: Build the Form JSX

### Form element

Always prevent default and delegate to `form.handleSubmit()`:

```typescript
<form
  onSubmit={(e) => {
    e.preventDefault();
    form.handleSubmit();
  }}
  className="space-y-4"
>
```

### FieldGroup wrapper

Wrap all fields in a `FieldGroup`:

```typescript
<FieldGroup>
  {/* form.Field components go here */}
</FieldGroup>
```

---

## Step 4: Render Fields

### Text Input Field (standard pattern)

This is the exact pattern used across the codebase. Follow it precisely:

```typescript
<form.Field name="title">
  {(field) => {
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={field.name}>Title</FieldLabel>
        <Input
          id={field.name}
          name={field.name}
          placeholder="Enter a title"
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          disabled={isSubmitting || form.state.isSubmitting}
        />
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </Field>
    );
  }}
</form.Field>
```

Critical details:

- `isInvalid` is always `field.state.meta.isTouched && !field.state.meta.isValid`.
- `data-invalid={isInvalid}` goes on the `<Field>` wrapper.
- `id={field.name}` and `name={field.name}` on the input.
- `htmlFor={field.name}` on the label.
- `aria-invalid={isInvalid}` on the input for accessibility.
- `disabled={isSubmitting || form.state.isSubmitting}` on the input.
- `FieldError` is conditionally rendered: `{isInvalid && <FieldError errors={field.state.meta.errors} />}`.

### Email Input Field

Same as text input but with `type="email"`:

```typescript
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
          placeholder="Enter your email"
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          disabled={isSubmitting || form.state.isSubmitting}
        />
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </Field>
    );
  }}
</form.Field>
```

### Password Input Field (with show/hide toggle)

```typescript
const [showPassword, setShowPassword] = useState(false);

// Inside the form:
<form.Field name="password">
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
            placeholder="Enter your password"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            aria-invalid={isInvalid}
            className="pr-10"
            disabled={isSubmitting || form.state.isSubmitting}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-0.5 size-7 -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isSubmitting || form.state.isSubmitting}
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
</form.Field>
```

Import `EyeIcon` and `EyeOffIcon` from `lucide-react` for the toggle.

### Checkbox Field

Use `orientation="horizontal"` on the `Field` wrapper. The label goes **after** the checkbox:

```typescript
<form.Field name="rememberMe">
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
          disabled={isSubmitting || form.state.isSubmitting}
        />
        <FieldLabel htmlFor={field.name} className="font-normal">
          Remember me
        </FieldLabel>
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </Field>
    );
  }}
</form.Field>
```

### Textarea Field

```typescript
<form.Field name="description">
  {(field) => {
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={field.name}>Description</FieldLabel>
        <Textarea
          id={field.name}
          name={field.name}
          placeholder="Enter a description"
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          disabled={isSubmitting || form.state.isSubmitting}
        />
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </Field>
    );
  }}
</form.Field>
```

### Select Field

```typescript
<form.Field name="priority">
  {(field) => {
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={field.name}>Priority</FieldLabel>
        <Select
          value={field.state.value}
          onValueChange={(value) => field.handleChange(value)}
        >
          <SelectTrigger
            id={field.name}
            aria-invalid={isInvalid}
            disabled={isSubmitting || form.state.isSubmitting}
          >
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </Field>
    );
  }}
</form.Field>
```

### Side-by-Side Fields

Wrap adjacent fields in a flex container:

```typescript
<div className="flex flex-col gap-4 md:flex-row md:gap-2">
  <form.Field name="firstName">
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
            disabled={isSubmitting || form.state.isSubmitting}
          />
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    }}
  </form.Field>
  <form.Field name="lastName">
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
            disabled={isSubmitting || form.state.isSubmitting}
          />
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    }}
  </form.Field>
</div>
```

Note: Add `className="size-full"` to each `<Field>` so they share space equally.

---

## Step 5: Submit Button

Always show `LoaderIcon` with `animate-spin` during submission:

```typescript
<Button
  className="w-full"
  type="submit"
  aria-disabled={!form.state.isFormValid || isSubmitting || form.state.isSubmitting}
  disabled={!form.state.isFormValid || isSubmitting || form.state.isSubmitting}
>
  {(isSubmitting || form.state.isSubmitting) && (
    <LoaderIcon className="mr-1 size-3 animate-spin" />
  )}
  Create todo
</Button>
```

Key rules:

- Use both `disabled` and `aria-disabled` for accessibility.
- Combine `!form.state.isFormValid`, `isSubmitting`, and `form.state.isSubmitting` in the disabled condition. (Omit `!form.state.isFormValid` if the form should allow submission attempts for server-side validation.)
- The loader icon has `className="mr-1 size-3 animate-spin"`.

---

## Step 6: Submission Patterns

### Pattern A: Direct API call (like auth forms)

Use when calling an API client directly (e.g., `authClient`):

```typescript
onSubmit: async ({ value }) => {
  await authClient.signIn.email({
    email: value.email,
    password: value.password,
    rememberMe: value.rememberMe,
    callbackURL: "/",
    fetchOptions: {
      onRequest: () => {
        setIsSubmitting(true);
      },
      onResponse: () => {
        setIsSubmitting(false);
      },
      onError: (ctx) => {
        toast.error("Failed to sign in", {
          description: ctx.error?.message,
        });
      },
      onSuccess: () => {
        toast.success("Signed in successfully");
        navigate({ to: "/" });
      },
    },
  });
},
```

### Pattern B: TanStack Query mutation

Use when the form triggers a data mutation with TanStack Query:

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Inside the component:
const queryClient = useQueryClient();

const createTodoMutation = useMutation({
  mutationFn: async (data: { title: string; description: string; completed: boolean }) => {
    const response = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create todo");
    return response.json();
  },
  onMutate: async (newTodo) => {
    // Optimistic update
    await queryClient.cancelQueries({ queryKey: ["todos"] });
    const previousTodos = queryClient.getQueryData(["todos"]);
    queryClient.setQueryData(["todos"], (old: Todo[]) => [...old, { ...newTodo, id: "temp" }]);
    return { previousTodos };
  },
  onError: (_error, _variables, context) => {
    // Rollback on error
    queryClient.setQueryData(["todos"], context?.previousTodos);
    toast.error("Failed to create todo");
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["todos"] });
  },
  onSuccess: () => {
    toast.success("Todo created successfully");
  },
});

const form = useForm({
  defaultValues: {
    title: "",
    description: "",
    completed: false,
  },
  validators: {
    onChange: createTodoSchema,
  },
  onSubmit: async ({ value }) => {
    setIsSubmitting(true);
    try {
      await createTodoMutation.mutateAsync(value);
      form.reset();
    } catch {
      // Error handled by mutation onError
    } finally {
      setIsSubmitting(false);
    }
  },
});
```

---

## Complete Example: Simple Create Form

```typescript
// apps/web/src/routes/todos/-components/create-todo-form.tsx
import { useForm } from "@tanstack/react-form";
import { LoaderIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { createTodoSchema } from "@weldr/schemas/todos";
import { Button } from "@weldr/ui/components/button";
import { Checkbox } from "@weldr/ui/components/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@weldr/ui/components/field";
import { Input } from "@weldr/ui/components/input";
import { Textarea } from "@weldr/ui/components/textarea";

export function CreateTodoForm() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      completed: false,
    },
    validators: {
      onChange: createTodoSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        // Replace with your actual API call or mutation
        await fetch("/api/todos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        });
        toast.success("Todo created successfully");
        form.reset();
      } catch {
        toast.error("Failed to create todo");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <FieldGroup>
        <form.Field name="title">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="Enter a title"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  disabled={isSubmitting || form.state.isSubmitting}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="description">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  placeholder="Enter a description"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  disabled={isSubmitting || form.state.isSubmitting}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="completed">
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
                  disabled={isSubmitting || form.state.isSubmitting}
                />
                <FieldLabel htmlFor={field.name} className="font-normal">
                  Mark as completed
                </FieldLabel>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>
      <Button
        className="w-full"
        type="submit"
        aria-disabled={!form.state.isFormValid || isSubmitting || form.state.isSubmitting}
        disabled={!form.state.isFormValid || isSubmitting || form.state.isSubmitting}
      >
        {(isSubmitting || form.state.isSubmitting) && (
          <LoaderIcon className="mr-1 size-3 animate-spin" />
        )}
        Create todo
      </Button>
    </form>
  );
}
```

---

## Complete Example: Edit Form with Pre-filled Values and Mutation

```typescript
// apps/web/src/routes/todos/-components/update-todo-form.tsx
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { updateTodoSchema } from "@weldr/schemas/todos";
import { Button } from "@weldr/ui/components/button";
import { Checkbox } from "@weldr/ui/components/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@weldr/ui/components/field";
import { Input } from "@weldr/ui/components/input";
import { Textarea } from "@weldr/ui/components/textarea";

type Todo = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

export function UpdateTodoForm({ todo, onSuccess }: { todo: Todo; onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const updateTodoMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; completed: boolean }) => {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update todo");
      return response.json();
    },
    onMutate: async (updatedTodo) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previousTodos = queryClient.getQueryData(["todos"]);
      queryClient.setQueryData(["todos"], (old: Todo[]) =>
        old.map((t) => (t.id === todo.id ? { ...t, ...updatedTodo } : t)),
      );
      return { previousTodos };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(["todos"], context?.previousTodos);
      toast.error("Failed to update todo");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    onSuccess: () => {
      toast.success("Todo updated successfully");
      onSuccess?.();
    },
  });

  const form = useForm({
    defaultValues: {
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
    },
    validators: {
      onChange: updateTodoSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        await updateTodoMutation.mutateAsync(value);
      } catch {
        // Error handled by mutation onError
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <FieldGroup>
        <form.Field name="title">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="Enter a title"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  disabled={isSubmitting || form.state.isSubmitting}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="description">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  placeholder="Enter a description"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  disabled={isSubmitting || form.state.isSubmitting}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="completed">
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
                  disabled={isSubmitting || form.state.isSubmitting}
                />
                <FieldLabel htmlFor={field.name} className="font-normal">
                  Mark as completed
                </FieldLabel>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>
      <Button
        className="w-full"
        type="submit"
        aria-disabled={!form.state.isFormValid || isSubmitting || form.state.isSubmitting}
        disabled={!form.state.isFormValid || isSubmitting || form.state.isSubmitting}
      >
        {(isSubmitting || form.state.isSubmitting) && (
          <LoaderIcon className="mr-1 size-3 animate-spin" />
        )}
        Update todo
      </Button>
    </form>
  );
}
```

---

## Complete Example: Multi-Field-Type Form with Select

```typescript
// apps/web/src/routes/projects/-components/create-project-form.tsx
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { createProjectSchema } from "@weldr/schemas/projects";
import { Button } from "@weldr/ui/components/button";
import { Checkbox } from "@weldr/ui/components/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@weldr/ui/components/field";
import { Input } from "@weldr/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@weldr/ui/components/select";
import { Textarea } from "@weldr/ui/components/textarea";

export function CreateProjectForm({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const createProjectMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      priority: string;
      isPublic: boolean;
    }) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create project");
      return response.json();
    },
    onError: () => {
      toast.error("Failed to create project");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onSuccess: () => {
      toast.success("Project created successfully");
      onSuccess?.();
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      priority: "medium",
      isPublic: false,
    },
    validators: {
      onChange: createProjectSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        await createProjectMutation.mutateAsync(value);
        form.reset();
      } catch {
        // Error handled by mutation onError
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <FieldGroup>
        <form.Field name="name">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Project name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="Enter project name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  disabled={isSubmitting || form.state.isSubmitting}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="description">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  placeholder="Describe your project"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  disabled={isSubmitting || form.state.isSubmitting}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="priority">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Priority</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={isInvalid}
                    disabled={isSubmitting || form.state.isSubmitting}
                  >
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="isPublic">
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
                  disabled={isSubmitting || form.state.isSubmitting}
                />
                <FieldLabel htmlFor={field.name} className="font-normal">
                  Make this project public
                </FieldLabel>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>
      <Button
        className="w-full"
        type="submit"
        aria-disabled={!form.state.isFormValid || isSubmitting || form.state.isSubmitting}
        disabled={!form.state.isFormValid || isSubmitting || form.state.isSubmitting}
      >
        {(isSubmitting || form.state.isSubmitting) && (
          <LoaderIcon className="mr-1 size-3 animate-spin" />
        )}
        Create project
      </Button>
    </form>
  );
}
```

---

## Checklist (verify every form against this)

- [ ] `useForm` is imported from `@tanstack/react-form`
- [ ] `defaultValues` covers every field in the Zod schema
- [ ] `validators.onChange` is set to the Zod schema from `@weldr/schemas/*`
- [ ] `const [isSubmitting, setIsSubmitting] = useState<boolean>(false)` is declared
- [ ] Form element uses `onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}`
- [ ] All fields are wrapped in a `<FieldGroup>`
- [ ] Each field uses `const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid`
- [ ] `<Field data-invalid={isInvalid}>` wraps each field's content
- [ ] `<FieldLabel htmlFor={field.name}>` is used for every label
- [ ] Inputs have `id={field.name}`, `name={field.name}`, `value={field.state.value}`, `onBlur={field.handleBlur}`, `aria-invalid={isInvalid}`
- [ ] Text inputs use `onChange={(e) => field.handleChange(e.target.value)}`
- [ ] Checkboxes use `onCheckedChange={(checked: boolean) => { field.handleChange(checked); }}`
- [ ] All interactive elements have `disabled={isSubmitting || form.state.isSubmitting}`
- [ ] `{isInvalid && <FieldError errors={field.state.meta.errors} />}` appears in every field
- [ ] Submit button shows `<LoaderIcon className="mr-1 size-3 animate-spin" />` when loading
- [ ] Submit button has both `disabled` and `aria-disabled` attributes
- [ ] Submission errors use `toast.error()` from `sonner`
- [ ] All UI components come from `@weldr/ui/components/*`
- [ ] Checkbox fields use `orientation="horizontal"` on the `<Field>` wrapper
- [ ] Password fields include show/hide toggle with `EyeIcon`/`EyeOffIcon` from `lucide-react`

---

## Available UI Components Reference

All components are imported from `@weldr/ui/components/<name>`:

| Component                                                                                                                                        | Import path | Usage                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ---------------------------------------- |
| `Field`, `FieldLabel`, `FieldError`, `FieldGroup`, `FieldSet`, `FieldDescription`, `FieldContent`, `FieldTitle`, `FieldLegend`, `FieldSeparator` | `field`     | Form field layout and validation display |
| `Input`                                                                                                                                          | `input`     | Text, email, password inputs             |
| `Textarea`                                                                                                                                       | `textarea`  | Multi-line text input                    |
| `Button`                                                                                                                                         | `button`    | Buttons and submit triggers              |
| `Checkbox`                                                                                                                                       | `checkbox`  | Boolean toggle fields                    |
| `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator`                         | `select`    | Dropdown selection fields                |
| `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`                                                                              | `card`      | Card wrapper for standalone forms        |
