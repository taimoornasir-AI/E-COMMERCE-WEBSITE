import api from './axios';

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me'),
};

// ─── Products ─────────────────────────────────────────────────────────────
export const productsApi = {
  list: (params) => api.get('/products', { params }),
  get: (id) => api.get(`/products/${id}`),
  create: (formData) => api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/products/${id}`),
  bulk: (data) => api.post('/products/bulk', data),
};

// ─── Categories ───────────────────────────────────────────────────────────
export const categoriesApi = {
  list: (params) => api.get('/categories', { params }),
  get: (id) => api.get(`/categories/${id}`),
  create: (formData) => api.post('/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  reorder: (items) => api.put('/categories/reorder', { items }),
};

// ─── Cart ────────────────────────────────────────────────────────────────
export const cartApi = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  update: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete('/cart'),
};

// ─── Wishlist ────────────────────────────────────────────────────────────
export const wishlistApi = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist', { productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
  share: (userId) => api.get(`/wishlist/share/${userId}`),
};

// ─── Orders ──────────────────────────────────────────────────────────────
export const ordersApi = {
  list: (params) => api.get('/orders', { params }),
  get: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

// ─── Users ───────────────────────────────────────────────────────────────
export const usersApi = {
  list: (params) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  uploadAvatar: (id, formData) => api.post(`/users/${id}/avatar`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  deactivate: (id) => api.patch(`/users/${id}/deactivate`),
  getAddresses: (id) => api.get(`/users/${id}/addresses`),
  addAddress: (id, data) => api.post(`/users/${id}/addresses`, data),
  deleteAddress: (id, addressId) => api.delete(`/users/${id}/addresses/${addressId}`),
};

// ─── Payments ─────────────────────────────────────────────────────────────
export const paymentsApi = {
  createIntent: (data) => api.post('/payments/intent', data),
  createSession: (data) => api.post('/payments/session', data),
  refund: (data) => api.post('/payments/refund', data),
  getMethods: () => api.get('/payments/methods'),
};

// ─── Inventory ────────────────────────────────────────────────────────────
export const inventoryApi = {
  list: (params) => api.get('/inventory', { params }),
  lowStock: () => api.get('/inventory/low-stock'),
  update: (variantId, data) => api.put(`/inventory/${variantId}`, data),
  getLogs: (variantId) => api.get(`/inventory/${variantId}/logs`),
  exportCsv: () => api.get('/inventory/export/csv', { responseType: 'blob' }),
};

// ─── Recommendations ─────────────────────────────────────────────────────
export const recommendationsApi = {
  get: (params) => api.get('/recommendations', { params }),
};

// ─── Reviews ─────────────────────────────────────────────────────────────
export const reviewsApi = {
  list: (params) => api.get('/reviews', { params }),
  create: (productId, data) => api.post(`/reviews/${productId}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// ─── Coupons ─────────────────────────────────────────────────────────────
export const couponsApi = {
  validate: (code, subtotal) => api.post('/coupons/validate', { code, subtotal }),
  list: () => api.get('/coupons'),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
};
