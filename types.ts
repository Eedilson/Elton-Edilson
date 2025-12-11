
export interface Offer {
  id: string;
  name: string; // Nome interno (ex: Preço Black Friday)
  price: number;
  isDefault: boolean;
}

export interface Coproducer {
  email: string;
  percentage: number;
  status: 'pending' | 'confirmed';
  invitedAt: string;
}

// Novos Tipos
export interface PixelConfig {
  facebook?: { pixelId: string; apiToken?: string; domain?: string; };
  googleAds?: { conversionId: string; conversionLabel: string; };
  tiktok?: { pixelId: string; };
  ga4?: { measurementId: string; };
}

export interface OrderBump {
  id: string;
  productId: string; // Produto vinculado
  title: string;
  price: number; // Preço da oferta no bump
  imageUrl?: string;
  description?: string;
  isEnabled: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  percentage: number;
  isActive: boolean;
}

export interface FunnelConfig {
  upsellProductId?: string; // Produto que será vendido no upsell
  upsellPageUrl?: string; // URL da página de vendas do Upsell (Redirecionamento)
  upsellPrice?: number; 
  
  downsellProductId?: string; // Produto do downsell
  downsellPageUrl?: string; // URL da página de downsell
  downsellPrice?: number;
}

// --- CURSO ONLINE / ÁREA DE MEMBROS ---
export interface SupportMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'image' | 'link' | 'archive';
  url: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  description?: string;
  coverImage?: string; // Capa da Aula (Thumbnail)
  videoUrl?: string; // YouTube/Vimeo/PandaVideo
  videoSource?: 'external' | 'local'; 
  videoBlobUrl?: string; // URL local para preview
  duration?: number; // minutos
  materials?: SupportMaterial[];
  allowComments: boolean;
  isPublished: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  coverImage?: string; // Capa do Módulo
  lessons: CourseLesson[];
  releaseDate?: string; // Data para liberar o módulo (Bloqueio)
}

// Entidade de Curso Independente
export interface Course {
  id: string;
  title: string;
  description?: string;
  coverImage?: string; // Banner do Curso
  modules: CourseModule[];
  
  // Welcome Video Config
  welcomeVideoUrl?: string;
  welcomeVideoSource?: 'external' | 'local';
  welcomeVideoBlobUrl?: string;

  createdAt: string;
  ownerId?: string; // Para isolamento de dados
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
  affiliateMaterialLink?: string; // Link para drive/mega com criativos
  tags?: string[];
  deliveryMessage?: string;
  downloadUrl?: string;

  // Advanced Configuration (Cakto/Kiwify Style)
  category?: string;
  paymentType?: 'unique' | 'subscription';
  salesPageUrl?: string; // Link to Instagram or Sales Page
  
  // New Modules
  pixels?: PixelConfig;
  orderBumps?: OrderBump[];
  coupons?: Coupon[];
  couponsEnabled?: boolean; // Master toggle
  funnel?: FunnelConfig; // Upsell e Downsell pós-compra
  
  // Course Specific
  linkedCourseId?: string; // Conecta o produto a um Curso criado na Área de Membros
  
  // Legacy (Keep for backward compatibility during migration)
  courseModules?: CourseModule[];
  welcomeVideoUrl?: string;

  // Checkout Customization
  checkoutConfig?: {
    components: string[]; // e.g., ['header', 'guarantee_seal', 'timer']
    primaryColor: string;
    showCountdown: boolean;
    showTestimonials: boolean;
    
    // Specific Assets for Checkout (requested by user)
    checkoutCoverImage?: string; // Separate from product image
    
    // Checkout Video Config
    checkoutVideoUrl?: string;   
    checkoutVideoSource?: 'external' | 'local';
    checkoutVideoBlobUrl?: string;
    
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

  // Internal storage for Large Files (IndexedDB support)
  imageBlob?: any; // Stores the raw Image Blob
  fileBlob?: any;  // Stores the raw Product File Blob (PDF/ZIP)
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
  CHECKOUT_EDITOR = 'CHECKOUT_EDITOR',
  MEMBERS_AREA = 'MEMBERS_AREA' // Nova View
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
