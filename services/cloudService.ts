
import { Product, WebhookConfig, ApiKeyConfig, IntegrationApp, Course } from "../types";

// SIMBA CLOUD DATABASE (IndexedDB Implementation)
const DB_NAME = 'SimbaCloudDB';
const DB_VERSION = 2; // Incremented version for new store

// Load user from storage on init
let CURRENT_USER_ID = localStorage.getItem('simba_user_id') || '';

// --- UTILS INDEXEDDB ---
const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: any) => {
            const db = event.target.result;
            // Stores para dados
            if (!db.objectStoreNames.contains('products')) {
                db.createObjectStore('products', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('courses')) { // New Store
                db.createObjectStore('courses', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('webhooks')) {
                db.createObjectStore('webhooks', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('api_keys')) {
                db.createObjectStore('api_keys', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('integrations')) {
                db.createObjectStore('integrations'); 
            }
        };

        request.onsuccess = (event: any) => {
            resolve(event.target.result);
        };

        request.onerror = (event: any) => {
            console.error("Erro ao abrir Banco de Dados Local:", event.target.error);
            reject(event.target.error);
        };
    });
};

const dbOp = async (storeName: string, mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest | void): Promise<any> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        
        let request;
        try {
            request = operation(store);
        } catch (e) {
            reject(e);
            return;
        }

        if (request) {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        } else {
             transaction.oncomplete = () => resolve(true);
             transaction.onerror = () => reject(transaction.error);
        }
    });
};

