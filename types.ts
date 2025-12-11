export interface Offer {
  id: string;
  name: string;
  price: number;
  isDefault: boolean;
}

export interface Coproducer {
  email: string;
  percentage: number;
  status: 'pending' | 'confirmed';
  invitedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Keeps the main/lowest price for display purposes
  
  // New fields for Multi-price & Co-production
  offers: Offer[];
  coproducers: Coproducer[];

  productType: 'ebook' | 'course' | 'application'; 
  productFile?: string; // For Ebooks (PDF URL)
  accessLink?: string; // For Apps/Courses (External URL)
  
  format: 'PDF' | 'EPUB' | 'ZIP' | 'APP' | 'VIDEO';
  salesCount: number;
  revenue: number;
  status: 'active' | 'draft';
  dateCreated: string;
  
  // Marketplace & Affiliates
  imageUrl?: string;
  temperature?: number;
  commissionPercentage?: number;
  isAffiliationEnabled?: boolean;
  tags?: string[];
  deliveryMessage?: string;
  downloadUrl?: string;

  // Advanced Configuration (Cakto Style)
  category?: string;
  paymentType?: 'unique' | 'subscription';
  salesPageUrl?: string; // Link to Instagram or Sales Page
  
  // Checkout Customization
  checkoutConfig?: {
    components: string[]; // e.g., ['header', 'guarantee_seal', 'timer']
    primaryColor: string;
    showCountdown: boolean;
    showTestimonials: boolean;
    
    // Specific Assets for Checkout (requested by user)
    checkoutCoverImage?: string; // Separate from product image
    checkoutVideoUrl?: string;   // Separate from product video
    
    // Timer Settings
    timerSettings?: {
      enabled: boolean;
      minutes: number;
      text: string;
      backgroundColor: string;
      textColor: string;
    };
  };

  // Links
  links?: {
    checkout: string;
    salesPage: string;
    [key: string]: string; // Allow dynamic keys for offers
  };
}

export interface SalesData {
  name: string;
  sales: number;
  revenue: number;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  PRODUCTS = 'PRODUCTS',
  VITRINE = 'VITRINE',
  SALES = 'SALES',
  SUBSCRIPTIONS = 'SUBSCRIPTIONS',
  REPORTS = 'REPORTS',
  AFFILIATES = 'AFFILIATES',
  FINANCE = 'FINANCE',
  INTEGRATIONS = 'INTEGRATIONS',
  COUPONS = 'COUPONS',
  CREATE_PRODUCT = 'CREATE_PRODUCT',
  CHECKOUT_PREVIEW = 'CHECKOUT_PREVIEW',
  CHECKOUT_EDITOR = 'CHECKOUT_EDITOR' // New Full Screen Editor
}

// INTEGRATIONS TYPES
export interface IntegrationApp {
  id: string;
  name: string;
  category: 'Marketing' | 'Finance' | 'Notification' | 'Members' | 'Tools';
  logoColor: string;
  status: 'connected' | 'disconnected';
  config?: Record<string, string>;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  token: string;
  events: string[];
  status: 'active' | 'inactive';
  lastTriggered?: string;
}

export interface ApiKeyConfig {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string; // Only shown once
  scopes: string[];
  createdAt: string;
  lastUsed?: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'sale' | 'withdrawal' | 'refund';
  status: 'success' | 'pending' | 'failed';
  description?: string;
}