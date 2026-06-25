import axios from 'axios';

let baseUrl = import.meta.env.VITE_API_URL || 'https://old-money-algeria-backend.onrender.com/api/v1';
if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
if (!baseUrl.endsWith('/api/v1')) baseUrl = `${baseUrl}/api/v1`;
export const API_BASE_URL = baseUrl;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
});

export const fetchProducts = async (params = {}) => {
  const response = await apiClient.get('/products/', { params });
  return response.data;
};

export const fetchProductBySlug = async (slug) => {
  const response = await apiClient.get(`/products/${slug}/`);
  return response.data;
};

export const fetchCollections = async () => {
  const response = await apiClient.get('/collections/');
  return response.data;
};

export const fetchWilayas = async () => {
  const response = await apiClient.get('/wilayas/');
  return response.data;
};

export const submitOrder = async (orderData) => {
  const response = await apiClient.post('/orders/checkout/', orderData, { timeout: 60000 });
  return response.data;
};

export const trackOrder = async (orderNumber) => {
  const response = await apiClient.get(`/orders/track/${orderNumber}/`);
  return response.data;
};

export const fetchSettings = async () => {
  const response = await apiClient.get(`/settings/?t=${Date.now()}`);
  if (response.data.results && response.data.results.length > 0) {
    return response.data.results[0];
  }
  return null;
};

export const fetchHomepageBanners = async () => {
  const response = await apiClient.get(`/homepage/banners/?t=${Date.now()}`);
  if (response.data.results && response.data.results.length > 0) {
    return response.data.results;
  }
  return [];
};

export const fetchHomepageSections = async () => {
  const response = await apiClient.get(`/homepage/sections/?t=${Date.now()}`);
  return response.data;
};

export const fetchLookbookItems = async () => {
  const response = await apiClient.get('/lookbook/');
  return response.data;
};
