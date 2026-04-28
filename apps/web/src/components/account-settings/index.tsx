import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Building2Icon,
  CreditCardIcon,
  InboxIcon,
  KeyRoundIcon,
  LinkIcon,
  LogOutIcon,
  MailIcon,
  MonitorSmartphoneIcon,
  PlusIcon,
  Settings2Icon,
  ShieldIcon,
  UserIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@starter/ui/components/badge";
import { Button } from "@starter/ui/components/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@starter/ui/components/card";
import { cn } from "@starter/ui/lib/utils";

import { BillingSettings } from "@/components/billing/billing-settings";
import {
  CreateOrganizationForm,
  OrganizationInboxForm,
  OrganizationInvitationsForm,
  OrganizationMembersForm,
  OrganizationSettingsForm,
  OrganizationSummary,
} from "@/components/organization-settings";
import { authClient } from "@/lib/auth";
import { AccountOverview } from "./account-overview";
import { ChangePasswordForm } from "./change-password-form";
import { DeleteAccount } from "./delete-account";
import { LinkedProviders } from "./linked-providers";
import { SessionsList } from "./sessions-list";
import { TwoFactorSetup } from "./two-factor-setup";
import { UpdateEmailForm } from "./update-email-form";
import { UpdateNameForm } from "./update-name-form";

type SettingsView =
  | "account"
  | "account/overview"
  | "account/profile"
  | "account/email"
  | "account/providers"
  | "account/delete"
  | "organization"
  | "security/two-factor"
  | "security/password"
  | "security/sessions"
  | "organization/summary"
  | "organization/create"
  | "organization/members"
  | "organization/invitations"
  | "organization/inbox"
  | "organization/settings"
  | "billing";

type SettingsItem = {
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  value: SettingsView;
};

const accountItems: SettingsItem[] = [
  { icon: UserIcon, label: "Overview", value: "account/overview" },
  { icon: UserIcon, label: "Profile", value: "account/profile" },
  { icon: MailIcon, label: "Email", value: "account/email" },
  { icon: LinkIcon, label: "Linked Providers", value: "account/providers" },
];

const securityItems: SettingsItem[] = [
  { icon: KeyRoundIcon, label: "Change Password", value: "security/password" },
  { icon: ShieldIcon, label: "Two-Factor Authentication", value: "security/two-factor" },
  { icon: MonitorSmartphoneIcon, label: "Sessions", value: "security/sessions" },
];

const organizationItems: SettingsItem[] = [
  { icon: Building2Icon, label: "Organization Summary", value: "organization/summary" },
  { icon: PlusIcon, label: "Create Organization", value: "organization/create" },
  { icon: Settings2Icon, label: "Organization Settings", value: "organization/settings" },
  { icon: UsersIcon, label: "Members", value: "organization/members" },
  { icon: MailIcon, label: "Invitations", value: "organization/invitations" },
  { icon: InboxIcon, label: "Pending Invites", value: "organization/inbox" },
];

const billingItems: SettingsItem[] = [
  { icon: CreditCardIcon, label: "Plan & Billing", value: "billing" },
];

const rootItems: SettingsItem[] = [
  { icon: UserIcon, label: "Account", value: "account" },
  { icon: Building2Icon, label: "Organization", value: "organization" },
  { icon: CreditCardIcon, label: "Billing", value: "billing" },
];

const viewTitles: Record<SettingsView, string> = {
  account: "Account",
  "account/delete": "Delete Account",
  "account/email": "Email",
  "account/overview": "Account Overview",
  "account/profile": "Profile",
  "account/providers": "Linked Providers",
  billing: "Plan & Billing",
  organization: "Organization",
  "organization/create": "Create Organization",
  "organization/inbox": "Pending Invites",
  "organization/invitations": "Invitations",
  "organization/members": "Members",
  "organization/settings": "Organization Settings",
  "organization/summary": "Organization Summary",
  "security/password": "Change Password",
  "security/sessions": "Sessions",
  "security/two-factor": "Two-Factor Authentication",
};

function getBackView(view: SettingsView): SettingsView | null {
  if (view === "account" || view === "organization" || view === "billing") {
    return null;
  }

  if (view.startsWith("account/") || view.startsWith("security/")) {
    return "account";
  }

  return "organization";
}

