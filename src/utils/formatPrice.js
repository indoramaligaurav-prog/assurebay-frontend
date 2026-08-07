import * as api from 'src/services';

export const formatPrice = async ({ amount = 0, vendorId = null, userId = null , currency = null} = {}) => {

  if (typeof amount !== 'number' || amount <= 0) {
    return 'Price on Request';
  }

  if (!vendorId) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  try {
    const response = await api.pricingconvert({
      amount,
      vendorId,
      userId,
      currency
    });

    const data = response?.data;


    if (!data || typeof data.amount !== 'number') {
      return 'Price on Request';
    }

    return new Intl.NumberFormat(
      data.currency === 'INR' ? 'en-IN' : 'en-US',
      {
        style: 'currency',
        currency: data.currency || 'USD',
      }
    ).format(data.amount);

  } catch (err) {
    console.error('Price conversion failed:', err);
    return 'Price on Request';
  }
};
