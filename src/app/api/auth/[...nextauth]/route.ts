/**
 * NextAuth API Route Handler
 * 
 * This is the main NextAuth route that handles all authentication requests.
 * It uses the configuration from src/lib/auth/config.ts which includes:
 * - Credentials provider for email/password authentication
 * - JWT session strategy
 * - Custom callbacks for session and token management
 * 
 * Requirements: 2.1, 2.2
 */

import { handlers } from "@/lib/auth/auth";

export const { GET, POST } = handlers;
