import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/fa/auth/login",
    error: "/fa/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const identifier = credentials?.identifier?.trim();
        if (!identifier || !credentials?.password) return null;

        const isPhone = /^09\d{9}$/.test(identifier);

        const user = isPhone
          ? await db.user.findUnique({
              where: { phone: identifier },
              include: { teamMember: { select: { id: true, status: true } } },
            })
          : await db.user.findUnique({
              where: { email: identifier },
              include: { teamMember: { select: { id: true, status: true } } },
            });

        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          teamMemberId: user.teamMember?.id ?? null,
          teamMemberStatus: user.teamMember?.status ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.teamMemberId = (user as any).teamMemberId;
        token.teamMemberStatus = (user as any).teamMemberStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).teamMemberId = token.teamMemberId;
        (session.user as any).teamMemberStatus = token.teamMemberStatus;
      }
      return session;
    },
  },
};
