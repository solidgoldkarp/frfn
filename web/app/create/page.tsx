'use client';

import { redirect } from 'next/navigation';

export default function CreateMarketPage() {
  // Redirect to the new markets create page
  redirect('/markets/create');
}