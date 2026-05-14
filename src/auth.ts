import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const ALLOWED_EMAILS = (process.env.DIRECTOR_ALLOWED_EMAILS ?? "tom.colgan@fabrick.agency")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email?.toLowerCase();
      if (!email) return false;
      return ALLOWED_EMAILS.includes(email);
    },
    async session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: "/director/login",
  },
});
