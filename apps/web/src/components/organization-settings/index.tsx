import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@starter/ui/components/tabs";

import { CreateOrganizationForm } from "./create-organization-form";
import { OrganizationInboxForm } from "./organization-inbox-form";
import { OrganizationInvitationsForm } from "./organization-invitations-form";
import { OrganizationMembersForm } from "./organization-members-form";
import { OrganizationSettingsForm } from "./organization-settings-form";
import { OrganizationSummary } from "./organization-summary";

type OrganizationView = "create" | "manage";

export function OrganizationSettings() {
  const [view, setView] = useState<OrganizationView>("manage");

  if (view === "create") {
    return <CreateOrganizationForm onBack={() => setView("manage")} />;
  }

  return (
    <Tabs defaultValue="summary" className="gap-4">
      <TabsList className="w-full">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="invites">Invites</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="summary" className="flex flex-col gap-4">
        <OrganizationSummary onCreate={() => setView("create")} />
        <OrganizationInboxForm />
      </TabsContent>

      <TabsContent value="members">
        <OrganizationMembersForm />
      </TabsContent>

      <TabsContent value="invites">
        <OrganizationInvitationsForm />
      </TabsContent>

      <TabsContent value="settings">
        <OrganizationSettingsForm />
      </TabsContent>
    </Tabs>
  );
}

export { CreateOrganizationForm } from "./create-organization-form";
export { OrganizationInboxForm } from "./organization-inbox-form";
export { OrganizationInvitationsForm } from "./organization-invitations-form";
export { OrganizationMembersForm } from "./organization-members-form";
export { OrganizationSettingsForm } from "./organization-settings-form";
export { OrganizationSummary } from "./organization-summary";
