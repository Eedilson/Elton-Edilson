
import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, Moon, LogIn, Lock, Mail, UserPlus, LogOut } from 'lucide-react';
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
import MembersArea from './components/MembersArea';
import { ViewState, Product } from './types';
import { SimbaCloud } from './services/cloudService';

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(null); // Logged User Email
  const [loading, setLoading] = useState(true);

  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [products, setProducts] = useState<Product[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [myAffiliations, setMyAffiliations] = useState<Product[]>([]);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  
  // State for Editing
  const [productToEditCheckout, setProductToEditCheckout] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Check for existing session
  useEffect(() => {
      const storedUser = SimbaCloud.getCurrentUserId();
      if (storedUser) {
          setUser(storedUser);
      }
      setLoading(false);
  }, []);

  // Helper to load products
  const loadProducts = async () => {
      if (!user) return;
      // Load products specific to the CURRENT_USER_ID set in cloudService
      const loaded = await SimbaCloud.getProducts();
      setProducts(loaded);
  };

  // Auth Handler
  const handleLogin = (email: string) => {
      setLoading(true);
      setTimeout(() => {
          SimbaCloud.setUserId(email); // IMPORTANT: This segregates the data
          setUser(email);
          setLoading(false);
          loadProducts(); // Load fresh data for this user
          setCurrentView(ViewState.DASHBOARD);
      }, 800);
  };

  const handleLogout = () => {
      SimbaCloud.logout();
      setUser(null);
      setProducts([]); // Clear local state immediately
      setProductToEdit(null);
      setProductToEditCheckout(null);
  };

  // Reload when switching views if necessary
  useEffect(() => {
    if (user) loadProducts();
  }, [currentView, user]);

  const handleProductCreated = async (newProduct: Product) => {
    await loadProducts();
    setProductToEdit(null);
    setCurrentView(ViewState.PRODUCTS);
  };

  const handleProductUpdated = async (updatedProduct: Product) => {
    await loadProducts();
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
      case ViewState.MEMBERS_AREA:
        return <MembersArea products={products} />;
      case ViewState.CREATE_PRODUCT:
        return (
          <CreateProduct 
            existingProducts={products}
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

  // --- LOGIN SCREEN ---
  if (!user) {
      if (loading) return <div className="min-h-screen bg-[#0f1419] flex items-center justify-center text-white">Carregando Simba...</div>;
      return <LoginScreen onLogin={handleLogin} loading={loading} />;
  }

  // --- MAIN APP ---
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

                <div className="relative group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 border border-gray-700 cursor-pointer overflow-hidden flex items-center justify-center text-xs font-bold text-white">
                        {user.substring(0, 2).toUpperCase()}
                    </div>
                    
                    {/* Logout Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-[#1e2329] border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="p-3 border-b border-gray-700">
                            <p className="text-xs text-gray-400">Logado como</p>
                            <p className="text-sm font-bold text-white truncate">{user}</p>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" /> Sair
                        </button>
                    </div>
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
                allProducts={products}
                onClose={() => setCheckoutProduct(null)} 
            />
        )}

      </div>
    </div>
  );
};

const LoginScreen = ({ onLogin, loading }: { onLogin: (email: string) => void, loading: boolean }) => {
    const [email, setEmail] = useState('');
    const [mode, setMode] = useState<'login' | 'register'>('login');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(email) onLogin(email);
    };

    return (
        <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-4">
            <div className="bg-[#161b22] border border-gray-800 rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/50">
                        <span className="text-white font-black text-3xl">S</span>
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white text-center mb-2">
                    {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta no SIMBA'}
                </h2>
                <p className="text-gray-400 text-center mb-8 text-sm">
                    {mode === 'login' ? 'Acesse seus produtos digitais.' : 'Comece a vender em Moçambique hoje.'}
                </p>

                {/* Toggle Mode */}
                <div className="flex bg-[#0f1419] p-1 rounded-lg mb-6 border border-gray-800">
                    <button 
                        onClick={() => setMode('login')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${mode === 'login' ? 'bg-[#1e2329] text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Entrar
                    </button>
                    <button 
                        onClick={() => setMode('register')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${mode === 'register' ? 'bg-[#1e2329] text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Criar Conta
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Seu E-mail</label>
                        <div className="relative">
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="exemplo@email.com"
                                className="w-full bg-[#0f1419] border border-gray-700 rounded-xl p-4 pl-12 text-white outline-none focus:border-emerald-500 transition-colors"
                            />
                            <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Senha</label>
                        <div className="relative">
                            <input 
                                type="password" 
                                placeholder="••••••••"
                                className="w-full bg-[#0f1419] border border-gray-700 rounded-xl p-4 pl-12 text-white outline-none focus:border-emerald-500 transition-colors"
                            />
                            <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        {loading 
                            ? 'Processando...' 
                            : (mode === 'login' ? <><LogIn className="w-5 h-5" /> Acessar Painel</> : <><UserPlus className="w-5 h-5" /> Criar Conta Grátis</>)
                        }
                    </button>
                    
                    <p className="text-xs text-gray-500 text-center mt-4">
                        Ao continuar, você concorda com os Termos de Uso. <br/>
                        Seus dados são privados e isolados nesta conta.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default App;
