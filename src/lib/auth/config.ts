import { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client for authentication - lazy initialization
function getSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export const authConfig: NextAuthConfig = {
  trustHost: true, // Required for NextAuth v5 in production
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
          const supabase = getSupabaseClient();
          
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

          // Verify against Supabase Auth using signInWithPassword
          const { data: signInData, error: signInError } =
            await supabase.auth.signInWithPassword({
              email: credentials.email as string,
              password: credentials.password as string,
            });

          if (signInError || !signInData.user) {
            throw new Error("Invalid email or password");
          }

          // Return user object for session with Supabase tokens
          const userSession = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            supabaseAccessToken: signInData.session?.access_token,
            supabaseRefreshToken: signInData.session?.refresh_token,
          };

          console.log('User session created:', {
            id: userSession.id,
            email: userSession.email,
            name: userSession.name,
            role: userSession.role,
            status: userSession.status,
            hasAccessToken: userSession.supabaseAccessToken,
            hasRefreshToken: userSession.supabaseRefreshToken,
          });

          return userSession;
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
    async signOut() {
      // Clear Supabase session on sign out
      try {
        const supabase = getSupabaseClient();
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Error signing out from Supabase:', error);
      }
      console.log('User signed out');
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Add user info to token on sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role;
        token.status = (user as any).status;
        
        // Store Supabase tokens from the authorize function
        if ((user as any).supabaseAccessToken) {
          token.supabaseAccessToken = (user as any).supabaseAccessToken;
          token.supabaseRefreshToken = (user as any).supabaseRefreshToken;
        }
      }
      
      // Refresh Supabase token if needed (every hour)
      if (token.supabaseRefreshToken) {
        const tokenAge = Date.now() - (token.iat || 0) * 1000;
        // Refresh if token is older than 50 minutes (before 1 hour expiry)
        if (tokenAge > 50 * 60 * 1000) {
          try {
            const supabase = getSupabaseClient();
            const { data, error } = await supabase.auth.refreshSession({
              refresh_token: token.supabaseRefreshToken as string,
            });
            if (data.session) {
              token.supabaseAccessToken = data.session.access_token;
              token.supabaseRefreshToken = data.session.refresh_token;
            }
          } catch (error) {
            console.error('Failed to refresh Supabase session:', error);
          }
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      // Add user info to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
        
        // Pass Supabase tokens to session (for client-side Supabase client)
        (session as any).supabaseAccessToken = token.supabaseAccessToken;
        (session as any).supabaseRefreshToken = token.supabaseRefreshToken;
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
  secret: process.env.AUTH_SECRET,
};
