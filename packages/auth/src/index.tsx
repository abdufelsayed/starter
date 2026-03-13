import { stripe } from "@better-auth/stripe";
import { betterAuth, APIError } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  admin,
  haveIBeenPwned,
  lastLoginMethod,
  magicLink,
  openAPI,
  twoFactor,
} from "better-auth/plugins";
import { Stripe } from "stripe";

import { db, and, eq, or } from "@starter/db";
import { subscriptions } from "@starter/db/schema";
import { sendEmail } from "@starter/email";
import {
  ChangeEmailConfirmationEmail,
  DeleteAccountVerificationEmail,
  MagicLinkEmail,
  PasswordResetEmail,
  PasswordResetSuccessEmail,
  TwoFactorOtpEmail,
  VerificationEmail,
} from "@starter/email/templates";
import { serverEnv } from "@starter/env/server";
import { PLANS, TRIAL_DAYS } from "@starter/schemas/billing";

export const stripeClient = new Stripe(serverEnv.STRIPE_SECRET_KEY, {
  apiVersion: "2026-01-28.clover",
});

export const auth = betterAuth({
  appName: "Starter",
  secret: serverEnv.BETTER_AUTH_SECRET,
  baseURL: serverEnv.SERVER_URL,
  basePath: "/api/auth",
  trustedOrigins: serverEnv.CORS_HOST.split(","),
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  rateLimit: {
    enabled: true,
    window: 10,
    max: 100,
    storage: "database",
    customRules: {
      "/api/auth/sign-in/email": { window: 60, max: 5 },
      "/api/auth/sign-up/email": { window: 60, max: 3 },
      "/api/auth/forget-password": { window: 60, max: 3 },
      "/api/auth/reset-password": { window: 60, max: 3 },
      "/api/auth/change-password": { window: 60, max: 3 },
    },
  },
  account: {
    encryptOAuthTokens: true,
  },
  advanced: {
    useSecureCookies: serverEnv.NODE_ENV === "production",
    database: {
      generateId: false,
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
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
    additionalFields: {
      activeOrganizationId: {
        type: "string",
        required: true,
        input: false,
      },
    },
  },
  user: {
    additionalFields: {
      defaultOrganizationId: {
        type: "string",
        required: true,
        input: false,
      },
      stripeCustomerId: {
        type: "string",
        required: false,
        input: false,
      },
    },
    changeEmail: {
      enabled: true,
      async sendChangeEmailConfirmation({ user, newEmail, url }) {
        await sendEmail({
          to: newEmail,
          subject: "Confirm your email change",
          react: (
            <ChangeEmailConfirmationEmail
              userFirstName={user.name.split(" ")[0]}
              newEmail={newEmail}
              confirmationLink={url}
            />
          ),
        });
      },
    },
    deleteUser: {
      enabled: true,
      async sendDeleteAccountVerification({ user, url }) {
        await sendEmail({
          to: user.email,
          subject: "ACTION REQUIRED: Confirm deletion of your Starter account",
          react: (
            <DeleteAccountVerificationEmail
              userFirstName={user.name.split(" ")[0]}
              confirmationLink={url}
            />
          ),
        });
      },
      async beforeDelete(user) {
        const subscriptionsList = await db.query.subscriptions.findMany({
          where: and(
            or(eq(subscriptions.status, "active"), eq(subscriptions.status, "trialing")),
            eq(subscriptions.referenceId, user.id),
          ),
        });

        if (subscriptionsList.length > 0) {
          throw new APIError("FORBIDDEN", {
            message:
              "Cannot delete your account while having an active subscription. Cancel the subscription first.",
          });
        }
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user, url }) {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        react: <PasswordResetEmail userFirstName={user.name.split(" ")[0]} resetLink={url} />,
      });
    },
    async onPasswordReset({ user }) {
      await sendEmail({
        to: user.email,
        subject: "Your password has been reset",
        react: <PasswordResetSuccessEmail userFirstName={user.name.split(" ")[0]} />,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url }) {
      const verificationUrl = new URL(url);
      if (!verificationUrl.searchParams.has("callbackURL")) {
        verificationUrl.searchParams.set("callbackURL", serverEnv.WEB_APP_URL);
      }
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        react: (
          <VerificationEmail
            userFirstName={user.name.split(" ")[0]}
            verificationLink={verificationUrl.toString()}
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
        await sendEmail({
          to: email,
          subject: "Sign in to Starter",
          react: <MagicLinkEmail magicLink={url} />,
        });
      },
    }),
    openAPI({ disableDefaultReference: true }),
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
        storeOTP: "encrypted",
      },
      backupCodeOptions: {
        storeBackupCodes: "encrypted",
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
