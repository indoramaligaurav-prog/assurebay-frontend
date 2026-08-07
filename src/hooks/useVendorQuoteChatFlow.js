import { useMemo } from 'react';

export function useVendorQuoteChatFlow(activeChat, chatMessages, shippingPolicy) {
  const pricingMode = activeChat?.product?.pricingMode;
  const policyType = shippingPolicy?.policy_type;

  const priceOffered = chatMessages.some(
    m => m.messageType === 'PRICE_OFFER'
  );

  const shippingRequested = chatMessages.some(
    m => m.messageType === 'SHIPPING_REQUEST'
  );

  const priceAccepted = chatMessages.some(
    m => m.messageType === 'PRICE_ACCEPTED'
  );

  const isFreight = policyType === 'FREIGHT';

  return useMemo(() => ({
    pricingMode,
    policyType,
    isFreight,

    priceOffered,
    shippingRequested,
    priceAccepted,

    canOfferPrice:
      pricingMode === 'quote' && !priceOffered,

    canOfferShipping:
      isFreight &&
      (
        pricingMode === 'declare' ||
        (pricingMode === 'quote' && priceAccepted)
      ) &&
      shippingRequested
  }), [pricingMode, policyType, chatMessages]);
}
