import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import mongoose from "mongoose";
import { User } from "@/lib/models/User";

const MONGODB_URI = process.env.MONGODB_URI!;
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(MONGODB_URI);
  isConnected = true;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token }) {
      if (token.email) {
        try {
          await connectDB();
          let user = await User.findOne({ email: token.email });
          if (!user) {
            user = await User.create({ email: token.email, role: null });
          }
          token.role = user.role;
        } catch (err) {
          console.error("JWT role lookup failed:", err);
        }
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