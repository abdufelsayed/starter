import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import { container, footer, h1, main, text } from "../styles";

const codeStyle = {
  fontSize: "32px",
  fontWeight: "700",
  letterSpacing: "6px",
  textAlign: "center" as const,
  color: "#1a1a1a",
  padding: "16px 0",
};

interface TwoFactorOtpEmailProps {
  userFirstName?: string;
  otp: string;
}

export const TwoFactorOtpEmail = ({ userFirstName, otp }: TwoFactorOtpEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your verification code for Starter</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your verification code</Heading>
          <Text style={text}>Hi {userFirstName ? userFirstName : "there"},</Text>
          <Text style={text}>
            Use the following code to verify your identity. This code will expire in 3 minutes.
          </Text>
          <Section style={{ padding: "20px 0", textAlign: "center" as const }}>
            <Text style={codeStyle}>{otp}</Text>
          </Section>
          <Text style={footer}>
            If you didn't request this code, you can safely ignore this email. Someone may have
            entered your email address by mistake.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default TwoFactorOtpEmail;
