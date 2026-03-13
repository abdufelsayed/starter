import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

import { container, footer, h1, main, text } from "../styles";

interface PasswordResetSuccessEmailProps {
  userFirstName?: string;
}

export const PasswordResetSuccessEmail = ({
  userFirstName,
}: PasswordResetSuccessEmailProps): React.ReactNode => {
  return (
    <Html>
      <Head />
      <Preview>Your password has been reset</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Password reset successful</Heading>
          <Text style={text}>Hi {userFirstName ? userFirstName : "there"},</Text>
          <Text style={text}>
            Your password has been successfully reset. You can now sign in with your new password.
          </Text>
          <Text style={footer}>
            If you didn't make this change, please contact support immediately to secure your
            account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordResetSuccessEmail;
