'use client';

import { redirect } from 'next/navigation';

export default function SimpleMarketsRedirect() {
  // Redirect to the main markets page
  redirect('/markets');
}