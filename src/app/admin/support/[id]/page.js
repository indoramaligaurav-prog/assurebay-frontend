import React from 'react';

// components
import SupportThreadAdmin from 'src/components/_admin/support/thread';

export const metadata = {
  title: 'Assuredbay - Ticket detail'
};

// NOTE: same params-may-be-a-Promise caveat as the vendor [id] route —
// match whatever convention your other admin dynamic routes already use
// (e.g. app/admin/orders/[id]/page.js if it exists).
export default function page({ params }) {
  return <SupportThreadAdmin ticketId={params.id} />;
}