export function AccountSettings() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [activeView, setActiveView] = useState<SettingsView | null>(null);
  const { data: session } = useSuspenseQuery(authClient.getSession.queryOptions());
  const { data: organizations } = useSuspenseQuery(authClient.organization.list.queryOptions());
  const activeOrganization = organizations?.find(
    (organization) => organization.id === session?.session.activeOrganizationId,
  );
  const { data: activeRole } = useQuery(
    authClient.organization.getActiveMemberRole.queryOptions({
      enabled: Boolean(activeOrganization),
      input: activeOrganization ? { query: { organizationId: activeOrganization.id } } : undefined,
      retry: false,
    }),
  );

  const signOut = useMutation(
    authClient.signOut.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: async () => {
        queryClient.clear();
        await router.navigate({ to: "/auth/sign-in" });
        toast.success("Signed out successfully");
      },
    }),
  );

  const initials =
    session?.user.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  const goBack = activeView ? () => setActiveView(getBackView(activeView)) : undefined;
  const hasShellHeader = activeView === "account" || activeView === "organization";

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-xl border bg-popover text-popover-foreground">
      {activeView ? (
        <>
          {hasShellHeader ? (
            <div className="flex items-center gap-1 border-b p-1">
              <Button size="icon" variant="ghost" onClick={goBack}>
                <ArrowLeftIcon />
              </Button>
              <div className="min-w-0 px-1">
                <div className="truncate text-sm font-medium">{viewTitles[activeView]}</div>
                <div className="truncate text-xs text-muted-foreground">Settings</div>
              </div>
            </div>
          ) : null}
          {activeView === "account" ? (
            <AccountHeader
              email={session?.user.email ?? ""}
              initials={initials}
              name={session?.user.name ?? "User"}
            />
          ) : null}
          {activeView === "organization" ? (
            <OrganizationHeader
              activeOrganization={activeOrganization}
              activeRole={activeRole?.role}
            />
          ) : null}
          <div className={cn("max-h-[60vh] overflow-y-auto", hasShellHeader && "p-1")}>
            <SettingsDetail
              hasActiveOrganization={Boolean(activeOrganization)}
              isSigningOut={signOut.isPending}
              onBack={() => setActiveView(getBackView(activeView))}
              onSignOut={() => signOut.mutate()}
              setActiveView={setActiveView}
              view={activeView}
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 border-b px-3 py-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{session?.user.name}</div>
              <div className="truncate text-xs text-muted-foreground">{session?.user.email}</div>
            </div>
          </div>

          <div className="p-1">
            <SettingsGroup heading="Settings" items={rootItems} onNavigate={setActiveView} />
          </div>
        </>
      )}
    </div>
  );
}

function SettingsGroup({
  heading,
  items,
  onNavigate,
}: {
  heading: string;
  items: SettingsItem[];
  onNavigate: (view: SettingsView) => void;
}) {
  return (
    <div className="overflow-hidden p-1">
      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{heading}</div>
      {items.map((item) => (
        <SettingsRow
          key={item.value}
          icon={item.icon}
          label={item.label}
          shortcut={item.shortcut}
          onSelect={() => onNavigate(item.value)}
        />
      ))}
    </div>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  onSelect,
  shortcut,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  onSelect: () => void;
  shortcut?: string;
  tone?: "destructive";
}) {
  return (
    <button
      type="button"
      className={cn(
        "group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
        tone === "destructive" && "text-destructive hover:text-destructive",
      )}
      onClick={onSelect}
    >
      <Icon className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
      <span className="truncate">{label}</span>
      {shortcut ? (
        <span className="ms-auto text-xs tracking-widest text-muted-foreground">{shortcut}</span>
      ) : null}
    </button>
  );
}

