# shadcn/ui + Base UI Component System

Guide for building UI in this project using shadcn/ui component wrappers built on top of **Base UI** (`@base-ui/react` ^1.2.0). All components are styled exclusively with **Tailwind CSS v4** utility classes. Covers available components, creating new wrappers, variant patterns (CVA), animation conventions, and accessibility. No CSS-in-JS, no CSS modules, no `@apply` in component files.

## Architecture Overview

- **Base UI primitives** come from `@base-ui/react` (e.g., `@base-ui/react/button`, `@base-ui/react/dialog`)
- **Project wrappers** live in `packages/ui/src/components/` and are imported via `@weldr/ui/components/*`
- **Utility function** `cn()` from `@weldr/ui/lib/utils` merges Tailwind classes using `clsx` + `tailwind-merge`
- **Variants** use `class-variance-authority` (`cva`) when a component has multiple visual variants/sizes
- **Icons** come from `lucide-react`

## Rule: Always Use Project Wrappers First

Before using raw `@base-ui/react` imports, check if a wrapper exists in `packages/ui/src/components/`. The project has wrappers for most common components. Only import directly from `@base-ui/react` when no project wrapper exists.

### Import Pattern

```typescript
// CORRECT: Use project wrappers
import { Button } from "@weldr/ui/components/button";
import { Input } from "@weldr/ui/components/input";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@weldr/ui/components/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@weldr/ui/components/select";

// CORRECT: Only when no wrapper exists for a specific Base UI component
import { SomeComponent } from "@base-ui/react/some-component";

// WRONG: Never import from @base-ui/react when a wrapper exists
import { Button } from "@base-ui/react/button";
```

## Available Component Wrappers

All wrappers are in `packages/ui/src/components/` and imported from `@weldr/ui/components/<name>`.

### Form Controls

| Component                                                                                                | Import                             | Base UI Primitive                                    | Notes                                                                                                                        |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Button                                                                                                   | `@weldr/ui/components/button`      | `@base-ui/react/button`                              | Variants: default, outline, secondary, ghost, destructive, link. Sizes: xs, sm, default, lg, icon, icon-xs, icon-sm, icon-lg |
| Input                                                                                                    | `@weldr/ui/components/input`       | `@base-ui/react/input`                               | Standard text input with focus/error states                                                                                  |
| Checkbox                                                                                                 | `@weldr/ui/components/checkbox`    | `@base-ui/react/checkbox`                            | Includes CheckIcon indicator                                                                                                 |
| RadioGroup, RadioGroupItem                                                                               | `@weldr/ui/components/radio-group` | `@base-ui/react/radio`, `@base-ui/react/radio-group` | Grid layout by default                                                                                                       |
| Switch                                                                                                   | `@weldr/ui/components/switch`      | `@base-ui/react/switch`                              | Sizes: sm, default. Includes thumb                                                                                           |
| Select, SelectTrigger, SelectContent, SelectItem, SelectValue, SelectGroup, SelectLabel, SelectSeparator | `@weldr/ui/components/select`      | `@base-ui/react/select`                              | Full select with scroll arrows, check indicators                                                                             |
| Toggle                                                                                                   | `@weldr/ui/components/toggle`      | `@base-ui/react/toggle`                              | Variants: default, outline. Sizes: sm, default, lg                                                                           |
| Slider                                                                                                   | `@weldr/ui/components/slider`      | `@base-ui/react/slider`                              | Supports multiple thumbs, horizontal/vertical                                                                                |
| Label                                                                                                    | `@weldr/ui/components/label`       | Native `<label>`                                     | Not a Base UI primitive; plain styled label                                                                                  |

### Field System

| Component                                                                                                                    | Import                       | Notes                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Field, FieldLabel, FieldDescription, FieldError, FieldGroup, FieldSet, FieldLegend, FieldSeparator, FieldContent, FieldTitle | `@weldr/ui/components/field` | Composable field system with orientation variants (vertical, horizontal, responsive). Uses `cva` for field variants. |

### Layout & Overlays

