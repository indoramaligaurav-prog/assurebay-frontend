import { sum, map, filter, uniqBy } from 'lodash';
import { createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const initialState = {
  checkout: {
    activeStep: 0,
    cart: [],
    subtotal: 0,
    total: 0,
    discount: 0,
    shipping: 0,
    billing: null
  }
};

const slice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    // CHECKOUT
    getCart(state, action) {
  const cart = action.payload.cart;

  const subtotal = sum(
    cart.map((item) => {
      const base = (item.salePrice || item.price) * item.quantity;
      return base + (item.shipping || 0);
    })
  );

  state.checkout.cart = cart;
  state.checkout.subtotal = subtotal;
  state.checkout.total = subtotal;
},

    addCart(state, action) {
  const product = action.payload;

  const isQuoted = product.isQuoted === true;

  // 🔒 Quoted product: NEVER merge
  if (isQuoted) {
    const alreadyExists = state.checkout.cart.find(
      (item) => item.sku === product.sku && item.isQuoted
    );

    if (!alreadyExists) {
      state.checkout.cart.push(product);
    }

    return;
  }

  // 🟢 Normal product logic (UNCHANGED BEHAVIOR)
  const existingProduct = state.checkout.cart.find(
    (item) => item.sku === product.sku && !item.isQuoted
  );

  if (existingProduct) {
    existingProduct.quantity += product.quantity;
  } else {
    state.checkout.cart.push(product);
  }
}
,

    clearCart(state, action) {
      const updateCart = filter(state.checkout.cart, (item) => item.sku !== action.payload);

      state.checkout.cart = updateCart;
    },
    deleteCart(state, action) {
      const updateCart = filter(state.checkout.cart, (item) => item.sku !== action.payload);

      state.checkout.cart = updateCart;
    },

    resetCart(state) {
      state.checkout.activeStep = 0;
      state.checkout.cart = [];
      state.checkout.total = 0;
      state.checkout.subtotal = 0;
      state.checkout.discount = 0;
      state.checkout.billing = null;
    },

    increaseQuantity(state, action) {
  const productSku = action.payload;

  state.checkout.cart = map(state.checkout.cart, (product) => {
    if (product.sku === productSku) {
      if (product.isQuoted) {
        return product; // 🔒 LOCKED
      }
      return {
        ...product,
        quantity: product.quantity + 1
      };
    }
    return product;
  });
},

    decreaseQuantity(state, action) {
  const productSku = action.payload;

  state.checkout.cart = map(state.checkout.cart, (product) => {
    if (product.sku === productSku) {
      if (product.isQuoted) {
        return product; // 🔒 LOCKED
      }

      return {
        ...product,
        quantity: product.quantity - 1
      };
    }
    return product;
  });
}
,

    createBilling(state, action) {
      state.checkout.billing = action.payload;
    },
    setShippingFee(state, action) {
      state.checkout.shipping = action.payload;
    },
    applyDiscount(state, action) {
      const discount = action.payload;
      state.checkout.discount = discount;
      state.checkout.total = state.checkout.subtotal - discount;
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const {
  getCart,
  addCart,
  resetCart,
  setShippingFee,
  onGotoStep,
  onBackStep,
  onNextStep,
  clearCart,
  deleteCart,
  createBilling,
  applyDiscount,
  increaseQuantity,
  decreaseQuantity
} = slice.actions;
