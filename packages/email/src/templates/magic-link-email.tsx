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

interface MagicLinkEmailProps {
  userFirstName?: string;
  magicLink: string;
}

export const MagicLinkEmail = ({ userFirstName, magicLink }: MagicLinkEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Sign in to Starter</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Sign in to Starter</Heading>
          <Text style={text}>Hi {userFirstName ? userFirstName : "there"},</Text>
          <Text style={text}>
            Click the button below to sign in to your account. This link will expire in 5 minutes.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={magicLink}>
              Sign in to Starter
            </Button>
          </Section>
          <Text style={text}>
            or copy and paste this URL into your browser:{" "}
            <Link href={magicLink} style={link}>
              {magicLink}
            </Link>
          </Text>
          <Text style={footer}>
            If you didn't request this sign-in link, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default MagicLinkEmail;
