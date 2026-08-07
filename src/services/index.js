import http from './http';
import axios from 'axios';
export const signUp = async (payload) => {
  const { data } = await http.post(`/auth/sign-up`, payload);
  return data;
};
export const verifyOTP = async (payload) => {
  const { data } = await http.post(`/auth/verify-otp`, payload);
  return data;
};
export const resendOTP = async (payload) => {
  const { data } = await http.post(`/auth/resend-otp`, payload);
  return data;
};

export const signIn = async (payload) => {
  const { data } = await http.post(`/auth/sign-in`, payload);
  return data;
};

export const forgetPassword = async (payload) => {
  const { data } = await http.post('/auth/forget-password', payload);
  return data;
};

export const resetPassword = async ({ newPassword, token }) => {
  const { data } = await http.post('/auth/reset-password', {
    newPassword: newPassword,
    token: token
  });
  return data;
};

export const adminDashboardAnalytics = async () => {
  const { data } = await http.get(`/admin/dashboard-analytics`);
  return data;
};
export const getNotifications = async (page) => {
  const { data } = await http.get(`/admin/notifications?limit=${page}`, {});
  return data;
};

export const getBrandsByAdmin = async (page, search, status) => {
  const { data } = await http.get(`/admin/brands`, {
    params: {
      page,
      search,
      ...(status && { status })
    }
  });
  return data;
};
export const getBrandByAdmin = async (id) => {
  const { data } = await http.get(`/admin/brands/${id}`);
  return data;
};
export const getAllBrandsByAdmin = async () => {
  const { data } = await http.get(`/admin/all-brands`);
  return data;
};
export const addBrandByAdmin = async (payload) => {
  const { data } = await http.post('/admin/brands', payload, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

export const updateBrandByAdmin = async (slug, payload) => {
  const { data } = await http.put(`/admin/brands/${slug}`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

export const deleteBrandByAdmin = async (slug) => {
  const { data } = await http.delete(`/admin/brands/${slug}`);
  return data;
};

export const getCategoriesByAdmin = async (page, search, status) => {
  const { data } = await http.get(`/admin/categories`, {
    params: { search, page, status }
  });
  return data;
};

export const getCategoryByAdmin = async (slug) => {
  const { data } = await http.get(`/admin/categories/${slug}`);
  return data;
};
export const deleteCategoryByAdmin = async (slug) => {
  const { data } = await http.delete(`/admin/categories/${slug}`);
  return data;
};
export const addCategoryByAdmin = async (payload) => {
  const { data } = await http.post(`/admin/categories`, payload);
  return data;
};
export const updateCategoryByAdmin = async ({ currentSlug, ...payload }) => {
  const { data } = await http.put(`/admin/categories/${currentSlug}`, payload);
  return data;
};
export const getAllCategoriesByAdmin = async () => {
  const { data } = await http.get(`/admin/all-categories`);
  return data;
};
// sub categories
export const getSubCategoryByAdmin = async (slug) => {
  const { data } = await http.get(`/admin/sub-categories/${slug}`);
  return data;
};
export const getSubCategoriesByAdmin = async (params) => {
  const { data } = await http.get(`/admin/sub-categories?${params}`);
  return data;
};
export const deleteSubCategoryByAdmin = async (slug) => {
  const { data } = await http.delete(`/admin/sub-categories/${slug}`);
  return data;
};
export const addSubCategoryByAdmin = async (payload) => {
  const { data } = await http.post(`/admin/sub-categories`, payload);
  return data;
};
export const updateSubCategoryByAdmin = async ({ currentSlug, ...payload }) => {
  const { data } = await http.put(`/admin/sub-categories/${currentSlug}`, payload);
  return data;
};
// child categories

export const getChildCategoryByAdmin = async (slug) => {
  const { data } = await http.get(`/admin/child-categories/${slug}`);
  return data;
};
export const getChildCategoriesByAdmin = async (params) => {
  const { data } = await http.get(`/admin/child-categories?${params}`);
  return data;
};
export const deleteChildCategoryByAdmin = async (slug) => {
  const { data } = await http.delete(`/admin/child-categories/${slug}`);
  return data;
};
export const addChildCategoryByAdmin = async (payload) => {
  const { data } = await http.post(`/admin/child-categories`, payload);
  return data;
};
export const updateChildCategoryByAdmin = async ({ currentSlug, ...payload }) => {
  const { data } = await http.put(`/admin/child-categories/${currentSlug}`, payload);
  return data;
};
export const getProductsByAdmin = async (params) => {
  const { data: response } = await http.get(`/admin/products?${params}`);
  return response;
};
export const createProductByAdmin = async (payload) => {
  const { data: response } = await http.post(`/admin/products`, payload);
  return response;
};
export const updateProductByAdmin = async ({ currentSlug, ...payload }) => {
  const { data: response } = await http.put(`/admin/products/${currentSlug}`, payload);
  return response;
};

export const deleteProductByAdmin = async (slug) => {
  const { data: response } = await http.delete(`/admin/products/${slug}`);
  return response;
};

export const getOrdersByAdmin = async (payload) => {
  const { data } = await http.get(`/admin/orders?${payload}`);
  return data;
};
export const getOrderByAdmin = async (id) => {
  const { data } = await http.get(`/admin/orders/${id}`);
  return data;
};
export const deleteOrderByAdmin = async (id) => {
  const { data } = await http.delete(`/admin/orders/${id}`);
  return data;
};
export const updateOrderStatus = async ({ id, ...payload }) => {
  const { data } = await http.put(`/admin/orders/${id}`, payload);
  return data;
};
export const createCourierInfo = async (payload) => {
  const { data } = await http.post(`/vendor/courier-info`, payload);
  return data;
};
export const updateCourierInfo = async ({ _id, ...payload }) => {
  const { data } = await http.put(`/vendor/courier-info/${_id}`, payload);

  return data;
};
export const updateOrderStatusByVendor = async ({ _id, ...payload }) => {
  const { data } = await http.put(`/vendor/orders/${_id}`, payload);
  return data;
};
export const getUserByAdminsByAdmin = async (page, search) => {
  const { data: response } = await http.get(`/admin/users?search=${search}&page=${page}`);
  return response;
};
export const getUserByAdmin = async (id) => {
  const { data: response } = await http.get(`/admin/users/${id}`);
  return response;
};
export const updateUserRoleByAdmin = async (id) => {
  const { data: response } = await http.post(`/admin/users/role/${id}`);
  return response;
};

export const getCouponCodesByAdmin = async (page, search) => {
  const { data: response } = await http.get(`/admin/coupon-codes?search=${search}&page=${page}`);
  return response;
};

export const getCouponCodeByAdmin = async (id) => {
  const { data: response } = await http.get(`/admin/coupon-codes/${id}`);
  return response;
};

export const addCouponCodeByAdmin = async (payload) => {
  const { data: response } = await http.post(`/admin/coupon-codes`, payload);
  return response;
};
export const updateCouponCodeByAdmin = async ({ currentId, ...others }) => {
  const { data: response } = await http.put(`/admin/coupon-codes/${currentId}`, others);
  return response;
};
export const deleteCouponCodeByAdmin = async (id) => {
  const { data: response } = await http.delete(`/admin/coupon-codes/${id}`);
  return response;
};

export const getNewsletter = async (page) => {
  const { data } = await http.get(`/admin/newsletter?page=${page}`);
  return data;
};
export const getShopDetailsByAdmin = async (slug) => {
  const { data } = await http.get(`/admin/shops/${slug}`);
  return data;
};

export const updateShopStatus = async (slug, status) => {
  const { data } = await http.put(`/admin/shops/${slug}/status`, { status });
  return data;
};

export const updateShopFlags = async (slug, flags) => {
  const { data } = await http.patch(`/admin/shops/${slug}/flags`, flags);
  return data;
};

export const addAdminShopByAdmin = async (payload) => {
  const { data } = await http.post(`/admin/shops`, payload);
  return data;
};
export const updateShopByAdmin = async ({ currentSlug, ...payload }) => {
  const { data } = await http.put(`/admin/shops/${currentSlug}`, payload);
  return data;
};
export const deleteShop = async (slug) => {
  const { data: response } = await http.delete(`/admin/shops/${slug}`);
  return response;
};
export const getLowStockProductsByAdmin = async (page) => {
  const { data: response } = await http.get(`/admin/low-stock-products?page=${page}`);
  return response;
};
export const getShopsByAdmin = async (page, search ,status) => {
   const { data: response } = await http.get('/admin/shops', {
    params: { page, search, ...(status && { status }) }
  });
  return response;
};
export const getShopIncomeByAdmin = async (slug, page) => {
  const { data } = await http.get(`/admin/shops/${slug}/income?page=${page || 1}`);

  return data;
};
export const getIncomeDetailsByAdmin = async (pid, page) => {
  const { data } = await http.get(`/admin/payments/${pid}?page=${page || 1}`);
  return data;
};
export const editPaymentByAdmin = async ({ pid, ...payload }) => {
  const { data } = await http.put(`/admin/payments/${pid}`, { ...payload });
  return data;
};
export const createPaymentByAdmin = async ({ ...payload }) => {
  const { data } = await http.post(`/admin/payments`, { ...payload });
  return data;
};
export const getPayoutsByAdmin = async (params) => {
  const { data } = await http.get(`/admin/payouts?${params}`);
  return data;
};
export const getAllShopsByAdmin = async () => {
  const { data } = await http.get(`/admin/all-shops`);
  return data;
};
export const getCurrenciesByAdmin = async (page, search) => {
  const { data } = await http.get(`/admin/currencies?page=${page || 1}&search=${search || ''}`);
  return data;
};
export const addCurrencyByAdmin = async (payload) => {
  const { data } = await http.post(`/admin/currencies`, payload);
  return data;
};
export const deleteCurrencyByAdmin = async (id) => {
  const { data } = await http.delete(`/admin/currencies/${id}`);
  return data;
};
export const updateCurrencyByAdmin = async ({ _id, ...others }) => {
  const { data } = await http.put(`/admin/currencies/${_id}`, others);
  return data;
};
export const getCurrencyByAdmin = async (cid) => {
  const { data } = await http.get(`/admin/currencies/${cid}`);
  return data;
};

export const getVendorProductBySlug = async (slug) => {
  const { data } = await http.get(`/vendor/products/${slug}`);
  return data;
};
export const getVendorShop = async () => {
  const { data } = await http.get(`/vendor/shop`);
  return data;
};
export const vendorDashboardAnalytics = async () => {
  const { data } = await http.get(`/vendor/dashboard-analytics`);
  return data;
};
export const getVendorLowStockProducts = async (page) => {
  const { data: response } = await http.get(`/vendor/low-stock-products?page=${page}`);
  return response;
};

export const getProductsByVendor = async (params) => {
  const { data: response } = await http.get(`/vendor/products?${params}`);
  return response;
};

export const deleteVendorProduct = async (slug) => {
  const { data: response } = await http.delete(`/vendor/products/${slug}`);
  return response;
};
export const createVendorProduct = async (payload) => {
  const { data: response } = await http.post(`/vendor/products`, payload);
  return response;
};
export const updateVendorProduct = async ({ currentSlug, ...payload }) => {
  const { data: response } = await http.put(`/vendor/products/${currentSlug}`, payload);
  return response;
};
export const getOrdersByVendor = async ({ status, search, searchBy, page, limit } = {}) => {
  const params = new URLSearchParams({
    status:   status   || 'pending',
    search:   search   || '',
    searchBy: searchBy || 'buyer',
    page:     page     || 1,
    limit:    limit    || 10,
  });
  const { data } = await http.get(`/vendor/orders?${params.toString()}`);
  return data;
};
export const getOrderByVendor = async (id) => {
  const { data } = await http.get(`/vendor/orders/${id}`);
  return data;
};
export const addShopByVendor = async (payload) => {
  const { data } = await http.post(`/vendor/shops`, payload);
  return data;
};
export const updateShopByVendor = async ({ currentSlug, ...payload }) => {
  const { data } = await http.put(`/vendor/shops/${currentSlug}`, payload);
  return data;
};
export const getShopDetailsByVendor = async () => {
  const { data } = await http.get(`/vendor/shop/stats`);
  return data;
};
export const getIncomeByVendor = async (slug, page) => {
  const { data } = await http.get(`/vendor/shops/income?page=${page || 1}`);
  return data;
};

export const getProducts = async (query = '') => {
  const { data } = await http.get(`/products${query}`);
  return data;
};
export const getProductDetails = async (pid) => {
  const { data } = await http.get(`/products/${pid}`);
  return data;
};

export const getProductSlugs = async () => {
  const { data } = await http.get(`/products-slugs`);
  return data;
};

export const getAllProducts = async () => {
  const { data } = await http.get(`/products/all`);
  return data;
};
export const getAllFilters = async () => {
  const { data } = await http.get(`/products/filters`);
  return data;
};

export const getNewProducts = async () => {
  const { data } = await http.get(`/products/new`);
  return data;
};
export const getFiltersByShop = async (shop) => {
  const { data } = await http.get(`/filters/${shop}`);
  return data;
};

export const getNewArrivels = async () => {
  const { data } = await http.get('/new-arrivals');
  return data;
};
export const getRelatedProducts = async (pid) => {
  const { data } = await http.get(`/related-products/${pid}`);
  return data;
};
export const getProductBySlug = async (slug) => {
  const { data } = await http.get(`/products/${slug}`);
  return data;
};

export const getProductReviews = async (pid) => {
  const { data } = await http.get(`/reviews/${pid}`);
  return data;
};
export const addReview = async (payload) => {
  const { data } = await http.post(`/reviews`, payload);
  return data;
};

export const getUserInvoice = async (page) => {
  const { data: response } = await http.get(`/users/invoice${page}`);
  return response;
};

export const updateProfile = async ({ ...payload }) => {
  const { data } = await http.put(`/users/profile`, payload);
  return data;
};
export const changePassword = async ({ ...payload }) => {
  const { data } = await http.put(`/users/change-password`, payload);
  return data;
};

export const getAddress = async (payload) => {
  const { data } = await http.get(`/users/addresses?id=${payload}`);
  return data;
};
export const updateAddress = async ({ _id, ...payload }) => {
  const { data } = await http.put(`/users/addresses/${_id}`, payload);
  return data;
};
export const createAddress = async ({ ...payload }) => {
  const { data } = await http.post(`/users/addresses/`, payload);
  return data;
};
export const deleteAddress = async ({ _id }) => {
  const { data } = await http.delete(`/users/addresses/${_id}`);
  return data;
};
export const search = async (payload) => {
  const { data } = await http.post(`/search`, payload);
  return data;
};
export const getSearchFilters = async () => {
  const { data } = await http.get(`/search-filters`);
  return data;
};
export const getInvoices = async () => {
  const { data } = await http.get(`/users/invoice`);
  return data;
};
export const placeOrder = async (payload) => {
  const { data } = await http.post(`/orders`, payload);
  return data;
};
export const getLayout = async () => {
  const { data } = await http.get(`/layout`);
  return data;
};
export const singleDeleteFile = async (id) => {
  const { data } = await http.delete(`/delete-file/${id}`);
  return data;
};

export const sendNewsletter = async (payload) => {
  const { data } = await http.post(`/newsletter`, payload);
  return data;
};

export const getWishlist = async () => {
  const { data } = await http.get(`/wishlist`);
  return data;
};
export const updateWishlist = async (pid) => {
  const { data } = await http.post(`/wishlist`, { pid });
  return data;
};
export const getCompareProducts = async (products) => {
  const { data } = await http.post(`/compare/products`, { products });
  return data;
};

export const getProfile = async () => {
  const { data } = await http.get(`/users/profile`);
  return data;
};

export const getAllCategories = async () => {
  const { data } = await http.get(`/all-categories`);
  return data;
};

export const getAllCategoriesforchild = async () => {
  const { data } = await http.get(`/all-categoriesforchild`);
  return data;
};

export const getAllSubCategories = async () => {
  const {data} = await http.get(`/all-subcategories`);
  return data;
};

export const getAllChildCategories = async () => {
  const {data} = await http.get(`/all-childcategories`);
  return data;
};

export const getHomeShops = async () => {
  const { data } = await http.get(`/shops?limit=5`);
  return data;
};
export const getBrands = async (page) => {
  const { data } = await http.get(`/brands?page=${page || 1}`);
  return data;
};
export const applyCouponCode = async (code) => {
  const { data: response } = await http.get(`/coupon-codes/${code}`);
  return response;
};

export const paymentIntents = async (amount, currency) => {
  const { data } = await http.post(`/payment-intents`, {
    amount,
    currency
  });
  return data;
};

export const addShopByUser = async (payload) => {
  const { data } = await http.post(`/shops`, {
    ...payload
  });

  return data;
};
export const getShopByUser = async () => {
  const { data } = await http.get(`/user/shop`);
  return data;
};

export const getShops = async () => {
  const { data } = await http.get(`/shops`);
  return data;
};

export const getAllCategoriesByUser = async () => {
  const { data } = await http.get(`/all-categories`);
  return data;
};

export const getCurrencies = async () => {
  const { data } = await http.get(`/currencies`);
  return data;
};
export const getCategoryTitle = async (category) => {
  const { data } = await http.get(`/category-title/${category}`);
  return data;
};

export const getCategoryBySlug = async (category) => {
  const { data } = await http.get(`/categories/${category}`);
  return data;
};

export const getCategorySlugs = async () => {
  const { data } = await http.get(`/categories-slugs`);
  return data;
};
export const getShopSlugs = async () => {
  const { data } = await http.get('/shops-slugs');
  return data;
};
export const getShopBySlug = async (shop) => {
  const { data } = await http.get(`/shops/${shop}`);
  return data;
};
export const getShopTitle = async (shop) => {
  const { data } = await http.get(`/shop-title/${shop}`);
  return data;
};

export const getSubCategoryTitle = async (subcategory) => {
  const { data } = await http.get(`/sub-category-title/${subcategory}`);
  return data;
};
export const getSubCategoryBySlug = async (subCategory) => {
  const { data } = await http.get(`/sub-categories/${subCategory}`);
  return data;
};

export const getSubCategorySlugs = async () => {
  const { data } = await http.get(`/sub-categories-slugs`);
  return data;
};

export const getChildCategoryBySlug = async (childCategory) => {
  const { data } = await http.get('/child-categories/' + childCategory);
  return data;
};

// export const contactUs = async (payload) => {
//   const { data } = await http.post(`/contact-us`, payload);
//   return data;
// };

// attributes
export const getAttributesByAdmin = async (page, search) => {
  const { data } = await http.get(`/admin/attributes?search=${search}&page=${page}`);
  return data;
};
export const getAttributeByAdmin = async (id) => {
  const { data } = await http.get(`/admin/attributes/${id}`);
  return data;
};
export const getAllAttributesByAdmin = async () => {
  const { data } = await http.get(`/admin/all-attributes`);
  return data;
};
export const addAttributeByAdmin = async (payload) => {
  const { data } = await http.post(`/admin/attributes`, payload);
  return data;
};
export const updateAttributeByAdmin = async ({ currentId, ...payload }) => {
  const { data } = await http.put(`/admin/attributes/${currentId}`, payload);
  return data;
};
export const deleteAttributeByAdmin = async (id) => {
  const { data } = await http.delete(`/admin/attributes/${id}`);
  return data;
};

// settings
export const getHomeSettingsByAdmin = async () => {
  const { data } = await http.get(`/admin/settings/home`);
  return data;
};
export const updateMainSettingsByAdmin = async (payload) => {
  const { data } = await http.put(`/admin/settings/main/${payload._id}`, payload);
  return data;
};

export const getSettingsByUser = async () => {
  const { data } = await http.get(`/settings/general-settings`);
  return data;
};
export const getMainSettingsByAdmin = async () => {
  const { data } = await http.get(`/admin/settings/main`);
  return data;
};

export const getGeneralSettingsByAdmin = async () => {
  const { data } = await http.get(`/admin/settings/general`);
  return data;
};
export const getBrandingSettingsByAdmin = async () => {
  const { data } = await http.get(`/admin/settings/branding`);
  return data;
};
export const updateGeneralSettingsByAdmin = async (payload) => {
  const { data } = await http.put(`/admin/settings/general/${payload._id}`, payload);
  return data;
};
export const updateHomeSettingsByAdmin = async (payload) => {
  const { data } = await http.put(`/admin/settings/home/${payload._id}`, payload);
  return data;
};

export const updateBrandingSettingsByAdmin = async (payload) => {
  const { data } = await http.put(`/admin/settings/branding/${payload._id}`, payload);
  return data;
};

export const uploadFile = async (formData, config, cloudName) => {
  const { data } = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData, config);
  return data;
};

export const uploadSingleFile = async (formData, config) => {
  const { data } = await http.post(
    "/upload/category",
    formData,
    {  
      headers: { "Content-Type": "multipart/form-data" },
      ...config
    }
  );
  return data;
};
//myapicalls

export const checkUserZone = async (userId) => {
  const { data } = await http.get(`/user_zone/${userId}`);
  return data;
};

export const saveUserLocation = async (payload) => {
  const { data } = await http.post(`/user_zone`, payload);
  return data;
};

export const getzonsByAdmin = async () => {
  const { data } = await http.get(`/admin/settings/zone`);
  return data;
};

export const saveZoneSettings = async (payload) => {
  return await http.post("/admin/settings/zone", payload);
};

// src/services/shop.js
export const createShop = async (formData) => {
  return await http.post("/shop/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const returnpolicies = async (payload) => {
  return await http.post("/admin/settings/returnpolicies", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const createShippingPolicy = (payload) =>
  http.post('/admin/settings/shippingpolicies', payload, {
    headers: { 'Content-Type': 'application/json' }
  });

  export const createCancellationPolicy = (payload) =>
  http.post('/admin/settings/cancellationpolicies', payload, {
    headers: { 'Content-Type': 'application/json' }
  });

    export const createShippingZone = (payload) =>
  http.post('/admin/settings/createShippingZone', payload, {
    headers: { 'Content-Type': 'application/json' }
  });
  

  export const getallpoliciesforlisting = async () => {
  const { data } = await http.get(`/getallpoliciesforlisting`);
  return data;
};  

export const createProduct = (formData) =>
  http.post('/vendor/addproduct', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  
  export const updateProduct = (id, formData) =>
  http.put(`/admin/updateproduct/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });


  export const pricingconvert = (formData) =>
  http.post('/pricing/convert', formData, {
     headers: { 'Content-Type': 'application/json' }
  });

  export const getProductById = async (id) =>
  await http.get(`/admin/product/${id}`);

  export const updateProductStatus = (id, status) =>
  http.patch(`/admin/product/${id}/status`, { status });


    export const singleUploadFile = async (formData, config) => {
    const { data } = await http.post(
      `/admin/upload/slider`,
      formData,
      {  
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    return data;
  };


  export const getvendoridbyproduct = async (productId) => {

  const { data } = await http.get(`/getvendoridbyproduct/${productId}`);

    return data;
  }

  export const getShippingPolicyById = async (policyId) => {
  const { data } = await http.get(`/shipping-policy/${policyId}`);
  return data;
};

export const quoterequest = async (payload) => {
  const { data } = await http.post('/quote-request', payload);
  return data;
};

export const getqoutbyvendor = async (vendorid) =>{

    const {data} = await http.get(`/getqoutbyvendor/${vendorid}`);
    return data;

}

export const getQuoteChat = async (quoteId) => {
  const { data } = await http.get(`/quote-chat/${quoteId}`);
  return data;
};

export const sendQuoteMessage = async (payload) => {
  const { data } = await http.post('/send-quote-message', payload);
  return data;
};

export const getqoutbyuser = async (userid) => {

    const {data} = await http.get(`/getqoutbyuser/${userid}`);
    return data;

}

export const Allcountries = async () => {

      const {data} = await http.get(`/all-countries`);
      return data;
}

export const getCourierRate = async (payload) => {

      const {data} = await http.post(`/get-courier-rate`, payload);
      return data;
}

export const googleSignIn = async (payload) => {

      const {data} = await http.post(`/google-sign-in`, payload);
      return data;
}

export const appleSignIn = async (payload) => {
  const { data } = await http.post(`/apple-sign-in`, payload);
  return data;
};

// ✅ Correct — uses your configured http instance with base URL
export const getFedexRates = async (payload) => {
  const { data } = await http.post('/fedex/rates', payload);
  return data;
};


export const createShipment = async (payload) => {
  const { data } = await http.post(`/shipments/create`, payload);
  return data;
};

export const downloadShipmentLabel = (orderItemId) => {
  // Opens PDF directly in new tab — no axios needed
  window.open(
    `${process.env.NEXT_PUBLIC_API_URL}/api/shipments/label/${orderItemId}`,
    '_blank'
  );
};

export const schedulePickup = async ({ orderItemId, pickupDate, readyTime, closeTime }) => {
  const { data } = await http.post(`/shipments/pickup`, {
    orderItemId,
    pickupDate,
    readyTime,
    closeTime,
  });
  return data;
};

export const updateOrderItemDecision = async ({ orderItemId, decision, rejectReason }) => {
  const { data } = await http.patch(`/vendor/orders/item/${orderItemId}/decision`, {
    decision,
    rejectReason,
  });
  return data;
};

export const getVendorPayments = async () => {
  const { data } = await http.get(`/vendor/payments`);
  return data;
};


export const getShopStatus = async () => {
  const { data } = await http.get(`/vendor/shop-status`);
  return data;
};

export const sendPhoneOtp = async (phoneNumber) => {
  const { data } = await http.post(`vendor/phone/send-otp`, { phoneNumber });
  return data;
};

export const verifyPhoneOtp = async (phoneNumber, code) => {
  const { data } = await http.post(`vendor/phone/verify-otp`, { phoneNumber, code });
  return data;
};


export const getDraftProducts = async (page = 1, limit = 10) => {
  const { data } = await http.get(`/admin/products/status/draft`, {params: { page, limit },});
  return data;
};

export const approveProduct = async (slug) => {
  const { data } = await http.put(`/admin/products/${slug}/approve`);
  return data;
};

export const rejectProduct = async (slug) => {
  const { data } = await http.put(`/admin/products/${slug}/reject`);
  return data;
};

export const getAdminProduct = async (slug) => {
  const { data } = await http.get(`/admin/products/${slug}`);
  return data;
};

//user and roles of admin

export const getAllPermissions = async () => {
  const { data } = await http.get('/admin/permissions');
  return data;
};

export const getAdminRoles = async () => {
  const { data } = await http.get('/admin/roles');
  return data;
};

export const getOneAdminRole = async (id) => {
  const { data } = await http.get(`/admin/roles/${id}`);
  return data;
};

export const createAdminRole = async (payload) => {
  const { data } = await http.post('/admin/roles', payload);
  return data;
};

export const updateAdminRole = async (id, payload) => {
  const { data } = await http.put(`/admin/roles/${id}`, payload);
  return data;
};

export const deleteAdminRole = async (id) => {
  const { data } = await http.delete(`/admin/roles/${id}`);
  return data;
};

export const assignRoleToUser = async (userId, adminRole) => {
  const { data } = await http.put(`/admin/users/${userId}/role`, { adminRole });
  return data;
};

  
// ---- vendor support ----
export const vendorRaiseSupportTicket = async (payload) => {
  const { data } = await http.post(`/vendor/support/tickets`, payload);
  return data;
};

export const vendorGetMySupportTickets = async (params) => {
  const { data } = await http.get(`/vendor/support/tickets/my`, { params });
  return data;
};

export const vendorGetSupportTicketById = async (id) => {
  const { data } = await http.get(`/vendor/support/tickets/${id}`);
  return data;
};

export const vendorReplySupportTicket = async ({ id, payload }) => {
  const { data } = await http.post(`/vendor/support/tickets/${id}/messages`, payload);
  return data;
};

// ---- admin support ----
export const adminGetAllSupportTickets = async (params) => {
  const { data } = await http.get(`/admin/support/tickets`, { params });
  return data;
};

export const adminGetSupportTicketById = async (id) => {
  const { data } = await http.get(`/admin/support/tickets/${id}`);
  return data;
};

export const adminReplySupportTicket = async ({ id, payload }) => {
  const { data } = await http.post(`/admin/support/tickets/${id}/messages`, payload);
  return data;
};

export const adminUpdateSupportTicketStatus = async ({ id, status }) => {
  const { data } = await http.patch(`/admin/support/tickets/${id}/status`, { status });
  return data;
};

export const adminAssignSupportTicket = async ({ id, adminId }) => {
  const { data } = await http.patch(`/admin/support/tickets/${id}/assign`, { adminId });
  return data;
};

// ---- user support ----
export const userRaiseSupportTicket = async (payload) => {
  const { data } = await http.post(`/support/tickets`, payload);
  return data;
};

export const userGetMySupportTickets = async (params) => {
  const { data } = await http.get(`/support/tickets/my`, { params });
  return data;
};

export const userGetSupportTicketById = async (id) => {
  const { data } = await http.get(`/support/tickets/${id}`);
  return data;
};

export const userReplySupportTicket = async ({ id, payload }) => {
  const { data } = await http.post(`/support/tickets/${id}/messages`, payload);
  return data;
};

export const suggestCategoryFromTitle = async (title) => {
  const { data } = await http.post('/suggest-category', { title });
  return data;
};

export const userGetIssueEligibility = async (orderItemId) => {
  const { data } = await http.get(`/support/order-items/${orderItemId}/eligibility`);
  return data;
};
 
export const adminGetTicketEligibility = async (ticketId) => {
  const { data } = await http.get(`/admin/support/tickets/${ticketId}/eligibility`);
  return data;
};
 
export const adminDecideSupportTicket = async ({ id, decision, note }) => {
  const { data } = await http.patch(`/admin/support/tickets/${id}/decision`, { decision, note });
  return data;
};