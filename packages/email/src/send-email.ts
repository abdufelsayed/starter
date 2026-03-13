import { Resend } from "resend";

import { serverEnv } from "@starter/env/server";

const resend = new Resend(serverEnv.RESEND_API_KEY);

export const sendEmail = async ({
  to,
  from: from_,
  subject,
  react,
}: {
  to: string;
  from?: string;
  subject: string;
  react: React.ReactNode;
}) => {
  const response = await resend.emails.send({
    from: from_ ?? "noreply@starter.ai",
    to,
    subject,
    react,
  });
  return response;
};
