import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, Moon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import CreateProduct from './components/CreateProduct';
import Integrations from './components/Integrations';
import Vitrine from './components/Vitrine';
import Affiliates from './components/Affiliates';
import Checkout from './components/Checkout';
import CheckoutEditor from './components/CheckoutEditor';
import Finance from './components/Finance';
import MySales from './components/MySales';
import { ViewState, Product } from './types';
import { SimbaCloud } from './services/cloudService';

// Initial Seed Data (Simulating Cloud DB)
const SEED_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Destravando o Iceberg',
    description: 'Aprenda a criar conteúdo sem aparecer. O guia definitivo para creators tímidos.',
    price: 1500,
    format: 'PDF',
    productType: 'ebook',
    offers: [{id: '1', name: 'Oferta Padrão', price: 1500, isDefault: true}],
    coproducers: [],
    salesCount: 124,
    revenue: 186000,
    status: 'active',
    dateCreated: '2023-10-15',
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop',
    temperature: 150,
    commissionPercentage: 0.15,
    isAffiliationEnabled: true,
    tags: ['Order bump', 'Página do afiliado'],
    links: { checkout: 'https://simba.app/pay/iceberg', salesPage: 'https://instagram.com/iceberg' }
  },
  {
    id: '2',
    name: 'Código da Reconquista',
    description: 'O método comprovado para recuperar relacionamentos em 30 dias.',
    price: 800,
    format: 'EPUB',
    productType: 'ebook',
    offers: [{id: '1', name: 'Oferta Padrão', price: 800, isDefault: true}],
    coproducers: [],
    salesCount: 85,
    revenue: 68000,
    status: 'active',
    dateCreated: '2023-11-02',
    imageUrl: 'https://images.unsplash.com/photo-1518644730709-083971e9725a?q=80&w=1000&auto=format&fit=crop',
    temperature: 120,
    commissionPercentage: 0.30,
    isAffiliationEnabled: true,
    tags: ['Upsell', 'Copy Validada'],
    links: { checkout: 'https://simba.app/pay/reconquista', salesPage: '' }
  }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [products, setProducts] = useState<Product[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [myAffiliations, setMyAffiliations] = useState<Product[]>([]);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  
  // State for Editing
  const [productToEditCheckout, setProductToEditCheckout] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Helper to load products
  const loadProducts = async () => {
      const loaded = await SimbaCloud.getProducts();
      setProducts(loaded);
  };

  // Initialize Cloud Data
  useEffect(() => {
    const init = async () => {
       // Seed if empty
       const existing = await SimbaCloud.getProducts();
       if (existing.length === 0) {
         for (const p of SEED_PRODUCTS) {
            await SimbaCloud.saveProduct(p);
         }
       }
       await loadProducts();
    };
    init();
  }, []);

  // Reload products whenever the view changes to PRODUCTS.
  useEffect(() => {
      if (currentView === ViewState.PRODUCTS) {
          loadProducts();
      }
  }, [currentView]);

  const handleProductCreated = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev.filter(p => p.id !== newProduct.id)]);
    setCurrentView(ViewState.PRODUCTS);
    setProductToEdit(null); // Clear edit state
  };

  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleAffiliateClick = (product: Product) => {
    if (!myAffiliations.find(p => p.id === product.id)) {
        setMyAffiliations([...myAffiliations, product]);
        alert(`Sucesso! Você agora é afiliado do produto "${product.name}". Confira no menu Afiliados.`);
    } else {
        alert("Você já é afiliado deste produto.");
    }
  };

  const openCheckoutEditor = (product: Product) => {
    setProductToEditCheckout(product);
    setCurrentView(ViewState.CHECKOUT_EDITOR);
  };

  const openProductEditor = (product: Product) => {
      setProductToEdit(product);
      setCurrentView(ViewState.CREATE_PRODUCT);
  };

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard products={products} />;
      case ViewState.PRODUCTS:
        return <ProductList 
                  products={products} 
                  onCreateNew={() => { setProductToEdit(null); setCurrentView(ViewState.CREATE_PRODUCT); }}
                  onEditProduct={openProductEditor}
                  onEditCheckout={openCheckoutEditor} 
               />;
      case ViewState.VITRINE: 
        return <Vitrine products={products} onAffiliateClick={handleAffiliateClick} />;
      case ViewState.AFFILIATES:
        return (
          <Affiliates 
            affiliatedProducts={myAffiliations} 
            onGoToVitrine={() => setCurrentView(ViewState.VITRINE)} 
          />
        );
      case ViewState.SALES:
        return <MySales />;
      case ViewState.FINANCE:
        return <Finance />;
      case ViewState.CREATE_PRODUCT:
        return (
          <CreateProduct 
            productToEdit={productToEdit}
            onProductCreated={handleProductCreated} 
            onCancel={() => { setProductToEdit(null); setCurrentView(ViewState.PRODUCTS); }} 
            onEditCheckout={openCheckoutEditor}
          />
        );
      case ViewState.CHECKOUT_EDITOR:
        if (!productToEditCheckout) return <ProductList products={products} onCreateNew={() => setCurrentView(ViewState.CREATE_PRODUCT)} onEditProduct={openProductEditor} onEditCheckout={openCheckoutEditor}/>;
        return (
            <CheckoutEditor 
                product={productToEditCheckout}
                onSave={(p) => { handleProductUpdated(p); }}
                onBack={() => setCurrentView(ViewState.PRODUCTS)}
            />
        );
      case ViewState.INTEGRATIONS:
        return <Integrations />;
      default:
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p className="text-xl font-semibold">Módulo em Desenvolvimento</p>
                <p className="text-sm mt-2">A funcionalidade {currentView} estará disponível em breve.</p>
            </div>
        );
    }
  };

  // If in full screen editor mode, don't show sidebar/header
  if (currentView === ViewState.CHECKOUT_EDITOR) {
      return (
        <div className="min-h-screen bg-[#161b22] text-gray-100 font-sans">
            {renderView()}
        </div>
      );
  }

  return (
    <div className="flex min-h-screen bg-[#161b22] text-gray-100 font-sans">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <header className="h-16 bg-[#161b22] border-b border-gray-800 flex items-center justify-between px-4 md:px-8 z-20 shrink-0">
            <div className="flex items-center gap-4">
                 <button 
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                >
                    <Menu className="w-6 h-6" />
                </button>
                
                <div className="hidden md:flex items-center relative">
                    <Search className="w-4 h-4 text-gray-500 absolute left-3" />
                    <input 
                        type="text" 
                        placeholder="Buscar..." 
                        className="bg-[#0f1419] border border-gray-800 rounded-full py-1.5 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:border-emerald-500 w-64"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
                 {/* Test Checkout Button */}
                 {products.length > 0 && (
                     <button 
                        onClick={() => setCheckoutProduct(products[0])}
                        className="text-xs bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/30 hover:bg-emerald-500/20"
                     >
                        Testar Checkout
                     </button>
                 )}

                <div className="flex items-center gap-2 bg-[#0f1419] rounded-full p-1 border border-gray-800">
                    <button className="p-1.5 rounded-full bg-gray-700 text-gray-300">
                        <Moon className="w-3 h-3" />
                    </button>
                </div>

                <div className="relative">
                    <Bell className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">4</span>
                </div>

                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 border border-gray-700 cursor-pointer overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                </div>
            </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar bg-[#161b22]">
          <div className="max-w-7xl mx-auto pb-10">
             {renderView()}
          </div>
        </main>

        {checkoutProduct && (
            <Checkout 
                product={checkoutProduct} 
                onClose={() => setCheckoutProduct(null)} 
            />
        )}

      </div>
    </div>
  );
};

export default App;