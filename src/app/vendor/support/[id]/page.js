import React from 'react';

// components
import SupportThread from 'src/components/_vendor/support/thread';

export const metadata = {
  title: 'Assuredbay - Ticket detail'
};

// NOTE: if you're on Next.js 15+, `params` is a Promise and this needs to be
// `export default async function page({ params }) { const { id } = await params; ... }`
// — your existing vendor/layout.js already awaits things in an async layout,
// so check which convention the rest of your dynamic routes use and match it.
export default function page({ params }) {
  return <SupportThread ticketId={params.id} />;
}