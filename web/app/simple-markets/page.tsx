'use client';

import { redirect } from 'next/navigation';

export default function SimpleMarketsPage() {
  // Redirect to the main markets page
  redirect('/markets');
}