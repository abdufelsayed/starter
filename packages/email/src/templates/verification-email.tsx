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

interface VerificationEmailProps {
  userFirstName?: string;
  verificationLink: string;
}

export const VerificationEmail = ({ userFirstName, verificationLink }: VerificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address for Starter</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Verify your email address</Heading>
          <Text style={text}>Hi {userFirstName ? userFirstName : "there"},</Text>
          <Text style={text}>
            Welcome to Starter! Please verify your email address by clicking the link below.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={verificationLink}>
              Verify Email Address
            </Button>
          </Section>
          <Text style={text}>
            or copy and paste this URL into your browser:{" "}
            <Link href={verificationLink} style={link}>
              {verificationLink}
            </Link>
          </Text>
          <Text style={footer}>
            If you didn't request this verification, you can ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default VerificationEmail;
