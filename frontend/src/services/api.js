import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.error('Response error:', error);
    
    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - could redirect to login
          console.log('Unauthorized access');
          break;
        case 403:
          // Forbidden
          console.log('Access forbidden');
          break;
        case 404:
          // Not found
          console.log('Resource not found');
          break;
        case 500:
          // Server error
          console.log('Server error');
          break;
        default:
          console.log(`HTTP error: ${error.response.status}`);
      }
    } else if (error.request) {
      // Network error
      console.log('Network error - no response received');
    } else {
      // Other error
      console.log('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
