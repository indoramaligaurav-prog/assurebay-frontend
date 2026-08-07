import { useMemo } from 'react';
import { QUOTE_MESSAGE_TYPE } from '@/constants/quoteMessageTypes';

export function useUserQuoteChatFlow(activeChat, chatMessages) {
  const pricingMode = activeChat?.product?.pricingMode;
  const policyType = activeChat?.product?.shipping_policy?.policy_type;

  const priceOffer = chatMessages.find(
    m => m.messageType === QUOTE_MESSAGE_TYPE.PRICE_OFFER
  );

  const shippingOffer = chatMessages.find(
    m => m.messageType === QUOTE_MESSAGE_TYPE.SHIPPING_OFFER
  );

  const priceAccepted = chatMessages.some(
    m => m.messageType === QUOTE_MESSAGE_TYPE.PRICE_ACCEPTED
  );

  const isFreight = policyType === 'FREIGHT';

  return useMemo(() => ({
    pricingMode,
    policyType,
    isFreight,

    priceOffer,
    shippingOffer,
    priceAccepted,

    /* ---------------- UI STATES ---------------- */

    // Accept price only once & only in quote mode
    canAcceptPrice:
      pricingMode === 'quote' &&
      !!priceOffer &&
      !priceAccepted,

    // Ask shipping:
    // - declare + freight (direct)
    // - quote + freight (after price accepted)
    canAskShipping:
      isFreight &&
      (
        pricingMode === 'declare' ||
        (pricingMode === 'quote' && priceAccepted)
      ) &&
      !shippingOffer,

    // Add to cart conditions
    canAddToCart:
      (pricingMode === 'quote' && !isFreight && priceAccepted) ||
      (pricingMode === 'declare' && !isFreight) ||
      (pricingMode === 'quote' && isFreight && priceAccepted && !!shippingOffer)
  }), [pricingMode, policyType, chatMessages]);
}
