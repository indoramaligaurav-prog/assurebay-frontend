import * as React from 'react';
import Providers from 'src/providers';
import { GoogleTagManager, GoogleAnalytics } from '@next/third-parties/google';
import 'simplebar-react/dist/simplebar.min.css';
import { Inter } from 'next/font/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
// API services (direct fetch here or via service layer)
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const revalidate = 60; // ISR: Revalidate every 60 seconds

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export async function generateMetadata() {
  const res = await fetch(`${baseUrl}/api/settings/main`, {
    next: { revalidate: 60 }
  });

  const { data } = await res.json();

  const seo = data.seo || {};

  return {
    title: seo.metaTitle || data.businessName,
    description: seo.metaDescription || seo.description || '',
    keywords: Array.isArray(seo.tags) ? seo.tags.join(', ') : '',
    icons: {
      icon: data.favicon?.url
    },
    openGraph: {
      title: seo.metaTitle || data.businessName || '',
      description: seo.metaDescription || seo.description || '',
      url: data.domainName || '',
      siteName: data.businessName || '',
      type: 'website',
      images: [data.logoLight?.url || data.logoDark?.url || data.favicon?.url]
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.metaTitle || data.businessName || '',
      description: seo.metaDescription || seo.description || '',
      images: [data.logoLight?.url || data.logoDark?.url || data.favicon?.url]
    }
  };
}

export default async function RootLayout({ children }) {
  const mainRes = await fetch(`${baseUrl}/api/settings/main`, { next: { revalidate: 60 } });
  const brandingRes = await fetch(`${baseUrl}/api/settings/branding`, { next: { revalidate: 60 } });
  const { data: main } = await mainRes.json();
  const { data: branding } = await brandingRes.json();
  return (
    <html lang={'en'}>
      <body  className={inter.className}  data-new-gr-c-s-check-loaded="14.1251.0" data-gr-ext-installed="" style={{ backgroundColor: "#fcfbf7" }}>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <script src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js" async></script>
        <GoogleTagManager gtmId={main.gtmId} />
        <GoogleAnalytics gaId={main.gaId} />
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
        <Providers
          baseCurrency={main.baseCurrency}
          theme={branding.theme}
          cloudName={main.cloudName}
          preset={main.preset}
          shippingFee={main.shippingFee}
        >
          {children}
        </Providers>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
