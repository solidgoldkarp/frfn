'use client';

import { redirect } from 'next/navigation';

export default function SimpleManageMarketsRedirect() {
  // Redirect to the main markets manage page
  redirect('/markets/manage');
}