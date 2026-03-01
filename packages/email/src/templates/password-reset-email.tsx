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

interface PasswordResetEmailProps {
  userFirstName?: string;
  resetLink: string;
}

export const PasswordResetEmail = ({
  userFirstName,
  resetLink,
}: PasswordResetEmailProps): React.ReactNode => {
  return (
    <Html>
      <Head />
      <Preview>Reset your password for Starter</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Reset your password</Heading>
          <Text style={text}>Hi {userFirstName ? userFirstName : "there"},</Text>
          <Text style={text}>
            Someone requested a password reset for your account. If this was you, click the button
            below to reset your password.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={resetLink}>
              Reset Password
            </Button>
          </Section>
          <Text style={text}>
            or copy and paste this URL into your browser:{" "}
            <Link href={resetLink} style={link}>
              {resetLink}
            </Link>
          </Text>
          <Text style={footer}>
            If you didn't request a password reset, you can safely ignore this email. Your password
            will not be changed.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordResetEmail;
