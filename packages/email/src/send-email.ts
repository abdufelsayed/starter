import { Resend } from "resend";

import { serverEnv } from "@starter/env/server";

const resend = new Resend(serverEnv.RESEND_API_KEY);

export const sendEmail = async ({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactNode;
}) => {
  const response = await resend.emails.send({
    from: "noreply@starter.ai",
    to,
    subject,
    react,
  });
  return response;
};
