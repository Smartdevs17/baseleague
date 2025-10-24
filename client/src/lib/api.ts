import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { config } from './config';
import { toast } from '@/hooks/use-toast';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://baseleague.vercel.app',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    return response;
  },
  (error: AxiosError) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          toast.error('Unauthorized', {
            description: 'Please log in again to continue.',
          });
          // Clear auth token and redirect to login
          localStorage.removeItem('auth_token');
          break;
        case 403:
          toast.error('Forbidden', {
            description: 'You do not have permission to perform this action.',
          });
          break;
        case 404:
          toast.error('Not Found', {
            description: 'The requested resource was not found.',
          });
          break;
        case 500:
          toast.error('Server Error', {
            description: 'Something went wrong on our end. Please try again later.',
          });
          break;
        default:
          toast.error('Request Failed', {
            description: (data as any)?.message || 'An unexpected error occurred.',
          });
      }
    } else if (error.request) {
      // Network error
      toast.error('Network Error', {
        description: 'Please check your internet connection and try again.',
      });
    } else {
      // Other error
      toast.error('Request Error', {
        description: error.message || 'An unexpected error occurred.',
      });
    }
    
    console.error('Response interceptor error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;
