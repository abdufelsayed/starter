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

interface ChangeEmailConfirmationEmailProps {
  userFirstName?: string;
  newEmail: string;
  confirmationLink: string;
}

export const ChangeEmailConfirmationEmail = ({
  userFirstName,
  newEmail,
  confirmationLink,
}: ChangeEmailConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Confirm your email change for Starter</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Confirm your email change</Heading>
          <Text style={text}>Hi {userFirstName ? userFirstName : "there"},</Text>
          <Text style={text}>
            We received a request to change your email address to <strong>{newEmail}</strong>. Click
            the button below to confirm this change.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={confirmationLink}>
              Confirm Email Change
            </Button>
          </Section>
          <Text style={text}>
            or copy and paste this URL into your browser:{" "}
            <Link href={confirmationLink} style={link}>
              {confirmationLink}
            </Link>
          </Text>
          <Text style={footer}>
            If you didn't request this change, you can safely ignore this email. Your email address
            will not be changed.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ChangeEmailConfirmationEmail;
