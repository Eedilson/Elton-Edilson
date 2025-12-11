import { Product, WebhookConfig, ApiKeyConfig, IntegrationApp } from "../types";

// SIMBA CLOUD SIMULATOR
// This service mimics a backend API and Database.

const DB_KEY_PRODUCTS = 'simba_products_clean_v1';
const DB_KEY_WEBHOOKS = 'simba_webhooks_v1';
const DB_KEY_API_KEYS = 'simba_api_keys_v1';
const DB_KEY_INTEGRATIONS = 'simba_integrations_v1';

export const SimbaCloud = {
  // Simulate uploading a file to a CDN (S3/Cloud Storage)
  uploadImage: async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // In a real app, this would return a https://s3.amazonaws.com/... URL
        // Here we return the base64 string to simulate it working in the browser
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // --- PRODUCTS ---
  saveProduct: async (product: Product): Promise<Product> => {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));

    const existingData = localStorage.getItem(DB_KEY_PRODUCTS);
    const products: Product[] = existingData ? JSON.parse(existingData) : [];
    
    // Generate unique Links
    const checkoutId = Math.random().toString(36).substring(7);
    const updatedProduct = {
      ...product,
      links: {
        checkout: `https://simba.app/pay/${checkoutId}`,
        salesPage: product.salesPageUrl || `https://simba.app/p/${product.id}`
      }
    };

    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = updatedProduct;
    } else {
      products.push(updatedProduct);
    }

    localStorage.setItem(DB_KEY_PRODUCTS, JSON.stringify(products));
    return updatedProduct;
  },

  getProducts: async (): Promise<Product[]> => {
    const data = localStorage.getItem(DB_KEY_PRODUCTS);
    return data ? JSON.parse(data) : [];
  },

  // --- WEBHOOKS ---
  saveWebhook: async (webhook: WebhookConfig): Promise<WebhookConfig> => {
    await new Promise(r => setTimeout(r, 500));
    const existing = localStorage.getItem(DB_KEY_WEBHOOKS);
    const list: WebhookConfig[] = existing ? JSON.parse(existing) : [];
    const newList = [webhook, ...list];
    localStorage.setItem(DB_KEY_WEBHOOKS, JSON.stringify(newList));
    return webhook;
  },

  getWebhooks: async (): Promise<WebhookConfig[]> => {
    const data = localStorage.getItem(DB_KEY_WEBHOOKS);
    return data ? JSON.parse(data) : [];
  },

  // --- API KEYS ---
  saveApiKey: async (key: ApiKeyConfig): Promise<ApiKeyConfig> => {
    await new Promise(r => setTimeout(r, 500));
    const existing = localStorage.getItem(DB_KEY_API_KEYS);
    const list: ApiKeyConfig[] = existing ? JSON.parse(existing) : [];
    const newList = [key, ...list];
    localStorage.setItem(DB_KEY_API_KEYS, JSON.stringify(newList));
    return key;
  },

  getApiKeys: async (): Promise<ApiKeyConfig[]> => {
    const data = localStorage.getItem(DB_KEY_API_KEYS);
    return data ? JSON.parse(data) : [];
  },

  // --- APP INTEGRATIONS ---
  saveIntegration: async (appId: string, config: any): Promise<void> => {
     await new Promise(r => setTimeout(r, 600));
     const existing = localStorage.getItem(DB_KEY_INTEGRATIONS);
     const data = existing ? JSON.parse(existing) : {};
     data[appId] = { status: 'connected', config };
     localStorage.setItem(DB_KEY_INTEGRATIONS, JSON.stringify(data));
  },

  getIntegrationsStatus: async (): Promise<Record<string, any>> => {
      const data = localStorage.getItem(DB_KEY_INTEGRATIONS);
      return data ? JSON.parse(data) : {};
  }
};