export const SimbaCloud = {
  // --- AUTH CONTEXT ---
  setUserId: (userId: string) => {
      CURRENT_USER_ID = userId;
      // Persist login
      localStorage.setItem('simba_user_id', userId);
  },

  getCurrentUserId: () => {
      return localStorage.getItem('simba_user_id');
  },

  logout: () => {
      CURRENT_USER_ID = '';
      localStorage.removeItem('simba_user_id');
  },

  // --- UPLOAD (Arquivos Grandes) ---
  uploadFile: async (file: File): Promise<string> => {
    // Limite aumentado para 600MB conforme solicitado
    const maxSize = 600 * 1024 * 1024; // 600MB
    if (file.size > maxSize) {
        alert("O arquivo excede o limite máximo de 600MB.");
        return "";
    }
    return URL.createObjectURL(file);
  },

  // Alias para manter compatibilidade com código antigo
  uploadImage: async (file: File): Promise<string> => {
      return SimbaCloud.uploadFile(file);
  },

  // --- COURSES (NEW) ---
  saveCourse: async (course: Course): Promise<Course> => {
      if (!CURRENT_USER_ID) throw new Error("Usuário não autenticado");
      const courseToSave = { ...course };
      (courseToSave as any).ownerId = CURRENT_USER_ID;
      
      try {
          await dbOp('courses', 'readwrite', (store) => store.put(courseToSave));
          return courseToSave;
      } catch (e) {
          console.error("Erro ao salvar curso", e);
          throw e;
      }
  },

  getCourses: async (): Promise<Course[]> => {
      if (!CURRENT_USER_ID) return [];
      try {
          const all = (await dbOp('courses', 'readonly', (store) => store.getAll())) as Course[];
          return all.filter((c: any) => c.ownerId === CURRENT_USER_ID);
      } catch (e) { return []; }
  },

  deleteCourse: async (id: string): Promise<void> => {
      try {
          await dbOp('courses', 'readwrite', (store) => store.delete(id));
      } catch (e) { console.error(e); }
  },

  // --- PRODUTOS (DATABASE) ---
  saveProduct: async (product: Product): Promise<Product> => {
    if (!CURRENT_USER_ID) throw new Error("Usuário não autenticado");

    await new Promise(r => setTimeout(r, 600));
    
    const productToSave = { ...product };
    // Tag with Owner - CRITICAL FOR ISOLATION
    (productToSave as any).ownerId = CURRENT_USER_ID;

    // 1. Processar Imagem do Produto
    if (product.imageUrl && product.imageUrl.startsWith('blob:')) {
        try {
            const resp = await fetch(product.imageUrl);
            const blob = await resp.blob();
            productToSave.imageBlob = blob; 
        } catch (e) { console.error(e); }
    }

    // 3. Processar Arquivo do Produto
    if (product.productFile && product.productFile.startsWith('blob:')) {
         try {
            const resp = await fetch(product.productFile);
            const blob = await resp.blob();
            productToSave.fileBlob = blob;
        } catch (e) { console.error(e); }
    }

    // 4. Processar Vídeos de Aulas (Deep Check)
    if (product.courseModules) {
        for (const module of product.courseModules) {
            for (const lesson of module.lessons) {
                if (lesson.videoSource === 'local' && lesson.videoBlobUrl && lesson.videoBlobUrl.startsWith('blob:')) {
                    // Blob handling logic
                }
            }
        }
    }

    const checkoutId = productToSave.id || Math.random().toString(36).substring(7);
    productToSave.id = productToSave.id || Date.now().toString();
    productToSave.dateCreated = productToSave.dateCreated || new Date().toISOString();
    
    if (!productToSave.links?.checkout) {
        productToSave.links = {
            checkout: `https://simba.app/pay/${checkoutId}`,
            salesPage: productToSave.salesPageUrl || `https://simba.app/p/${checkoutId}`
        };
    }

    try {
        await dbOp('products', 'readwrite', (store) => store.put(productToSave));
        return productToSave;
    } catch (e) {
        console.error("Erro ao salvar no IndexedDB", e);
        throw e;
    }
  },

  getProducts: async (): Promise<Product[]> => {
    if (!CURRENT_USER_ID) return [];
    try {
        const allProducts = (await dbOp('products', 'readonly', (store) => store.getAll())) as Product[];
        
        // Filter by Current User - ISOLATION
        const userProducts = allProducts.filter((p: any) => p.ownerId === CURRENT_USER_ID);

        return userProducts.map(p => {
            if (p.imageBlob && p.imageBlob instanceof Blob) {
                p.imageUrl = URL.createObjectURL(p.imageBlob);
            }
            if (p.fileBlob && p.fileBlob instanceof Blob) {
                p.productFile = URL.createObjectURL(p.fileBlob);
            }
            return p;
        });
    } catch (e) {
        return [];
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    try {
        await dbOp('products', 'readwrite', (store) => store.delete(id));
    } catch (e) { console.error(e); }
  },

  // --- WEBHOOKS ---
  saveWebhook: async (webhook: WebhookConfig): Promise<WebhookConfig> => {
    (webhook as any).ownerId = CURRENT_USER_ID;
    await dbOp('webhooks', 'readwrite', (store) => store.put(webhook));
    return webhook;
  },

  getWebhooks: async (): Promise<WebhookConfig[]> => {
    if (!CURRENT_USER_ID) return [];
    try {
        const all = (await dbOp('webhooks', 'readonly', (store) => store.getAll())) as WebhookConfig[];
        return all.filter((w: any) => w.ownerId === CURRENT_USER_ID);
    } catch (e) { return []; }
  },

  // --- API KEYS ---
  saveApiKey: async (key: ApiKeyConfig): Promise<ApiKeyConfig> => {
    (key as any).ownerId = CURRENT_USER_ID;
    await dbOp('api_keys', 'readwrite', (store) => store.put(key));
    return key;
  },

  getApiKeys: async (): Promise<ApiKeyConfig[]> => {
    if (!CURRENT_USER_ID) return [];
    try {
        const all = (await dbOp('api_keys', 'readonly', (store) => store.getAll())) as ApiKeyConfig[];
        return all.filter((k: any) => k.ownerId === CURRENT_USER_ID);
    } catch (e) { return []; }
  },

  // --- INTEGRAÇÕES ---
  saveIntegration: async (appId: string, config: any): Promise<void> => {
     // Composite key for integration: UserID_AppID
     await dbOp('integrations', 'readwrite', (store) => store.put({ status: 'connected', config }, `${CURRENT_USER_ID}_${appId}`));
  },

  getIntegrationsStatus: async (): Promise<Record<string, any>> => {
      if (!CURRENT_USER_ID) return {};
      try {
        const db = await openDB();
        return new Promise((resolve) => {
            const transaction = db.transaction('integrations', 'readonly');
            const store = transaction.objectStore('integrations');
            const request = store.openCursor();
            const results: Record<string, any> = {};
            const prefix = `${CURRENT_USER_ID}_`;

            request.onsuccess = (event: any) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (cursor.key.toString().startsWith(prefix)) {
                        const originalAppId = cursor.key.toString().replace(prefix, '');
                        results[originalAppId] = cursor.value;
                    }
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };
            request.onerror = () => resolve({});
        });
      } catch (e) { return {}; }
  }
};
