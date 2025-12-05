import { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

// Create Supabase client for authentication
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          // Query user from Supabase users table
          const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", credentials.email)
            .single();

          if (error || !user) {
            throw new Error("Invalid email or password");
          }

          // Check if account is disabled
          if (user.status === "disabled") {
            throw new Error("Your account has been disabled. Please contact support");
          }

          // Get password from Supabase Auth
          const { data: authUser } = await supabase.auth.admin.getUserById(
            user.id
          );

          if (!authUser?.user) {
            throw new Error("Invalid email or password");
          }

          // For now, we'll verify against Supabase Auth
          // In the next phase, we'll implement password hashing in the users table
          const { data: signInData, error: signInError } =
            await supabase.auth.signInWithPassword({
              email: credentials.email as string,
              password: credentials.password as string,
            });

          if (signInError || !signInData.user) {
            throw new Error("Invalid email or password");
          }

          // Return user object for session
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
          };
        } catch (error) {
          // Re-throw the error with a user-friendly message
          if (error instanceof Error) {
            throw error;
          }
          throw new Error("An error occurred during authentication");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  // Disable automatic redirects - we handle them in the LoginForm
  redirectProxyUrl: undefined,
  events: {
    async signIn({ user }) {
      // Log successful sign in
      console.log(`User signed in: ${user.email}`);
    },
    async signOut({ session }) {
      // Log sign out
      console.log(`User signed out: ${session?.user?.email}`);
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user info to token on sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role;
        token.status = (user as any).status;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user info to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If redirecting after sign in, use the role-based redirect from the client
      // This allows the LoginForm to handle the redirect based on user role
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // For relative URLs, return them as-is
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      return baseUrl;
    },
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtectedRoute = request.nextUrl.pathname.startsWith("/admin") ||
        request.nextUrl.pathname.startsWith("/agent") ||
        request.nextUrl.pathname.startsWith("/office") ||
        request.nextUrl.pathname.startsWith("/installer") ||
        request.nextUrl.pathname.startsWith("/customer");

      if (isOnProtectedRoute && !isLoggedIn) {
        return false;
      }

      return true;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