| Component                                                                                                                                                                                                                                                                          | Import                               | Base UI Primitive             | Notes                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ----------------------------- | -------------------------------------------------------------------------- |
| Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose, DialogOverlay, DialogPortal                                                                                                                                         | `@weldr/ui/components/dialog`        | `@base-ui/react/dialog`       | Content includes close button by default (`showCloseButton` prop)          |
| AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, AlertDialogMedia                                                                                        | `@weldr/ui/components/alert-dialog`  | `@base-ui/react/alert-dialog` | Sizes: default, sm. Cancel uses `render` prop to compose with Button       |
| Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription                                                                                                                                                                                           | `@weldr/ui/components/popover`       | `@base-ui/react/popover`      | Positioned with side/align props                                           |
| Tooltip, TooltipTrigger, TooltipContent, TooltipProvider                                                                                                                                                                                                                           | `@weldr/ui/components/tooltip`       | `@base-ui/react/tooltip`      | Includes arrow, positioned with side/align props                           |
| DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuShortcut | `@weldr/ui/components/dropdown-menu` | `@base-ui/react/menu`         | Full menu system with submenus, checkbox/radio items                       |
| Accordion, AccordionItem, AccordionTrigger, AccordionContent                                                                                                                                                                                                                       | `@weldr/ui/components/accordion`     | `@base-ui/react/accordion`    | Animated expand/collapse                                                   |
| Tabs, TabsList, TabsTrigger, TabsContent                                                                                                                                                                                                                                           | `@weldr/ui/components/tabs`          | `@base-ui/react/tabs`         | TabsList variants: default, line. Supports horizontal/vertical orientation |
| Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription, DrawerClose                                                                                                                                                                      | `@weldr/ui/components/drawer`        | `vaul` (not Base UI)          | Uses vaul library, not Base UI                                             |

### Feedback

| Component                                                                | Import                           | Base UI Primitive          |
| ------------------------------------------------------------------------ | -------------------------------- | -------------------------- |
| Progress, ProgressTrack, ProgressIndicator, ProgressLabel, ProgressValue | `@weldr/ui/components/progress`  | `@base-ui/react/progress`  |
| Separator                                                                | `@weldr/ui/components/separator` | `@base-ui/react/separator` |

### Data Display

| Component                                                                         | Import                       | Notes                                    |
| --------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------- |
| Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter | `@weldr/ui/components/card`  | Pure HTML wrappers, no Base UI primitive |
| Badge                                                                             | `@weldr/ui/components/badge` | Pure HTML wrapper                        |

### Other Available Components

`alert`, `aspect-ratio`, `avatar`, `breadcrumb`, `button-group`, `calendar`, `carousel`, `chart`, `collapsible`, `combobox`, `command`, `context-menu`, `direction`, `empty`, `hover-card`, `input-group`, `input-otp`, `item`, `kbd`, `menubar`, `native-select`, `navigation-menu`, `pagination`, `resizable`, `scroll-area`, `sheet`, `sidebar`, `skeleton`, `sonner`, `spinner`, `table`, `textarea`, `toggle-group`

## Creating New Component Wrappers

When wrapping a Base UI primitive that does not yet have a project wrapper, follow these conventions exactly.

### File Location

Place the file in `packages/ui/src/components/<component-name>.tsx`.

### Required Patterns

1. **Import the Base UI primitive from its specific path:**

   ```typescript
   import { ComponentName as ComponentNamePrimitive } from "@base-ui/react/component-name";
   ```

2. **Import `cn` for class merging:**

   ```typescript
   import { cn } from "@weldr/ui/lib/utils";
   ```

3. **Use function declarations (not arrow functions):**

   ```typescript
   function MyComponent({ className, ...props }: ComponentNamePrimitive.Root.Props) {
   ```

4. **Add `data-slot` attribute to every wrapper element** for styling hooks:

   ```typescript
   <ComponentNamePrimitive.Root data-slot="my-component" ... />
   ```

