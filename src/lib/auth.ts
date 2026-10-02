import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "~/server/db";
import { verifyPassword } from "~/server/password-hash";
import { authConfig, type UserRole } from "~/lib/auth.config";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@maharashtra.gov.in";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";
const INSTITUTE_EMAIL = process.env.INSTITUTE_EMAIL ?? "institute@pmkvy.gov.in";
const INSTITUTE_PASSWORD = process.env.INSTITUTE_PASSWORD ?? "institute123";
const EMPLOYER_EMAIL = process.env.EMPLOYER_EMAIL ?? "hr@company.com";

interface LoginFields {
  email?: unknown;
  password?: unknown;
  role?: unknown;
}

async function authorize(fields: LoginFields) {
  const email = typeof fields.email === "string" ? fields.email.trim().toLowerCase() : "";
  const password = typeof fields.password === "string" ? fields.password : "";
  const role = typeof fields.role === "string" ? fields.role : "";
  if (!email || !password) return null;

  if (role === "admin" || (!role && email === ADMIN_EMAIL.toLowerCase())) {
    if (email !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) return null;
    return { id: "admin-001", email: ADMIN_EMAIL, name: "Government Admin", role: "admin" as UserRole };
  }

  if (role === "institute" || (!role && email === INSTITUTE_EMAIL.toLowerCase())) {
    if (email !== INSTITUTE_EMAIL.toLowerCase() || password !== INSTITUTE_PASSWORD) return null;
    // Institute scoping (INST-01): the institute maps to ONE TrainingCenter,
    // resolved at sign-in from INSTITUTE_CENTER_CODE. Missing env or no
    // matching center → login fails (same DB-lookup pattern as the employer).
    const center = await db.trainingCenter.findUnique({
      where: { code: process.env.INSTITUTE_CENTER_CODE ?? "" },
    });
    if (!center) return null;
    return {
      id: "institute-001",
      email: INSTITUTE_EMAIL,
      name: "Training Institute",
      role: "institute" as UserRole,
      instituteCenterId: center.id,
    };
  }

  if (role === "employer" || (!role && email === EMPLOYER_EMAIL.toLowerCase())) {
    // Employer Track (F25): resolve via the Employers table — contactEmail is
    // the login identity, passwordHash uses the scrypt:<saltHex>:<hashHex>
    // format produced by hashPassword (~/server/password-hash).
    const employer = await db.employer.findUnique({ where: { contactEmail: email } });
    if (!employer) return null;
    if (!verifyPassword(password, employer.passwordHash)) return null;
    return {
      id: employer.id,
      email: employer.contactEmail,
      name: employer.companyName,
      role: "employer" as UserRole,
      employerId: employer.id,
    };
  }

  return null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role" },
      },
      authorize,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.instituteCenterId = user.instituteCenterId;
      }
      return token;
    },
  },
});
