import type { NextAuthOptions } from "next-auth";
import type { User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { supabase } from "@/lib/supabaseClient";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { email, password } = credentials;

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error || !data.user) {
          return null;
        }

        return { id: data.user.id, email: data.user.email } satisfies User;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user && "id" in user) {
        (token as JWT & { id?: string }).id = (user as User & { id: string }).id;
      }
      return token;
    },
    async session({ session, token }) {
      const id = (token as JWT & { id?: string }).id;
      if (session.user && id) {
        (session.user as User & { id: string }).id = id;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") {
        const { data } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (!data) {
          await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            plan: "free",
          });
        }
      }
    },
  },
};