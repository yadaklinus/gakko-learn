// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {prisma} from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        

        if (!user || !user.password) {
          return null;
        }

        

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          currentRole: user.currentRole,
        };
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name: `next-auth.academia-tauri`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false, // Changed for local Tauri environment
      },
    },
  },
  callbacks: {
    async jwt({ token, user,trigger,session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.currentRole = user.currentRole;
      }
      if(trigger == "update" && session){
        token.currentRole = session.currentRole,
        token.role = session.role
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.currentRole = token.currentRole as string;
      }
      return session;
    },
  },
};