5. **Support `className` passthrough with `cn()`:**

   ```typescript
   className={cn("default-classes-here", className)}
   ```

6. **Use `React.ComponentProps<>` or the primitive's `.Props` type for prop types:**

   ```typescript
   // For Base UI primitives, use their Props type
   function MyComponent({ className, ...props }: ComponentNamePrimitive.Root.Props) { ... }

   // For plain HTML wrappers
   function MyComponent({ className, ...props }: React.ComponentProps<"div">) { ... }

   // For extending with custom props
   function MyComponent({
     className,
     size = "default",
     ...props
   }: ComponentNamePrimitive.Root.Props & {
     size?: "sm" | "default";
   }) { ... }
   ```

7. **Use named exports at the bottom of the file:**
   ```typescript
   export { MyComponent, MyComponentContent, MyComponentTrigger };
   ```

### Variant Pattern with CVA

When a component has multiple visual variants, use `class-variance-authority`:

```typescript
import { cva, type VariantProps } from "class-variance-authority";

const myComponentVariants = cva(
  "base-classes-applied-to-all-variants",
  {
    variants: {
      variant: {
        default: "variant-default-classes",
        outline: "variant-outline-classes",
      },
      size: {
        default: "size-default-classes",
        sm: "size-sm-classes",
        lg: "size-lg-classes",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function MyComponent({
  className,
  variant = "default",
  size = "default",
  ...props
}: PrimitiveProps & VariantProps<typeof myComponentVariants>) {
  return (
    <Primitive
      data-slot="my-component"
      className={cn(myComponentVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { MyComponent, myComponentVariants };
```

### Composable Parts Pattern

Most Base UI components follow a composable parts pattern. Each sub-component gets its own function wrapper:

```typescript
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { cn } from "@weldr/ui/lib/utils";

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = "center",
  side = "bottom",
  sideOffset = 4,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn("styled-classes-here", className)}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverTrigger, PopoverContent };
```

### Positioned Content Pattern (Portal + Positioner + Popup)

Many overlay components (Popover, Select, Tooltip, DropdownMenu) follow the same positioning pattern. The `Content` wrapper bundles Portal, Positioner, and Popup together, exposing positioning props (`side`, `sideOffset`, `align`, `alignOffset`) at the top level:

```typescript
function SomeContent({
  className,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  ...props
}: SomePrimitive.Popup.Props &
  Pick<SomePrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  return (
    <SomePrimitive.Portal>
      <SomePrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <SomePrimitive.Popup
          data-slot="some-content"
          className={cn("styled-popup-classes", className)}
          {...props}
        />
      </SomePrimitive.Positioner>
    </SomePrimitive.Portal>
  );
}
```

### Overlay Pattern (Dialog / AlertDialog)

Overlays that use a backdrop follow this structure:

```typescript
function SomeContent({ className, children, ...props }: SomePrimitive.Popup.Props) {
  return (
    <SomePortal>
      <SomeOverlay />  {/* The backdrop */}
      <SomePrimitive.Popup
        data-slot="some-content"
        className={cn("fixed top-1/2 left-1/2 z-50 ...", className)}
        {...props}
      >
        {children}
      </SomePrimitive.Popup>
    </SomePortal>
  );
}
```

### Base UI `render` Prop for Composition

Base UI provides a `render` prop to compose primitives with other components without extra DOM wrappers. This project uses it for things like the AlertDialog cancel button:

```typescript
// Compose Base UI Close behavior with the project's Button styling
<AlertDialogPrimitive.Close
  render={<Button variant="outline" />}
  {...props}
>
  Cancel
</AlertDialogPrimitive.Close>

// Compose Dialog Close with Button
<DialogPrimitive.Close
  render={<Button variant="ghost" size="icon-sm" />}
>
  <XIcon />
  <span className="sr-only">Close</span>
</DialogPrimitive.Close>
```

## Animation Conventions

Base UI exposes `data-open`, `data-closed`, and `data-[state=*]` attributes for animation states. This project uses Tailwind CSS animation utilities with these data attributes:

