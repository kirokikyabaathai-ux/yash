/**
 * Agent Root Page
 * Redirects to agent dashboard
 */

import { redirect } from 'next/navigation';

export default function AgentPage() {
  redirect('/agent/dashboard');
}
