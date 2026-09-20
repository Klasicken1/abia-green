import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Invite } from "@/lib/models/Invite";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token }) {
      if (!token.email) return token;

      try {
        await connectDB();
        let user = await User.findOne({ email: token.email });

        if (!user) {
          // First-ever sign-in for this email. Check for a pending invite
          // before falling back to the schema default ("citizen").
          const invite = await Invite.findOne({ email: token.email, usedAt: null });

          user = await User.create({
            email: token.email,
            ...(invite ? { role: invite.role } : {}),
          });

          if (invite) {
            invite.usedAt = new Date();
            await invite.save();
          }
        }

        token.role = user.role;
      } catch (err) {
        console.error("JWT role lookup failed:", err);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub as string;
        (session.user as { role?: string | null }).role =
          (token.role as string | null) ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
});