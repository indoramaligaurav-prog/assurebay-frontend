import React from 'react';

// Components
import AttributesList from '@/components/_admin/attributes/attributes-list';

// Meta information
export const metadata = {
  title: 'Attributes - Assuredbay',
  applicationName: 'Assuredbay',
  authors: 'Assuredbay'
};

export default function Attributes() {
  return <AttributesList />;
}
