
import React, { useState, useEffect } from 'react';
import { Product, Offer, Coproducer, Coupon, OrderBump, Course } from '../types';
import { SimbaCloud } from '../services/cloudService';
import { 
  Save, X, Image as ImageIcon, CheckCircle, 
  FileText, Smartphone, MonitorPlay, UploadCloud, 
  Trash2, Plus, Users, Layout, CreditCard, ArrowLeft,
  Link as LinkIcon, Handshake, Palette, ExternalLink, Copy,
  Target, Ticket, ArrowUpCircle, Settings, FolderOpen,
  GitMerge, ArrowRight, CornerDownRight, Globe
} from 'lucide-react';

interface CreateProductProps {
  existingProducts?: Product[]; // Lista de produtos para selecionar upsell/downsell
  productToEdit?: Product | null;
  onProductCreated: (product: Product) => void;
  onCancel: () => void;
  onEditCheckout: (product: Product) => void;
}

type Tab = 'type' | 'geral' | 'precos' | 'conteudo' | 'links' | 'afiliacao' | 'checkout' | 'coproducao' | 'pixels' | 'coupons' | 'orderbump' | 'funnel';

const CreateProduct: React.FC<CreateProductProps> = ({ existingProducts = [], productToEdit, onProductCreated, onCancel, onEditCheckout }) => {
  const [activeTab, setActiveTab] = useState<Tab>(productToEdit ? 'geral' : 'type'); 
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(productToEdit?.imageUrl || null);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  
  // Load courses available for selection
  useEffect(() => {
      const fetchCourses = async () => {
          const courses = await SimbaCloud.getCourses();
          setAvailableCourses(courses);
      };
      fetchCourses();
  }, []);

  // Estado Inicial do Formulário
  const initialData: Partial<Product> = productToEdit ? { ...productToEdit } : {
    id: Date.now().toString(),
    name: '',
    description: '',
    price: 0,
    offers: [{ id: '1', name: 'Oferta Padrão', price: 0, isDefault: true }],
    coproducers: [],
    paymentType: 'unique',
    category: 'Educacional',
    status: 'active', // Sempre ativo para aparecer na lista
    productType: 'ebook',
    isAffiliationEnabled: true, // Sempre habilitado para aparecer na Vitrine
    commissionPercentage: 0.1, // 10%
    couponsEnabled: false,
    coupons: [],
    orderBumps: [],
    pixels: {},
    funnel: {},
    linkedCourseId: '', // Connection to Members Area
    checkoutConfig: {
      components: ['header', 'video', 'form', 'seal'], 
      primaryColor: '#10b981',
      showCountdown: false,
      showTestimonials: false,
    },
    links: {
        checkout: '',
        salesPage: ''
    }
  };

  const [formData, setFormData] = useState<Partial<Product>>(initialData);

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;
      setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = await SimbaCloud.uploadImage(file);
      setPreviewImage(imageUrl);
      setFormData(prev => ({ ...prev, imageUrl }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const fileUrl = await SimbaCloud.uploadImage(file);
          setFormData(prev => ({ ...prev, productFile: fileUrl }));
      }
  };

  const handleOfferChange = (index: number, field: keyof Offer, value: any) => {
      const updatedOffers = [...(formData.offers || [])];
      updatedOffers[index] = { ...updatedOffers[index], [field]: value };
      
      // Atualiza o preço principal se for a oferta padrão
      if (updatedOffers[index].isDefault) {
          setFormData(prev => ({ ...prev, offers: updatedOffers, price: Number(updatedOffers[index].price) }));
      } else {
          setFormData(prev => ({ ...prev, offers: updatedOffers }));
      }
  };

  const addOffer = () => {
      const newOffer: Offer = {
          id: Date.now().toString(),
          name: 'Novo Preço (Promoção)',
          price: Number(formData.price) || 0,
          isDefault: false
      };
      setFormData(prev => ({ ...prev, offers: [...(prev.offers || []), newOffer] }));
  };

  const removeOffer = (index: number) => {
      const updatedOffers = [...(formData.offers || [])];
      if (updatedOffers[index].isDefault) {
          alert("Não é possível remover a oferta padrão.");
          return;
      }
      updatedOffers.splice(index, 1);
      setFormData(prev => ({ ...prev, offers: updatedOffers }));
  };

  // Pixel Handlers
  const handlePixelChange = (provider: 'facebook' | 'googleAds' | 'tiktok' | 'ga4', field: string, value: string) => {
      setFormData(prev => ({
          ...prev,
          pixels: {
              ...prev.pixels,
              [provider]: {
                  ...prev.pixels?.[provider],
                  [field]: value
              }
          }
      }));
  };

  // Coupon Handlers
  const addCoupon = () => {
      const newCoupon: Coupon = { id: Date.now().toString(), code: '', percentage: 10, isActive: true };
      setFormData(prev => ({ ...prev, coupons: [...(prev.coupons || []), newCoupon] }));
  };
  
  const updateCoupon = (id: string, field: keyof Coupon, value: any) => {
      setFormData(prev => ({
          ...prev,
          coupons: (prev.coupons || []).map(c => c.id === id ? { ...c, [field]: value } : c)
      }));
  };

  const removeCoupon = (id: string) => {
      setFormData(prev => ({
          ...prev,
          coupons: (prev.coupons || []).filter(c => c.id !== id)
      }));
  };

  // Order Bump Handlers
  const addOrderBump = () => {
      const newBump: OrderBump = { 
          id: Date.now().toString(), 
          productId: '',
          title: 'Leve também...', 
          price: 0, 
          description: 'Adicione isso ao seu pedido por um preço especial.', 
          isEnabled: true 
      };
      setFormData(prev => ({ ...prev, orderBumps: [...(prev.orderBumps || []), newBump] }));
  };

  const updateOrderBump = (id: string, field: keyof OrderBump, value: any) => {
      setFormData(prev => {
          const bumps = [...(prev.orderBumps || [])];
          const index = bumps.findIndex(b => b.id === id);
          if (index === -1) return prev;

          // Se mudar o produto, atualiza dados automaticamente
          if (field === 'productId') {
              const product = existingProducts.find(p => p.id === value);
              if (product) {
                  bumps[index].title = `Leve também: ${product.name}`;
                  bumps[index].price = product.price; // Preço padrão, usuário pode mudar
                  bumps[index].imageUrl = product.imageUrl;
              }
          }
          
          bumps[index] = { ...bumps[index], [field]: value };
          return { ...prev, orderBumps: bumps };
      });
  };

  const removeOrderBump = (id: string) => {
      setFormData(prev => ({
          ...prev,
          orderBumps: (prev.orderBumps || []).filter(b => b.id !== id)
      }));
  };


  const saveToCloud = async (): Promise<Product | null> => {
    // Validação Relaxada para permitir "Salvar a cada etapa" (Draft Mode)
    if (!formData.name) {
        alert("Pelo menos o nome do produto é necessário para salvar.");
        return null;
    }
   
    try {
        const finalProduct: Product = {
            id: formData.id!,
            name: formData.name,
            description: formData.description || '',
            price: Number(formData.price) || (formData.offers && formData.offers[0] ? Number(formData.offers[0].price) : 0),
            offers: formData.offers || [],
            coproducers: formData.coproducers || [],
            format: formData.productType === 'ebook' ? 'PDF' : 'APP',
            productType: formData.productType || 'ebook',
            productFile: formData.productFile,
            accessLink: formData.accessLink,
            salesCount: productToEdit?.salesCount || 0,
            revenue: productToEdit?.revenue || 0,
            status: formData.status || 'active',
            isAffiliationEnabled: formData.isAffiliationEnabled,
            affiliateMaterialLink: formData.affiliateMaterialLink,
            dateCreated: productToEdit?.dateCreated || new Date().toISOString(),
            imageUrl: formData.imageUrl,
            category: formData.category,
            paymentType: formData.paymentType,
            checkoutConfig: formData.checkoutConfig,
            salesPageUrl: formData.salesPageUrl,
            links: productToEdit?.links, 
            commissionPercentage: Number(formData.commissionPercentage) || 0,
            tags: formData.tags,
            pixels: formData.pixels,
            coupons: formData.coupons,
            couponsEnabled: formData.couponsEnabled,
            orderBumps: formData.orderBumps,
            funnel: formData.funnel,
            linkedCourseId: formData.linkedCourseId,
            // Mantém legacy por enquanto, mas linkedCourseId deve ter preferência na lógica de entrega
            courseModules: formData.courseModules, 
            welcomeVideoUrl: formData.welcomeVideoUrl
        };

        const savedProduct = await SimbaCloud.saveProduct(finalProduct);
        return savedProduct;
    } catch(e) {
        console.error(e);
        alert("Erro ao salvar produto. Tente novamente.");
        return null;
    }
  };

  const handleSave = async () => {
      setIsSaving(true);
      const saved = await saveToCloud();
      setIsSaving(false);
      
      if (saved) {
          onProductCreated(saved);
      }
  };

  // --- RENDER ---

  if (activeTab === 'type') {
      return (
          <div className="max-w-4xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4">
              <button onClick={onCancel} className="mb-6 text-gray-400 hover:text-white flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <h2 className="text-3xl font-bold text-white mb-2">O que você vai vender?</h2>
              <p className="text-gray-400 mb-8">Escolha o formato do seu produto digital.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button 
                    onClick={() => { setFormData(p => ({...p, productType: 'ebook'})); setActiveTab('geral'); }}
                    className="bg-[#1e2329] p-8 rounded-xl border border-gray-800 hover:border-emerald-500 hover:bg-emerald-500/5 transition-all group text-left"
                  >
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
                          <FileText className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Ebook / PDF</h3>
                      <p className="text-sm text-gray-500">Livros digitais, apostilas e arquivos para download.</p>
                  </button>

                  <button 
                    onClick={() => { setFormData(p => ({...p, productType: 'course'})); setActiveTab('geral'); }}
                    className="bg-[#1e2329] p-8 rounded-xl border border-gray-800 hover:border-blue-500 hover:bg-blue-500/5 transition-all group text-left"
                  >
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                          <MonitorPlay className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Curso Online</h3>
                      <p className="text-sm text-gray-500">Conecte uma Área de Membros já criada.</p>
                  </button>

                  <button 
                    onClick={() => { setFormData(p => ({...p, productType: 'application'})); setActiveTab('geral'); }}
                    className="bg-[#1e2329] p-8 rounded-xl border border-gray-800 hover:border-purple-500 hover:bg-purple-500/5 transition-all group text-left"
                  >
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-purple-500 mb-4 group-hover:scale-110 transition-transform">
                          <Smartphone className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Aplicativo / Software</h3>
                      <p className="text-sm text-gray-500">Venda acesso a ferramentas ou serviços SaaS.</p>
                  </button>
              </div>
          </div>
      );
  }

  // Formulário Principal
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header de Ações */}
        <div className="flex justify-between items-center bg-[#1e2329] p-4 rounded-xl border border-gray-800 sticky top-0 z-30 shadow-lg">
            <div className="flex items-center gap-4">
                 <button onClick={onCancel} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                     <ArrowLeft className="w-5 h-5 text-gray-400" />
                 </button>
                 <div>
                     <h2 className="text-lg font-bold text-white">{formData.name || 'Novo Produto'}</h2>
                     <span className="text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2 py-0.5 rounded">
                         {formData.status === 'active' ? 'Publicado' : 'Rascunho'}
                     </span>
                 </div>
            </div>
            <div className="flex gap-3">
                 <button 
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                 >
                     Cancelar
                 </button>
                 <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-50"
                 >
                     {isSaving ? 'Salvando...' : (
                         <>
                            <Save className="w-4 h-4" /> Salvar Produto
                         </>
                     )}
                 </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar de Navegação do Produto */}
            <div className="lg:col-span-1 space-y-2">
                 {[
                     { id: 'geral', label: 'Geral', icon: Layout },
                     { id: 'precos', label: 'Preços & Ofertas', icon: CreditCard },
                     { id: 'conteudo', label: 'Conteúdo / Arquivos', icon: UploadCloud },
                     { id: 'funnel', label: 'Funil de Vendas', icon: GitMerge }, // New
                     { id: 'pixels', label: 'Pixels de Conversão', icon: Target },
                     { id: 'orderbump', label: 'Order Bump', icon: ArrowUpCircle },
                     { id: 'coupons', label: 'Cupons de Desconto', icon: Ticket },
                     { id: 'links', label: 'Links de Divulgação', icon: LinkIcon },
                     { id: 'afiliacao', label: 'Afiliação', icon: Handshake },
                     { id: 'checkout', label: 'Checkout Editor', icon: Palette },
                     { id: 'coproducao', label: 'Coprodução', icon: Users },
                 ].map(item => (
                     <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as Tab)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === item.id 
                            ? 'bg-emerald-600 text-white shadow-lg' 
                            : 'bg-[#1e2329] text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent hover:border-gray-700'
                        }`}
                     >
                         <item.icon className="w-4 h-4" /> {item.label}
                     </button>
                 ))}
            </div>

            {/* Área de Conteúdo */}
            <div className="lg:col-span-3 space-y-6">
                
                {/* TAB: GERAL */}
                {activeTab === 'geral' && (
                    <div className="bg-[#1e2329] p-6 rounded-xl border border-gray-800 space-y-6 animate-in slide-in-from-right-4">
                        <div className="flex gap-6 flex-col md:flex-row">
                             <div className="flex-shrink-0">
                                 <label className="block text-sm font-bold text-gray-400 mb-2">Imagem do Produto</label>
                                 <div className="relative w-40 h-40 bg-gray-800 rounded-xl border-2 border-dashed border-gray-700 hover:border-emerald-500 transition-colors flex items-center justify-center overflow-hidden group cursor-pointer">
                                     {previewImage ? (
                                         <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                     ) : (
                                         <div className="text-center p-2">
                                             <ImageIcon className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                                             <span className="text-xs text-gray-500">600x600px</span>
                                         </div>
                                     )}
                                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                         <span className="text-xs text-white font-bold">Alterar</span>
                                     </div>
                                     <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                 </div>
                             </div>

                             <div className="flex-1 space-y-4">
                                 <div>
                                     <label className="block text-sm font-bold text-gray-400 mb-1">Nome do Produto</label>
                                     <input 
                                        name="name"
                                        value={formData.name} 
                                        onChange={handleInputChange}
                                        className="w-full bg-[#0f1419] border border-gray-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" 
                                        placeholder="Ex: Curso de Marketing Digital"
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-sm font-bold text-gray-400 mb-1">Descrição (para Página de Vendas)</label>
                                     <textarea 
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full bg-[#0f1419] border border-gray-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none resize-none" 
                                        placeholder="Descreva o que seu produto entrega..."
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-sm font-bold text-gray-400 mb-1">Categoria</label>
                                     <select 
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#0f1419] border border-gray-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                                     >
                                         <option>Educacional</option>
                                         <option>Finanças</option>
                                         <option>Saúde & Fitness</option>
                                         <option>Desenvolvimento Pessoal</option>
                                         <option>Tecnologia</option>
                                     </select>
                                 </div>
                             </div>
                        </div>
                    </div>
                )}

                {/* TAB: PREÇOS */}
                {activeTab === 'precos' && (
                     <div className="bg-[#1e2329] p-6 rounded-xl border border-gray-800 space-y-6 animate-in slide-in-from-right-4">
                        <div>
                             <h3 className="text-lg font-bold text-white mb-1">Preços e Ofertas</h3>
                             <p className="text-sm text-gray-500">
                                 Crie diferentes preços para o mesmo produto (Ex: Promoção de Natal, Teste A/B).
                                 <br/> <span className="text-emerald-500">Cada preço gera um link de checkout único.</span>
                             </p>
                        </div>
                        
                        {formData.offers?.map((offer, index) => (
                            <div key={offer.id} className="bg-[#0f1419] border border-gray-700 rounded-lg p-4 flex flex-col gap-4 relative">
                                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                                    <span className="text-sm font-bold text-emerald-500">Preço #{index + 1}</span>
                                    {offer.isDefault ? (
                                        <span className="text-xs bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded">Principal</span>
                                    ) : (
                                        <button 
                                            onClick={() => removeOffer(index)}
                                            className="text-gray-500 hover:text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Nome Interno (Identificação)</label>
                                        <input 
                                            value={offer.name}
                                            onChange={(e) => handleOfferChange(index, 'name', e.target.value)}
                                            placeholder="Ex: Oferta Black Friday"
                                            className="w-full bg-[#1e2329] border border-gray-700 rounded p-2 text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Preço (MZN)</label>
                                        <input 
                                            type="number"
                                            value={offer.price}
                                            onChange={(e) => handleOfferChange(index, 'price', e.target.value)}
                                            className="w-full bg-[#1e2329] border border-gray-700 rounded p-2 text-white text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        <button 
                            onClick={addOffer}
                            className="w-full py-3 border border-dashed border-gray-700 rounded-lg text-gray-500 hover:text-white hover:border-emerald-500 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Adicionar Novo Preço
                        </button>
                     </div>
                )}

                {/* TAB: CONTEÚDO (MODIFICADO: SELETOR DE CURSO) */}
                {activeTab === 'conteudo' && (
                     <div className="bg-[#1e2329] p-6 rounded-xl border border-gray-800 space-y-6 animate-in slide-in-from-right-4">
                        
                        {formData.productType === 'course' ? (
                            <>
                                <div>
                                     <h3 className="text-lg font-bold text-white mb-1">Entrega do Conteúdo</h3>
                                     <p className="text-sm text-gray-500">Selecione qual Área de Membros (Curso) o cliente receberá ao comprar este produto.</p>
                                </div>
                                
                                <div className="bg-[#0f1419] p-6 rounded-lg border border-gray-700">
                                    <label className="block text-sm font-bold text-gray-300 mb-3">Selecione a Área de Membros</label>
                                    
                                    {availableCourses.length > 0 ? (
                                        <select 
                                            value={formData.linkedCourseId || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, linkedCourseId: e.target.value }))}
                                            className="w-full bg-[#1e2329] border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-emerald-500 transition-colors"
                                        >
                                            <option value="">-- Selecione um curso --</option>
                                            {availableCourses.map(course => (
                                                <option key={course.id} value={course.id}>{course.title}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="text-center py-6">
                                            <p className="text-gray-500 text-sm mb-4">Nenhum curso encontrado na sua Área de Membros.</p>
                                            <p className="text-xs text-gray-600">Vá em "Área de Membros" no menu lateral para criar o conteúdo do curso primeiro.</p>
                                        </div>
                                    )}

                                    {formData.linkedCourseId && (
                                        <div className="mt-4 flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-4 py-3 rounded-lg border border-emerald-500/20">
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="font-bold text-sm">Curso conectado com sucesso!</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                     <h3 className="text-lg font-bold text-white mb-1">Entrega do Produto</h3>
                                     <p className="text-sm text-gray-500">Como o cliente recebe o acesso após pagar.</p>
                                </div>

                                {formData.productType === 'ebook' && (
                                     <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-emerald-500 transition-colors bg-[#0f1419]">
                                         <UploadCloud className="w-10 h-10 text-gray-500 mb-4" />
                                         <h4 className="text-white font-bold mb-1">Upload do Arquivo (PDF/EPUB)</h4>
                                         <p className="text-sm text-gray-500 mb-4">Máximo 500MB. Formatos aceitos: .pdf, .zip, .epub</p>
                                         <div className="relative">
                                             <input type="file" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.zip,.epub" />
                                             <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold">
                                                 Selecionar Arquivo
                                             </button>
                                         </div>
                                         {formData.productFile && (
                                             <div className="mt-4 flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg">
                                                 <CheckCircle className="w-4 h-4" /> Arquivo carregado com sucesso
                                             </div>
                                         )}
                                     </div>
                                )}

                                {formData.productType === 'application' && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Link de Acesso Externo</label>
                                        <input 
                                            name="accessLink"
                                            value={formData.accessLink || ''}
                                            onChange={handleInputChange}
                                            placeholder="https://app.seusistema.com/cadastro"
                                            className="w-full bg-[#0f1419] border border-gray-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">O cliente receberá este link por e-mail após a confirmação do pagamento.</p>
                                    </div>
                                )}
                            </>
                        )}
                     </div>
                )}

                {/* TAB: FUNIL (Novo) */}
                {activeTab === 'funnel' && (
                     <div className="bg-[#1e2329] p-6 rounded-xl border border-gray-800 space-y-6 animate-in slide-in-from-right-4">
                         <div>
                             <h3 className="text-lg font-bold text-white mb-1">Funil de Vendas (Pós-compra)</h3>
                             <p className="text-sm text-gray-500">Configure para onde o cliente vai após comprar o produto principal.</p>
                        </div>
                        
                        {/* Upsell Configuration */}
                        <div className="bg-[#0f1419] border border-gray-700 rounded-lg p-6 space-y-4 relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-2 opacity-5">
                                <ArrowUpCircle className="w-32 h-32" />
                             </div>
                             <div className="flex items-start gap-3 relative z-10">
                                 <div className="p-2 bg-emerald-500/10 rounded text-emerald-500">
                                     <ArrowUpCircle className="w-6 h-6" />
                                 </div>
                                 <div className="flex-1 space-y-4">
                                     <div>
                                        <h4 className="font-bold text-white">Upsell (Redirecionamento)</h4>
                                        <p className="text-xs text-gray-500 mb-3">
                                            Após a compra, o cliente será levado para este link (sua página com vídeo e botão de compra).
                                        </p>
                                     </div>
                                     
                                     <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Página de Vendas do Upsell (Link Externo)</label>
                                        <div className="relative">
                                            <input 
                                                type="url"
                                                placeholder="https://seu-site.com/oferta-vip"
                                                className="w-full bg-[#1e2329] border border-gray-700 rounded-lg p-3 pl-10 text-white text-sm focus:border-emerald-500 outline-none"
                                                value={formData.funnel?.upsellPageUrl || ''}
                                                onChange={(e) => setFormData(prev => ({ 
                                                    ...prev, 
                                                    funnel: { ...prev.funnel, upsellPageUrl: e.target.value } 
                                                }))}
                                            />
                                            <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                        </div>
                                     </div>

                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Produto Ofertado (Para referência)</label>
                                            <select 
                                                className="w-full bg-[#1e2329] border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-emerald-500 outline-none"
                                                value={formData.funnel?.upsellProductId || ''}
                                                onChange={(e) => setFormData(prev => ({ 
                                                    ...prev, 
                                                    funnel: { ...prev.funnel, upsellProductId: e.target.value } 
                                                }))}
                                            >
                                                <option value="">-- Selecione o produto --</option>
                                                {existingProducts.filter(p => p.id !== formData.id).map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Preço Especial (Opcional)</label>
                                            <input 
                                                type="number"
                                                placeholder="Deixe vazio para usar preço original"
                                                className="w-full bg-[#1e2329] border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-emerald-500 outline-none"
                                                value={formData.funnel?.upsellPrice || ''}
                                                onChange={(e) => setFormData(prev => ({ 
                                                    ...prev, 
                                                    funnel: { ...prev.funnel, upsellPrice: Number(e.target.value) } 
                                                }))}
                                            />
                                        </div>
                                     </div>
                                 </div>
                             </div>
                        </div>

                         {/* Downsell Configuration */}
                        {formData.funnel?.upsellPageUrl && (
                            <div className="ml-8 border-l-2 border-gray-700 pl-8 relative">
                                <CornerDownRight className="absolute -left-2.5 top-0 w-5 h-5 text-gray-700" />
                                <div className="bg-[#0f1419] border border-gray-700 rounded-lg p-6 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-yellow-500/10 rounded text-yellow-500">
                                            <ArrowRight className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <h4 className="font-bold text-white">Downsell (Link de Recuperação)</h4>
                                                <p className="text-xs text-gray-500 mb-3">Se o cliente recusar o Upsell na sua página, envie ele para cá.</p>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1">Página do Downsell (Link Externo)</label>
                                                <div className="relative">
                                                    <input 
                                                        type="url"
                                                        placeholder="https://seu-site.com/oferta-basica"
                                                        className="w-full bg-[#1e2329] border border-gray-700 rounded-lg p-3 pl-10 text-white text-sm focus:border-yellow-500 outline-none"
                                                        value={formData.funnel?.downsellPageUrl || ''}
                                                        onChange={(e) => setFormData(prev => ({ 
                                                            ...prev, 
                                                            funnel: { ...prev.funnel, downsellPageUrl: e.target.value } 
                                                        }))}
                                                    />
                                                    <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-1">Produto Ofertado</label>
                                                    <select 
                                                        className="w-full bg-[#1e2329] border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-yellow-500 outline-none"
                                                        value={formData.funnel?.downsellProductId || ''}
                                                        onChange={(e) => setFormData(prev => ({ 
                                                            ...prev, 
                                                            funnel: { ...prev.funnel, downsellProductId: e.target.value } 
                                                        }))}
                                                    >
                                                        <option value="">-- Selecione o produto --</option>
                                                        {existingProducts.filter(p => p.id !== formData.id && p.id !== formData.funnel?.upsellProductId).map(p => (
                                                            <option key={p.id} value={p.id}>{p.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-300 flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            <p>
                                Se o campo "Página de Vendas do Upsell" estiver vazio, o cliente será direcionado para a página de Obrigado padrão do sistema.
                            </p>
                        </div>

                     </div>
                )}
                
                {/* Outras abas mantidas... */}
                {/* TAB: CHECKOUT (Novo/Editado) */}
                {activeTab === 'checkout' && (
                    <div className="bg-[#1e2329] p-6 rounded-xl border border-gray-800 space-y-6 animate-in slide-in-from-right-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Aparência do Checkout</h3>
                                <p className="text-sm text-gray-500">Personalize a página de pagamento.</p>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center" style={{ backgroundColor: formData.checkoutConfig?.primaryColor }}>
                                <Palette className="w-5 h-5 text-white mix-blend-difference" />
                            </div>
                        </div>

                        {productToEdit ? (
                            <div className="bg-gradient-to-r from-emerald-900/20 to-[#0f1419] border border-emerald-500/30 rounded-xl p-8 text-center">
                                <MonitorPlay className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                                <h4 className="text-xl font-bold text-white mb-2">Editor Visual de Checkout</h4>
                                <p className="text-gray-400 mb-6 max-w-md mx-auto">Adicione vídeos, cronômetros de escassez, selos de garantia e personalize as cores em tempo real.</p>
                                <button 
                                    onClick={() => onEditCheckout(productToEdit)}
                                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition-all transform hover:scale-105"
                                >
                                    Abrir Editor Visual
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                Salve o produto primeiro para acessar o editor visual completo.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default CreateProduct;