function SettingsDetail({
  hasActiveOrganization,
  onBack,
  isSigningOut,
  onSignOut,
  setActiveView,
  view,
}: {
  hasActiveOrganization: boolean;
  onBack: () => void;
  isSigningOut: boolean;
  onSignOut: () => void;
  setActiveView: (view: SettingsView | null) => void;
  view: SettingsView;
}) {
  const requiresActiveOrganization =
    view === "organization/members" ||
    view === "organization/invitations" ||
    view === "organization/settings";

  if (requiresActiveOrganization && !hasActiveOrganization) {
    return (
      <NoActiveOrganization onBack={onBack} onCreate={() => setActiveView("organization/create")} />
    );
  }

  switch (view) {
    case "account":
      return (
        <>
          <SettingsGroup heading="Account" items={accountItems} onNavigate={setActiveView} />
          <SettingsGroup heading="Security" items={securityItems} onNavigate={setActiveView} />
          <div className="-mx-1 my-1 h-px bg-border" />
          <div className="p-1">
            <SettingsRow
              icon={UserIcon}
              label="Delete Account"
              tone="destructive"
              onSelect={() => setActiveView("account/delete")}
            />
            <SettingsRow
              icon={LogOutIcon}
              label={isSigningOut ? "Signing out..." : "Sign Out"}
              tone="destructive"
              onSelect={onSignOut}
            />
          </div>
        </>
      );
    case "account/overview":
      return <AccountOverview onBack={onBack} />;
    case "account/profile":
      return <UpdateNameForm onBack={onBack} />;
    case "account/email":
      return <UpdateEmailForm onBack={onBack} />;
    case "account/providers":
      return <LinkedProviders onBack={onBack} />;
    case "account/delete":
      return <DeleteAccount onBack={onBack} />;
    case "security/two-factor":
      return <TwoFactorSetup onBack={onBack} />;
    case "security/password":
      return <ChangePasswordForm onBack={onBack} />;
    case "security/sessions":
      return <SessionsList onBack={onBack} />;
    case "organization":
      return (
        <>
          <SettingsGroup heading="Manage" items={organizationItems} onNavigate={setActiveView} />
          <SettingsGroup heading="Billing" items={billingItems} onNavigate={setActiveView} />
        </>
      );
    case "organization/summary":
      return (
        <OrganizationSummary
          onBack={onBack}
          onCreate={() => setActiveView("organization/create")}
        />
      );
    case "organization/create":
      return <CreateOrganizationForm onBack={onBack} />;
    case "organization/members":
      return <OrganizationMembersForm onBack={onBack} />;
    case "organization/invitations":
      return <OrganizationInvitationsForm onBack={onBack} />;
    case "organization/inbox":
      return <OrganizationInboxForm onBack={onBack} />;
    case "organization/settings":
      return <OrganizationSettingsForm onBack={onBack} />;
    case "billing":
      return <BillingSettings onBack={onBack} />;
  }

  return null;
}

function AccountHeader({
  email,
  initials,
  name,
}: {
  email: string;
  initials: string;
  name: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b px-3 py-3">
      <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
        {initials}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{name}</div>
        <div className="truncate text-xs text-muted-foreground">{email}</div>
      </div>
    </div>
  );
}

function OrganizationHeader({
  activeOrganization,
  activeRole,
}: {
  activeOrganization?: { name: string; slug?: string | null } | null;
  activeRole?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b px-3 py-3">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">
          {activeOrganization?.name ?? "No active organization"}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {activeOrganization?.slug ? `/${activeOrganization.slug}` : "Create an organization"}
        </div>
      </div>
      {activeRole ? <Badge variant="outline">{activeRole}</Badge> : null}
    </div>
  );
}

function NoActiveOrganization({ onBack, onCreate }: { onBack: () => void; onCreate: () => void }) {
  return (
    <Card className="rounded-xl shadow-none ring-0">
      <CardHeader>
        <CardTitle>No Active Organization</CardTitle>
        <CardDescription>
          Create or switch to an organization before managing members, invitations, or organization
          settings.
        </CardDescription>
        <CardAction>
          <Button type="button" variant="ghost" size="icon" onClick={onBack}>
            <ArrowRightIcon className="size-3.5" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardFooter>
        <Button type="button" size="sm" className="ml-auto" onClick={onCreate}>
          <PlusIcon data-icon="inline-start" />
          Create Organization
        </Button>
      </CardFooter>
    </Card>
  );
}