```typescript
// Backdrop/overlay fade
"data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0";

// Content zoom + fade
"data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95";

// Slide from direction
"data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2";

// Accordion expand/collapse
"data-closed:animate-accordion-up data-open:animate-accordion-down";

// Transition origin for positioned elements
"origin-(--transform-origin)";
```

Use `duration-100` for short transition durations on overlays. Use `transition-all` or `transition-colors` for interactive state changes.

## Styling Conventions

### Tailwind v4 Syntax

This project uses Tailwind CSS v4. Key syntax differences from v3:

- Use `data-open:` and `data-closed:` instead of `data-[state=open]:` and `data-[state=closed]:`
- Use `data-horizontal:` and `data-vertical:` for orientation variants
- Use `data-checked:` and `data-unchecked:` for toggle states
- Use `data-disabled:` for disabled states
- Use `origin-(--transform-origin)` for CSS custom property values
- Use `h-(--available-height)` and `w-(--anchor-width)` for dynamic sizing from Base UI
- Use `supports-backdrop-filter:backdrop-blur-xs` for progressive enhancement

### Common Class Patterns

**Focus ring:**

```
focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50
```

**Invalid/error state:**

```
aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40
```

**Disabled state:**

```
disabled:pointer-events-none disabled:opacity-50
```

**SVG icon sizing in containers:**

```
[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4
```

**Popover/dropdown surface:**

```
bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10
```

**Dark mode adjustments:** Use `dark:` prefix for dark-mode-specific overrides:

```
dark:bg-input/30 dark:hover:bg-input/50
```

### Color Tokens

Use semantic color tokens (not raw colors):

- `primary`, `primary-foreground` -- brand actions
- `secondary`, `secondary-foreground` -- secondary actions
- `destructive` -- destructive/danger actions
- `muted`, `muted-foreground` -- subtle backgrounds and text
- `accent`, `accent-foreground` -- highlighted/focused items
- `foreground`, `background` -- base text and background
- `popover`, `popover-foreground` -- overlay surfaces
- `card`, `card-foreground` -- card surfaces
- `border`, `input`, `ring` -- borders and focus rings

## Usage Examples

### Basic Button

```tsx
import { Button } from "@weldr/ui/components/button";

<Button variant="default">Save</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost" size="icon">
  <TrashIcon />
</Button>
```

### Dialog

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@weldr/ui/components/dialog";
import { Button } from "@weldr/ui/components/button";

<Dialog>
  <DialogTrigger render={<Button variant="outline" />}>Edit Profile</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogDescription>Make changes to your profile here.</DialogDescription>
    </DialogHeader>
    {/* form content */}
    <DialogFooter>
      <Button type="submit">Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

### Alert Dialog (Confirmation)

```tsx
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@weldr/ui/components/alert-dialog";
import { Button } from "@weldr/ui/components/button";

<AlertDialog>
  <AlertDialogTrigger render={<Button variant="destructive" />}>Delete Account</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>;
```

### Dropdown Menu

```tsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@weldr/ui/components/dropdown-menu";
import { Button } from "@weldr/ui/components/button";

<DropdownMenu>
  <DropdownMenuTrigger render={<Button variant="outline" />}>Options</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Actions</DropdownMenuLabel>
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem>Duplicate</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
```

### Select

```tsx
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@weldr/ui/components/select";

<Select defaultValue="apple">
  <SelectTrigger>
    <SelectValue placeholder="Select a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
    <SelectItem value="cherry">Cherry</SelectItem>
  </SelectContent>
</Select>;
```

### Tooltip

```tsx
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@weldr/ui/components/tooltip";
import { Button } from "@weldr/ui/components/button";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button variant="ghost" size="icon" />}>
      <InfoIcon />
    </TooltipTrigger>
    <TooltipContent side="top">More information here</TooltipContent>
  </Tooltip>
</TooltipProvider>;
```

### Form Field

