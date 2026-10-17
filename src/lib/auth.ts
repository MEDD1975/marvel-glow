import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { Pool } from "pg";
import { getAccountStatus, isEmailDisabled } from "./doctor-account-db";
import { sendPasswordResetEmail } from "./kivoir-email";

const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });

export const MIN_PASSWORD_LENGTH = 10;

const originCandidates = [
  process.env["BETTER_AUTH_URL"],
  process.env["VERCEL_PROJECT_PRODUCTION_URL"] && `https://${process.env["VERCEL_PROJECT_PRODUCTION_URL"]}`,
  process.env["VERCEL_URL"] && `https://${process.env["VERCEL_URL"]}`,
  process.env["V0_RUNTIME_URL"],
  process.env["V0_DEV_APP_URL"],
  process.env["V0_BUILD_URL"],
  process.env["V0_SANDBOX_URL"],
  "http://localhost:3000",
].filter((value): value is string => Boolean(value));

export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
    // Doctor accounts are created only through an admin invitation (/activation-medecin).
    disableSignUp: true,
    minPasswordLength: MIN_PASSWORD_LENGTH,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: async ({ user, url }) => {
      if (await isEmailDisabled(user.email)) return;
      await sendPasswordResetEmail({ to: user.email, resetUrl: url });
    },
  },
  user: {
    additionalFields: {
      role: { type: "string", input: false, required: false, defaultValue: "doctor" },
      disabledAt: { type: "date", input: false, required: false },
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const status = await getAccountStatus(session.userId);
          if (!status || status.disabled) {
            throw new APIError("FORBIDDEN", { message: "Ce compte médecin est désactivé.", code: "ACCOUNT_DISABLED" });
          }
        },
      },
    },
  },
  baseURL: originCandidates[0],
  trustedOrigins: [...new Set(originCandidates)],
  ...(process.env["NODE_ENV"] === "development"
    ? {
        advanced: {
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        },
      }
    : {}),
});
