import React from 'react';

// Components
import CurrencyList from '@/components/_admin/currencies/currency-list';

// Meta information
export const metadata = {
  title: 'Currencies - Assuredbay',
  applicationName: 'Assuredbay',
  authors: 'Assuredbay'
};
export default function Currencies() {
  return <CurrencyList />;
}
