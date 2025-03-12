'use client';

import { redirect } from 'next/navigation';

export default function CreateSimpleMarketRedirect() {
  // Redirect to the main markets create page
  redirect('/markets/create');
}