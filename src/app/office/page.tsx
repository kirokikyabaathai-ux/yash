/**
 * Office Root Page
 * Redirects to office dashboard
 */

import { redirect } from 'next/navigation';

export default function OfficePage() {
  redirect('/office/dashboard');
}
