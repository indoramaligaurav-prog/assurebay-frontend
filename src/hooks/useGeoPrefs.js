'use client';

/**
 * useGeoPrefs
 *
 * On first visit (no saved prefs) → calls ipapi.co to detect country,
 * maps it to a sensible default currency, saves to localStorage, and
 * returns the resolved prefs.
 *
 * On subsequent visits → reads localStorage and returns immediately
 * (no network call).
 *
 * Usage:
 *   const { prefs, loading } = useGeoPrefs(countries);
 *   // prefs = { country: { code, label, phone }, currency: 'INR' }
 */

import { useState, useEffect } from 'react';

export const PREF_KEY = 'shipping_currency_prefs';

// ── country-code → currency-code map (most common cases) ─────────────────────
const COUNTRY_CURRENCY_MAP = {
  US: 'USD', CA: 'CAD', AU: 'AUD', NZ: 'NZD', SG: 'SGD',
  GB: 'GBP', IE: 'EUR', DE: 'EUR', FR: 'EUR', IT: 'EUR',
  ES: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR', PT: 'EUR',
  FI: 'EUR', GR: 'EUR', SK: 'EUR', SI: 'EUR', EE: 'EUR',
  LV: 'EUR', LT: 'EUR', LU: 'EUR', MT: 'EUR', CY: 'EUR',
  IN: 'INR', AE: 'AED', SA: 'SAR', JP: 'JPY', CN: 'CNY',
  HK: 'HKD', KR: 'KRW', TH: 'THB', MY: 'MYR', ID: 'IDR',
  PH: 'PHP', VN: 'VND', PK: 'PKR', BD: 'BDT', LK: 'LKR',
  QA: 'QAR', KW: 'KWD', BH: 'BHD', OM: 'OMR', EG: 'EGP',
  ZA: 'ZAR', NG: 'NGN', KE: 'KES', GH: 'GHS', TZ: 'TZS',
  MX: 'MXN', BR: 'BRL', AR: 'ARS', CO: 'COP', CL: 'CLP',
  CH: 'CHF', NO: 'NOK', SE: 'SEK', DK: 'DKK', PL: 'PLN',
  CZ: 'CZK', HU: 'HUF', RO: 'RON', TR: 'TRY', RU: 'RUB',
  IL: 'ILS', TW: 'TWD', MO: 'MOP',
};

export function useGeoPrefs(countries = []) {
  const [prefs, setPrefs] = useState(null);   // null = not yet resolved
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!countries.length) return;

    // ── 1. Try saved prefs first ──────────────────────────────────────────────
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        // Hydrate the country object from our canonical countries list
        // (guards against stale / partial saves)
        const country = saved.country?.code
          ? countries.find((c) => c.code === saved.country.code) ?? null
          : null;
        setPrefs({ country, currency: saved.currency || 'USD' });
        setLoading(false);
        return;
      }
    } catch (_) {}

    // ── 2. No saved prefs → detect via IP ────────────────────────────────────
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
        if (!res.ok) throw new Error('geo fetch failed');
        const geo = await res.json();

        if (cancelled) return;

        const countryCode = geo.country_code;   // e.g. "IN"
        const country =
          countries.find((c) => c.code === countryCode) ?? null;
        const currency =
          COUNTRY_CURRENCY_MAP[countryCode] || geo.currency || 'USD';

        const detected = { country, currency };

        // Persist so next load is instant
        try {
          localStorage.setItem(PREF_KEY, JSON.stringify(detected));
        } catch (_) {}

        setPrefs(detected);
      } catch (_) {
        // Geo failed → sensible global fallback
        if (!cancelled) setPrefs({ country: null, currency: 'USD' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [countries]);

  // Exposed updater so Navbar can write new prefs after dialog save
  const savePrefs = (newPrefs) => {
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify(newPrefs));
    } catch (_) {}
    setPrefs(newPrefs);
  };

  return { prefs, loading, savePrefs };
}