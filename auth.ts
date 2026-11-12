/**
 * Auth.js (NextAuth v5) configuration.
 *
 * - Email + password (Credentials, scrypt hashes in User.passwordHash)
 * - Google (enabled only when AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET are set)
 * - JWT sessions (required for Credentials). Roles are put on the token at
 *   sign-in for the UI, but every protected page/action re-reads the role
 *   from the database (lib/session.ts) — the token is never trusted alone.
 */
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { uniqueUsername } from "@/lib/username";

export const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(200),
});

const providers: NextAuthConfig["providers"] = [
  Credentials({
    credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
    async authorize(raw) {
      const parsed = credentialsSchema.safeParse(raw);
      if (!parsed.success) return null;
      const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
      if (!user?.passwordHash) return null;
      if (!(await verifyPassword(parsed.data.password, user.passwordHash))) return null;
      return { id: user.id, email: user.email, name: user.name, image: user.image };
    },
  }),
];

if (googleEnabled) {
  providers.push(
    Google({
      // Lets someone who signed up with email/password later use Google with
      // the same verified address.
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  trustHost: true,
  pages: { signIn: "/sign-in", error: "/sign-in" },
  providers,
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On sign-in (and on explicit session.update()) refresh profile fields.
      if (user?.id || trigger === "update") {
        const id = (user?.id ?? token.sub) as string;
        const dbUser = await db.user.findUnique({
          where: { id },
          select: { id: true, role: true, username: true, name: true, image: true },
        });
        if (dbUser) {
          token.sub = dbUser.id;
          token.role = dbUser.role;
          token.username = dbUser.username;
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
        session.user.username = (token.username as string | null) ?? null;
      }
      return session;
    },
  },
  events: {
    // Google sign-ups get a public handle automatically.
    async createUser({ user }) {
      if (!user.id) return;
      const username = await uniqueUsername(user.name || user.email?.split("@")[0] || "creator");
      await db.user.update({ where: { id: user.id }, data: { username } });
    },
  },
});