```tsx
import { Field, FieldLabel, FieldDescription, FieldError } from "@weldr/ui/components/field";
import { Input } from "@weldr/ui/components/input";

<Field orientation="vertical">
  <FieldLabel>Email</FieldLabel>
  <Input type="email" placeholder="you@example.com" />
  <FieldDescription>We will never share your email.</FieldDescription>
  <FieldError errors={errors} />
</Field>;
```

### Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@weldr/ui/components/tabs";

<Tabs defaultValue="general">
  <TabsList>
    <TabsTrigger value="general">General</TabsTrigger>
    <TabsTrigger value="security">Security</TabsTrigger>
  </TabsList>
  <TabsContent value="general">General settings...</TabsContent>
  <TabsContent value="security">Security settings...</TabsContent>
</Tabs>;
```

### Accordion

```tsx
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@weldr/ui/components/accordion";

<Accordion>
  <AccordionItem value="item-1">
    <AccordionTrigger>What is Base UI?</AccordionTrigger>
    <AccordionContent>Base UI is an unstyled, composable React component library.</AccordionContent>
  </AccordionItem>
</Accordion>;
```

### Popover

```tsx
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "@weldr/ui/components/popover";
import { Button } from "@weldr/ui/components/button";

<Popover>
  <PopoverTrigger render={<Button variant="outline" />}>Open Popover</PopoverTrigger>
  <PopoverContent side="bottom" align="start">
    <PopoverHeader>
      <PopoverTitle>Settings</PopoverTitle>
      <PopoverDescription>Configure your preferences.</PopoverDescription>
    </PopoverHeader>
    {/* content */}
  </PopoverContent>
</Popover>;
```

### Card

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@weldr/ui/components/card";

<Card>
  <CardHeader>
    <CardTitle>Project Name</CardTitle>
    <CardDescription>A short description.</CardDescription>
    <CardAction>
      <Button variant="ghost" size="icon-sm">
        <MoreHorizontalIcon />
      </Button>
    </CardAction>
  </CardHeader>
  <CardContent>Main content here.</CardContent>
  <CardFooter>
    <Button>Save</Button>
  </CardFooter>
</Card>;
```

### Progress

```tsx
import { Progress, ProgressLabel, ProgressValue } from "@weldr/ui/components/progress";

<Progress value={65}>
  <ProgressLabel>Uploading...</ProgressLabel>
  <ProgressValue />
</Progress>;
```

## Controlled vs Uncontrolled

Base UI components support both patterns. Use uncontrolled (with `defaultValue`/`defaultOpen`) for simple cases, and controlled (with `value`/`open` + `onValueChange`/`onOpenChange`) when you need programmatic control:

```tsx
// Uncontrolled
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>...</DialogContent>
</Dialog>;

// Controlled
const [open, setOpen] = useState(false);
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>...</DialogContent>
</Dialog>;
```

## Accessibility

Base UI provides built-in accessibility out of the box:

- ARIA attributes are managed automatically (roles, labels, descriptions, expanded states)
- Focus management and focus trapping in dialogs/modals
- Keyboard navigation (arrow keys in menus/selects, Escape to close overlays, Tab management)
- Screen reader announcements for state changes

Do not add redundant ARIA attributes that Base UI already handles. Do add `sr-only` text for icon-only buttons:

```tsx
<Button variant="ghost" size="icon">
  <XIcon />
  <span className="sr-only">Close</span>
</Button>
```

## Key Differences: Base UI vs Radix

This project uses Base UI, not Radix UI. Key differences to remember:

- Import from `@base-ui/react/<component>`, not `@radix-ui/react-<component>`
- Backdrop component is `Primitive.Backdrop`, not `Primitive.Overlay`
- Content is `Primitive.Popup`, not `Primitive.Content`
- Positioning uses `Primitive.Positioner` (not built into Content)
- Data attributes use `data-open`/`data-closed` instead of `data-[state=open]`/`data-[state=closed]`
- The `render` prop replaces Radix's `asChild` for composition
- Menu primitives: `SubmenuRoot` instead of `Sub`, `SubmenuTrigger` instead of `SubTrigger`
