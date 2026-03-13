import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import { container, footer, h1, link, main, text } from "../styles";

interface DeleteAccountVerificationEmailProps {
  userFirstName?: string;
  confirmationLink: string;
}

const warningBox = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fca5a5",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "20px",
};

const warningHeading = {
  fontSize: "16px",
  fontWeight: "700" as const,
  color: "#991b1b",
  margin: "0 0 12px 0",
};

const warningText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#7f1d1d",
  margin: "0 0 8px 0",
};

const dangerButton = {
  backgroundColor: "#dc2626",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
};

const listItem = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#7f1d1d",
  margin: "0",
};

export const DeleteAccountVerificationEmail = ({
  userFirstName,
  confirmationLink,
}: DeleteAccountVerificationEmailProps): React.ReactNode => {
  return (
    <Html>
      <Head />
      <Preview>ACTION REQUIRED: Confirm permanent deletion of your Starter account</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={{ ...h1, color: "#dc2626" }}>Account Deletion Request</Heading>
          <Text style={text}>Hi {userFirstName ? userFirstName : "there"},</Text>
          <Text style={text}>
            We received a request to <strong>permanently delete</strong> your Starter account.
            Before we proceed, please understand the full consequences of this action.
          </Text>

          <Section style={warningBox}>
            <Text style={warningHeading}>THIS ACTION IS IRREVERSIBLE</Text>
            <Text style={warningText}>
              Once your account is deleted, the following will be permanently destroyed and cannot
              be recovered under any circumstances:
            </Text>
            <Text style={listItem}>&bull; Your entire account profile and all personal data</Text>
            <Text style={listItem}>&bull; All active sessions and login credentials</Text>
            <Text style={listItem}>&bull; Connected OAuth accounts (Google, GitHub, etc.)</Text>
            <Text style={listItem}>
              &bull; Two-factor authentication configuration and backup codes
            </Text>
            <Text style={listItem}>&bull; Your ownership and membership in all organizations</Text>
            <Text style={listItem}>&bull; Any active subscriptions and billing history</Text>
            <Text style={listItem}>
              &bull; All remaining credit balances — these will NOT be refunded
            </Text>
          </Section>

          <Text style={{ ...text, fontWeight: "600", color: "#991b1b" }}>
            If you are the sole owner of any organization, those organizations will become
            unmanageable. Please transfer ownership before deleting your account.
          </Text>

          <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0" }} />

          <Text style={text}>
            If you are absolutely certain you want to delete your account, click the button below.
            This link will expire in 24 hours.
          </Text>

          <Section style={{ padding: "20px 0" }}>
            <a href={confirmationLink} style={dangerButton}>
              Permanently Delete My Account
            </a>
          </Section>

          <Text style={text}>
            or copy and paste this URL into your browser:{" "}
            <Link href={confirmationLink} style={link}>
              {confirmationLink}
            </Link>
          </Text>

          <Text style={footer}>
            If you did not request this deletion, your account is safe — no action is needed.
            However, we strongly recommend changing your password immediately, as someone else may
            have access to your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default DeleteAccountVerificationEmail;
