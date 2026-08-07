export const currencyConfig = {
  IN: { symbol: "₹", currency: "INR" }, // India
  US: { symbol: "$", currency: "USD" }, // United States
  GB: { symbol: "£", currency: "GBP" }, // United Kingdom

  CA: { symbol: "$", currency: "CAD" }, // Canada
  AU: { symbol: "$", currency: "AUD" }, // Australia
  NZ: { symbol: "$", currency: "NZD" }, // New Zealand
  SG: { symbol: "$", currency: "SGD" }, // Singapore
  HK: { symbol: "$", currency: "HKD" }, // Hong Kong

  AE: { symbol: "د.إ", currency: "AED" }, // UAE
  SA: { symbol: "﷼", currency: "SAR" }, // Saudi Arabia
  QA: { symbol: "﷼", currency: "QAR" }, // Qatar
  KW: { symbol: "د.ك", currency: "KWD" }, // Kuwait
  BH: { symbol: ".د.ب", currency: "BHD" }, // Bahrain
  OM: { symbol: "﷼", currency: "OMR" }, // Oman

  DE: { symbol: "€", currency: "EUR" }, // Germany
  FR: { symbol: "€", currency: "EUR" }, // France
  IT: { symbol: "€", currency: "EUR" }, // Italy
  ES: { symbol: "€", currency: "EUR" }, // Spain
  NL: { symbol: "€", currency: "EUR" }, // Netherlands
  BE: { symbol: "€", currency: "EUR" }, // Belgium
  AT: { symbol: "€", currency: "EUR" }, // Austria
  IE: { symbol: "€", currency: "EUR" }, // Ireland
  PT: { symbol: "€", currency: "EUR" }, // Portugal
  FI: { symbol: "€", currency: "EUR" }, // Finland
  GR: { symbol: "€", currency: "EUR" }, // Greece

  CH: { symbol: "CHF", currency: "CHF" }, // Switzerland
  SE: { symbol: "kr", currency: "SEK" }, // Sweden
  NO: { symbol: "kr", currency: "NOK" }, // Norway
  DK: { symbol: "kr", currency: "DKK" }, // Denmark

  JP: { symbol: "¥", currency: "JPY" }, // Japan
  CN: { symbol: "¥", currency: "CNY" }, // China
  KR: { symbol: "₩", currency: "KRW" }, // South Korea
  TW: { symbol: "NT$", currency: "TWD" }, // Taiwan

  TH: { symbol: "฿", currency: "THB" }, // Thailand
  MY: { symbol: "RM", currency: "MYR" }, // Malaysia
  ID: { symbol: "Rp", currency: "IDR" }, // Indonesia
  PH: { symbol: "₱", currency: "PHP" }, // Philippines
  VN: { symbol: "₫", currency: "VND" }, // Vietnam

  PK: { symbol: "₨", currency: "PKR" }, // Pakistan
  BD: { symbol: "৳", currency: "BDT" }, // Bangladesh
  LK: { symbol: "Rs", currency: "LKR" }, // Sri Lanka
  NP: { symbol: "₨", currency: "NPR" }, // Nepal

  BR: { symbol: "R$", currency: "BRL" }, // Brazil
  MX: { symbol: "$", currency: "MXN" }, // Mexico
  AR: { symbol: "$", currency: "ARS" }, // Argentina
  CL: { symbol: "$", currency: "CLP" }, // Chile
  CO: { symbol: "$", currency: "COP" }, // Colombia
  PE: { symbol: "S/", currency: "PEN" }, // Peru

  ZA: { symbol: "R", currency: "ZAR" }, // South Africa
  NG: { symbol: "₦", currency: "NGN" }, // Nigeria
  EG: { symbol: "E£", currency: "EGP" }, // Egypt
  KE: { symbol: "KSh", currency: "KES" }, // Kenya

  RU: { symbol: "₽", currency: "RUB" }, // Russia
  TR: { symbol: "₺", currency: "TRY" }, // Turkey
  IL: { symbol: "₪", currency: "ILS" }, // Israel
  UA: { symbol: "₴", currency: "UAH" }, // Ukraine
  PL: { symbol: "zł", currency: "PLN" }, // Poland
  CZ: { symbol: "Kč", currency: "CZK" }, // Czech Republic
  HU: { symbol: "Ft", currency: "HUF" }, // Hungary
  RO: { symbol: "lei", currency: "RON" }, // Romania
};

export const currencies = Object.entries(currencyConfig).map(
  ([code, value]) => ({
    code,
    ...value
  })
);