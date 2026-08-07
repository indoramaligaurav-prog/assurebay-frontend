import React from 'react';
import { Container } from '@mui/material';

// components
import SupportThread from 'src/components/_main/support/thread';

export const metadata = {
  title: 'Ticket detail | Assuredbay'
};

// NOTE: same params-may-be-a-Promise caveat as the vendor/admin [id] routes —
// match whichever convention your other dynamic (user) routes use, e.g.
// app/(user)/order/[oid]/page.js already does `const params = await props.params;`
// — this route almost certainly needs the same async treatment.
export default async function page(props) {
  const params = await props.params;
  return <SupportThread ticketId={params.id} />;
}