import { Tabs, TabsContent, TabsList, TabsTrigger } from "@starter/ui/components/tabs";

import { BillingSettings } from "@/components/billing/billing-settings";
import { ChangePasswordForm } from "./change-password-form";
import { DeleteAccount } from "./delete-account";
import { LinkedProviders } from "./linked-providers";
import { SessionsList } from "./sessions-list";
import { TwoFactorSetup } from "./two-factor-setup";
import { UpdateEmailForm } from "./update-email-form";
import { UpdateNameForm } from "./update-name-form";

export function AccountSettings() {
  return (
    <Tabs defaultValue="account" className="w-2xl gap-4">
      <TabsList className="w-full">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="space-y-4">
        <UpdateNameForm />
        <UpdateEmailForm />
        <LinkedProviders />
        <DeleteAccount />
      </TabsContent>
      <TabsContent value="security" className="space-y-4">
        <TwoFactorSetup />
        <ChangePasswordForm />
        <SessionsList />
      </TabsContent>
      <TabsContent value="billing">
        <BillingSettings />
      </TabsContent>
    </Tabs>
  );
}
