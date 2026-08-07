import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export const useCurrencyFormat = (mode = 'selected', customCurrency = '') => {
  const { currency, baseCurrency } = useSelector((state) => state.settings);
  const [formatter, setFormatter] = useState(null);
  const locale = 'en-US';

  useEffect(() => {
    let selectedCurrency;

    switch (mode) {
      case 'base':
        selectedCurrency = baseCurrency;
        break;
      case 'custom':
        selectedCurrency = customCurrency;
        break;
      case 'selected':
      default:
        selectedCurrency = currency;
        break;
    }

    if (selectedCurrency && locale) {
      setFormatter(
        new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: selectedCurrency
        })
      );
    }
  }, [currency, baseCurrency, locale, mode, customCurrency]);

  const formatCurrency = (number) => {
    if (!formatter) return number;
    return formatter.format(Number(number)).slice(0, -1);
  };

  return formatCurrency;
};
