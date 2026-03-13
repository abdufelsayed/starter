import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import { button, buttonContainer, container, footer, h1, link, main, text } from "../styles";

interface OrganizationInvitationEmailProps {
  inviterName: string;
  organizationName: string;
  invitationLink: string;
}

export const OrganizationInvitationEmail = ({
  inviterName,
  organizationName,
  invitationLink,
}: OrganizationInvitationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        {inviterName} invited you to join {organizationName} on Starter
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>You've been invited</Heading>
          <Text style={text}>
            <strong>{inviterName}</strong> has invited you to join{" "}
            <strong>{organizationName}</strong> on Starter.
          </Text>
          <Text style={text}>Click the button below to accept the invitation and get started.</Text>
          <Section style={buttonContainer}>
            <Button style={button} href={invitationLink}>
              Accept Invitation
            </Button>
          </Section>
          <Text style={text}>
            or copy and paste this URL into your browser:{" "}
            <Link href={invitationLink} style={link}>
              {invitationLink}
            </Link>
          </Text>
          <Text style={footer}>
            If you weren't expecting this invitation, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrganizationInvitationEmail;
