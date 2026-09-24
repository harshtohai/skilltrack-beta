import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "~/server/db";
import { authConfig, type UserRole } from "~/lib/auth.config";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@maharashtra.gov.in";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";
const INSTITUTE_EMAIL = process.env.INSTITUTE_EMAIL ?? "institute@pmkvy.gov.in";
const INSTITUTE_PASSWORD = process.env.INSTITUTE_PASSWORD ?? "institute123";
const EMPLOYER_EMAIL = process.env.EMPLOYER_EMAIL ?? "hr@company.com";
const EMPLOYER_PASSWORD = process.env.EMPLOYER_PASSWORD ?? "employer123";

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
    return {
      id: "institute-001",
      email: INSTITUTE_EMAIL,
      name: "Training Institute",
      role: "institute" as UserRole,
    };
  }

  if (role === "employer" || (!role && email === EMPLOYER_EMAIL.toLowerCase())) {
    if (email === EMPLOYER_EMAIL.toLowerCase()) {
      if (password !== EMPLOYER_PASSWORD) return null;
      return {
        id: "employer-demo",
        email: EMPLOYER_EMAIL,
        name: "Demo Employer",
        role: "employer" as UserRole,
        employerId: "employer-demo",
      };
    }

    // Real employers: match a pending verification request by email local-part
    const verificationRequest = await db.verificationRequest.findFirst({
      where: {
        employmentClaim: {
          employerName: { contains: email.split("@")[0], mode: "insensitive" },
        },
      },
      include: { employmentClaim: true },
    });
    if (!verificationRequest?.employmentClaim) return null;
    return {
      id: `employer-${verificationRequest.employmentClaimId}`,
      email: email,
      name: verificationRequest.employmentClaim.employerName ?? "Employer",
      role: "employer" as UserRole,
      employerId: verificationRequest.employmentClaimId,
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
      }
      return token;
    },
  },
});
