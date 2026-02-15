import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export API_URL for use in other components
export { API_URL };

/**
 * Upload text or file content
 * @param {FormData} formData - Form data containing upload information
 * @returns {Promise} API response
 */
export const uploadContent = async (formData) => {
  const response = await api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Get content by unique ID
 * @param {string} uniqueId - Unique identifier
 * @returns {Promise} API response
 */
export const getContent = async (uniqueId) => {
  const response = await api.get(`/api/content/${uniqueId}`);
  return response.data;
};

export default api;
