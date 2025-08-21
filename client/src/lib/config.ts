// === API CONFIGURATION ===
// Centralized configuration for API base URLs and endpoints

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

// Environment-based configuration
const getEnvironmentConfig = (): ApiConfig => {
  // Check for environment variables first
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const envTimeout = import.meta.env.VITE_API_TIMEOUT;
  const envRetries = import.meta.env.VITE_API_RETRIES;

  // Default configuration
  const defaultConfig: ApiConfig = {
    baseUrl: '/api',
    timeout: 30000, // 30 seconds
    retries: 3
  };

  // Override with environment variables if provided
  return {
    baseUrl: envBaseUrl || defaultConfig.baseUrl,
    timeout: envTimeout ? parseInt(envTimeout, 10) : defaultConfig.timeout,
    retries: envRetries ? parseInt(envRetries, 10) : defaultConfig.retries
  };
};

// Global API configuration
let currentConfig: ApiConfig = getEnvironmentConfig();

// Configuration management functions
export const getApiConfig = (): ApiConfig => {
  return { ...currentConfig };
};

export const setApiConfig = (newConfig: Partial<ApiConfig>): void => {
  currentConfig = { ...currentConfig, ...newConfig };
  
  // Trigger a custom event to notify components of config change
  window.dispatchEvent(new CustomEvent('apiConfigChanged', { 
    detail: currentConfig 
  }));
};

export const resetApiConfig = (): void => {
  currentConfig = getEnvironmentConfig();
  window.dispatchEvent(new CustomEvent('apiConfigChanged', { 
    detail: currentConfig 
  }));
};

// Utility to build full API URLs
export const buildApiUrl = (endpoint: string, baseUrl?: string): string => {
  const config = getApiConfig();
  const base = baseUrl || config.baseUrl;
  
  // Handle absolute URLs
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  // Handle relative URLs
  if (base.startsWith('http://') || base.startsWith('https://')) {
    // Base URL is absolute
    return `${base.replace(/\/$/, '')}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  } else {
    // Base URL is relative to current origin
    return new URL(`${base.replace(/\/$/, '')}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, window.location.origin).toString();
  }
};

// Predefined configurations for different environments
export const API_CONFIGS = {
  development: {
    baseUrl: '/api',
    timeout: 30000,
    retries: 3
  },
  staging: {
    baseUrl: 'https://staging-api.azamtv.com/api',
    timeout: 30000,
    retries: 3
  },
  production: {
    baseUrl: 'https://api.azamtv.com/api',
    timeout: 20000,
    retries: 2
  },
  local: {
    baseUrl: 'http://localhost:5000/api',
    timeout: 30000,
    retries: 3
  }
} as const;

export type Environment = keyof typeof API_CONFIGS;

// Quick environment switcher
export const setEnvironment = (env: Environment): void => {
  setApiConfig(API_CONFIGS[env]);
};

// Export the current configuration
export { currentConfig as apiConfig };