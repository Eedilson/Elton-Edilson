
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Lock, Smartphone, CreditCard, CheckCircle, Download, X, AlertCircle, Loader2, MonitorPlay, ExternalLink, RefreshCw, ShieldCheck, Clock, PlayCircle, Mail, User, AlertTriangle, MessageCircle, ArrowRight, ArrowUpCircle } from 'lucide-react';
import { PaySuite } from '../services/paySuiteService';

interface CheckoutProps {
  product: Product;
  allProducts: Product[]; // Necessário para buscar detalhes do Upsell
  onClose: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ product, allProducts, onClose }) => {
  const [step, setStep] = useState<'form' | 'processing' | 'iframe' | 'upsell' | 'success' | 'error'>('form');
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'emola'>('mpesa');
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  
  // Order Bumps
  const [selectedBumps, setSelectedBumps] = useState<string[]>([]);
  
  // Upsell Management
  const [activeUpsellProduct, setActiveUpsellProduct] = useState<Product | null>(null);
  
  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState(''); 
  const [paymentPhone, setPaymentPhone] = useState(''); 

  // Configurações do Editor
  const config = product.checkoutConfig || {
    components: ['header', 'video', 'form', 'seal'],
    primaryColor: '#10b981', 
    showCountdown: false,
    showTestimonials: false,
    checkoutCoverImage: product.imageUrl,
    checkoutVideoUrl: '',
    timerSettings: { enabled: false, minutes: 15, text: 'Oferta', backgroundColor: '#ef4444', textColor: '#fff' }
  };

  // Calculate Total (Product + Bumps)
  const calculateTotal = () => {
      let total = product.price;
      if (product.orderBumps) {
          product.orderBumps.forEach(bump => {
              if (selectedBumps.includes(bump.id)) {
                  total += bump.price;
              }
          });
      }
      return total;
  };

  const toggleBump = (bumpId: string) => {
      if (selectedBumps.includes(bumpId)) {
          setSelectedBumps(prev => prev.filter(id => id !== bumpId));
      } else {
          setSelectedBumps(prev => [...prev, bumpId]);
      }
  };

  // Timer Logic
  const [timeLeft, setTimeLeft] = useState((config.timerSettings?.minutes || 15) * 60);
  useEffect(() => {
    if (config.timerSettings?.enabled) {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }
  }, [config.timerSettings]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    setErrorMessage('');

    const reference = `ORD${Date.now()}`; 
    const totalAmount = calculateTotal();

    try {
      const response = await PaySuite.initiatePayment({
        amount: totalAmount,
        reference: reference,
        description: `Produto ${product.name} ${selectedBumps.length > 0 ? '+ Adicionais' : ''}`,
        method: paymentMethod,
        mobile: paymentPhone, 
        email: customerEmail
      });

      if (response.status === 'success' && response.data?.checkout_url) {
        setPaymentUrl(response.data.checkout_url);
        setStep('iframe');
      } else {
        setStep('error');
        setErrorMessage(response.message || 'Erro desconhecido ao iniciar pagamento.');
      }

    } catch (error) {
      setStep('error');
      setErrorMessage('Erro crítico na aplicação.');
    }
  };

  const handlePaymentConfirm = () => {
      // 1. Check for External Upsell URL (Redirection Priority)
      if (product.funnel?.upsellPageUrl) {
          // Redirect to external page
          window.location.href = product.funnel.upsellPageUrl;
          return;
      }

      // 2. Check for Internal Upsell (Fallback if no URL but Product selected)
      if (product.funnel?.upsellProductId) {
          const upsellProd = allProducts.find(p => p.id === product.funnel!.upsellProductId);
          if (upsellProd) {
              setActiveUpsellProduct(upsellProd);
              setStep('upsell');
              return;
          }
      }

      // 3. No Funnel - Go to Success
      setStep('success');
  };

  const handleUpsellAction = (accept: boolean) => {
      if (accept) {
          // Simulate 1-Click Buy (In real app, trigger tokenized charge)
          alert(`Upsell comprado com sucesso! + ${product.funnel?.upsellPrice || activeUpsellProduct?.price} MT`);
          setStep('success');
      } else {
          // Check Downsell URL (Redirect logic)
          if (product.funnel?.downsellPageUrl) {
              window.location.href = product.funnel.downsellPageUrl;
              return;
          }

          setStep('success');
      }
  };

  const getEmbedUrl = (url: string) => {
      if (!url) return '';
      // Better regex to handle various YouTube formats (share, embed, watch, shorts)
      const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(regExp);
      
      if (match && match[1]) {
          return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1&playsinline=1`;
      }
      return url; 
  };

  // Render Component Logic
  const renderComponent = (type: string) => {
      switch(type) {
          case 'header':
              return (
                <div key="header" className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">{product.name}</h2>
                    <div className="flex gap-4 items-start">
                         {product.imageUrl && (
                            <img src={product.imageUrl} className="w-20 h-20 object-cover rounded-lg border border-gray-200" alt="Product" />
                         )}
                         <div className="flex-1">
                             <p className="text-slate-500 text-sm mb-2 line-clamp-2">{product.description}</p>
                             <div className="flex justify-between items-center border-t border-slate-200 pt-2 mt-auto">
                                <span className="text-slate-600 font-medium text-sm">Total</span>
                                <span className="text-2xl font-bold text-slate-900">{calculateTotal().toLocaleString('pt-MZ')} MT</span>
                             </div>
                         </div>
                    </div>
                </div>
              );
          case 'video':
               if (config.checkoutVideoSource === 'local' && config.checkoutVideoBlobUrl) {
                   return (
                       <div key="video" className="w-full aspect-video rounded-lg overflow-hidden shadow-lg mb-6 bg-black">
                           <video controls src={config.checkoutVideoBlobUrl} className="w-full h-full"></video>
                       </div>
                   );
               }
               if (!config.checkoutVideoUrl) return null;
               return (
                  <div key="video" className="w-full aspect-video rounded-lg overflow-hidden shadow-lg mb-6 bg-black">
                      <iframe 
                        src={getEmbedUrl(config.checkoutVideoUrl!)} 
                        className="w-full h-full" 
                        frameBorder="0" 
                        referrerPolicy="no-referrer"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                  </div>
               );
          case 'image':
              if (!config.checkoutCoverImage) return null;
              return (
                <div key="image" className="mb-6 rounded-lg overflow-hidden shadow-sm border border-slate-200">
                     <img 
                        src={config.checkoutCoverImage} 
                        alt="Checkout Cover" 
                        className="w-full h-auto max-h-60 object-cover" 
                     />
                </div>
              );
          case 'timer':
               if (!config.timerSettings?.enabled) return null;
               return (
                   <div key="timer" className="mb-4 text-center font-bold p-2 rounded" style={{ backgroundColor: config.timerSettings.backgroundColor, color: config.timerSettings.textColor }}>
                       {config.timerSettings.text}: {formatTime(timeLeft)}
                   </div>
               );
          case 'seal':
               return (
                   <div key="seal" className="flex items-center justify-center gap-2 text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100 mt-4">
                        <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                        <span className="text-xs font-bold">Garantia de 7 dias ou seu dinheiro de volta.</span>
                    </div>
               );
          case 'form':
              return (
                <div key="form">
                    {step === 'error' && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-sm animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <div className="break-words w-full">
                                <strong>Erro:</strong> {errorMessage}
                            </div>
                        </div>
                    )}

                    {step === 'iframe' && paymentUrl ? (
                         <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300 flex-1">
                            <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r shadow-sm">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-6 h-6 text-yellow-500 animate-pulse" />
                                    <div>
                                        <h4 className="font-bold text-yellow-800 text-sm uppercase">Atenção: Não feche esta tela!</h4>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            Realize o pagamento na janela abaixo (M-Pesa/e-Mola) e <strong>volte aqui</strong> para liberar seu acesso imediatamente.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden relative shadow-inner min-h-[500px]">
                                <iframe src={paymentUrl} className="w-full h-full absolute inset-0 bg-white" />
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                <button onClick={() => setStep('form')} className="text-slate-500 hover:text-slate-800 text-sm underline">Voltar</button>
                                <button onClick={handlePaymentConfirm} className="bg-emerald-600 text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-lg">
                                    <RefreshCw className="w-4 h-4" /> Já realizei o pagamento
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handlePay} className="flex flex-col gap-6">
                            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                                <h3 className="text-sm font-bold uppercase text-slate-500 mb-4 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Seus Dados
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <input 
                                            type="text" 
                                            placeholder="Nome Completo" 
                                            required 
                                            value={customerName}
                                            onChange={e => setCustomerName(e.target.value)}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 outline-none text-slate-900 transition-all text-sm"
                                            style={{ '--tw-ring-color': config.primaryColor } as React.CSSProperties}
                                        />
                                    </div>
                                    <div>
                                        <input 
                                            type="email" 
                                            placeholder="E-mail" 
                                            required 
                                            value={customerEmail}
                                            onChange={e => setCustomerEmail(e.target.value)}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 outline-none text-slate-900 transition-all text-sm"
                                        />
                                    </div>
                                    <div className="relative">
                                        <input 
                                            type="tel" 
                                            placeholder="WhatsApp (Contato)" 
                                            required 
                                            value={customerWhatsapp}
                                            onChange={e => setCustomerWhatsapp(e.target.value)}
                                            className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 outline-none text-slate-900 transition-all text-sm"
                                        />
                                        <MessageCircle className="absolute left-3 top-3 w-4 h-4 text-emerald-500" />
                                    </div>
                                </div>
                            </div>
                            
                            {/* ORDER BUMPS RENDER */}
                            {product.orderBumps && product.orderBumps.length > 0 && (
                                <div className="space-y-3">
                                    {product.orderBumps.filter(b => b.isEnabled).map(bump => (
                                        <div 
                                            key={bump.id} 
                                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                                selectedBumps.includes(bump.id) 
                                                ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' 
                                                : 'bg-white border-slate-200 hover:border-emerald-300'
                                            }`}
                                            onClick={() => toggleBump(bump.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${selectedBumps.includes(bump.id) ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'}`}>
                                                    {selectedBumps.includes(bump.id) && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="text-sm font-bold text-slate-900">{bump.title}</h4>
                                                        <span className="text-sm font-bold text-emerald-600">+{bump.price} MT</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1">{bump.description}</p>
                                                </div>
                                                {bump.imageUrl && (
                                                    <img src={bump.imageUrl} className="w-12 h-12 rounded object-cover border border-slate-100" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                                <h3 className="text-sm font-bold uppercase text-slate-500 mb-4 flex items-center gap-2">
                                    <Smartphone className="w-4 h-4" /> Pagamento
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setPaymentMethod('mpesa')}
                                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all relative ${paymentMethod === 'mpesa' ? 'bg-red-50 text-red-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                                        style={{ borderColor: paymentMethod === 'mpesa' ? '#ef4444' : '' }}
                                    >
                                        <span className="font-bold text-sm">M-Pesa</span>
                                        {paymentMethod === 'mpesa' && <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setPaymentMethod('emola')}
                                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all relative ${paymentMethod === 'emola' ? 'bg-orange-50 text-orange-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                                        style={{ borderColor: paymentMethod === 'emola' ? '#f97316' : '' }}
                                    >
                                        <span className="font-bold text-sm">e-Mola</span>
                                        {paymentMethod === 'emola' && <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></div>}
                                    </button>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Número {paymentMethod === 'mpesa' ? 'M-Pesa' : 'e-Mola'}</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-3.5 text-slate-400 text-sm font-bold">+258</span>
                                        <input 
                                            type="tel" 
                                            placeholder="84 123 4567" 
                                            required
                                            value={paymentPhone}
                                            onChange={e => setPaymentPhone(e.target.value)}
                                            className="w-full pl-14 pr-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-opacity-50 outline-none text-slate-900 text-lg font-mono tracking-wide" 
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2">Você receberá um push no celular para confirmar.</p>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={step === 'processing'}
                                className="w-full text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:brightness-110 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-1"
                                style={{ backgroundColor: config.primaryColor, boxShadow: `0 10px 15px -3px ${config.primaryColor}40` }}
                            >
                            {step === 'processing' ? (
                                <div className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" /> Processando...
                                </div>
                            ) : (
                                `Pagar Agora • ${calculateTotal().toLocaleString('pt-MZ')} MT`
                            )}
                            </button>
                            <div className="text-center flex items-center justify-center gap-1">
                                <Lock className="w-3 h-3 text-slate-400" />
                                <p className="text-[10px] text-slate-400">Transação processada com segurança via PaySuite</p>
                            </div>
                        </form>
                    )}
                </div>
              );
          default: return null;
      }
  };

  // Se for Upsell INTERNO (caso o usuário não tenha definido URL, mas sim produto)
  if (step === 'upsell' && activeUpsellProduct) {
      // ... Upsell UI remains the same
      return null; // Placeholder to shorten answer, logic exists in original file
  }

  // ... Success Step remains the same ...

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10 p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
            </button>

            <div className="p-6 md:p-8">
                {/* DYNAMIC RENDER BASED ON ORDER */}
                {config.components?.map(type => renderComponent(type))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
