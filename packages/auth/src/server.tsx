import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  admin,
  haveIBeenPwned,
  lastLoginMethod,
  magicLink,
  openAPI,
  organization,
  twoFactor,
} from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { Stripe } from "stripe";

import { db } from "@starter/db";
import { sendEmail } from "@starter/email";
import {
  MagicLinkEmail,
  PasswordResetEmail,
  TwoFactorOtpEmail,
  VerificationEmail,
} from "@starter/email/templates";
import { serverEnv } from "@starter/env/server";
import { PLANS, TRIAL_DAYS } from "@starter/schemas/billing";
import { nanoid } from "@starter/shared/nanoid";

const stripeClient = new Stripe(serverEnv.STRIPE_SECRET_KEY, {
  apiVersion: "2026-01-28.clover",
});

export const auth = betterAuth({
  baseURL: serverEnv.SERVER_URL,
  basePath: "/api/auth",
  trustedOrigins: serverEnv.CORS_HOST.split(","),
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  advanced: {
    database: {
      generateId: () => nanoid(12),
    },
    cookiePrefix: "starter",
  },
  socialProviders: {
    google: {
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: serverEnv.GITHUB_CLIENT_ID,
      clientSecret: serverEnv.GITHUB_CLIENT_SECRET,
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    async sendResetPassword({ user, token }) {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        react: (
          <PasswordResetEmail
            userFirstName={user.name.split(" ")[0] ?? user.email}
            resetLink={`${serverEnv.WEB_APP_URL}/auth/reset-password?token=${token}`}
          />
        ),
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, token }) {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        react: (
          <VerificationEmail
            userFirstName={user.name.split(" ")[0] ?? user.email}
            verificationLink={`${serverEnv.WEB_APP_URL}/auth/verify-email?token=${token}`}
          />
        ),
      });
    },
  },
  plugins: [
    admin(),
    haveIBeenPwned(),
    lastLoginMethod(),
    magicLink({
      async sendMagicLink({ email, url }) {
        const name = email.split("@")[0];
        await sendEmail({
          to: email,
          subject: "Sign in to Starter",
          react: <MagicLinkEmail userFirstName={name} magicLink={url} />,
        });
      },
    }),
    openAPI({ disableDefaultReference: true }),
    organization(),
    twoFactor({
      issuer: "Starter",
      skipVerificationOnEnable: false,
      otpOptions: {
        async sendOTP({ user, otp }) {
          await sendEmail({
            to: user.email,
            subject: "Your verification code",
            react: (
              <TwoFactorOtpEmail userFirstName={user.name.split(" ")[0] ?? user.email} otp={otp} />
            ),
          });
        },
      },
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: serverEnv.STRIPE_WEBHOOK_SECRET,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        requireEmailVerification: true,
        plans: [
          {
            name: PLANS.pro.name,
            priceId: serverEnv.STRIPE_PRO_PRICE_ID,
            annualDiscountPriceId: serverEnv.STRIPE_PRO_ANNUAL_PRICE_ID,
            limits: PLANS.pro.limits,
            freeTrial: {
              days: TRIAL_DAYS,
            },
          },
          {
            name: PLANS.max.name,
            priceId: serverEnv.STRIPE_MAX_PRICE_ID,
            annualDiscountPriceId: serverEnv.STRIPE_MAX_ANNUAL_PRICE_ID,
            limits: PLANS.max.limits,
            freeTrial: {
              days: TRIAL_DAYS,
            },
          },
        ],
        onSubscriptionComplete: async ({ subscription, stripeSubscription }) => {
          console.log(
            `[stripe] Subscription completed: ${subscription.id} (plan: ${subscription.plan}, status: ${stripeSubscription.status})`,
          );
        },
        onSubscriptionUpdate: async ({ subscription }) => {
          console.log(
            `[stripe] Subscription updated: ${subscription.id} (plan: ${subscription.plan}, status: ${subscription.status})`,
          );
        },
        onSubscriptionCancel: async ({ subscription, cancellationDetails }) => {
          console.log(
            `[stripe] Subscription cancelled: ${subscription.id} (reason: ${cancellationDetails?.reason ?? "none"})`,
          );
        },
        onSubscriptionDeleted: async ({ subscription }) => {
          console.log(`[stripe] Subscription deleted: ${subscription.id}`);
        },
      },
      organization: {
        enabled: true,
      },
    }),
    tanstackStartCookies(),
  ],
});
