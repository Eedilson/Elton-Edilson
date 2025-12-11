import React, { useState } from 'react';
import { Product } from '../types';
import { Lock, Smartphone, CreditCard, CheckCircle, Download, X, AlertCircle, Loader2, MonitorPlay, ExternalLink, RefreshCw } from 'lucide-react';
import { PaySuite } from '../services/paySuiteService';

interface CheckoutProps {
  product: Product;
  onClose: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ product, onClose }) => {
  const [step, setStep] = useState<'form' | 'processing' | 'iframe' | 'success' | 'error'>('form');
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'emola' | 'credit_card'>('mpesa');
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  
  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    setErrorMessage('');

    // Reference must be Alphanumeric only (No hyphens)
    const reference = `ORD${Date.now()}`; 

    try {
      const response = await PaySuite.initiatePayment({
        amount: product.price,
        reference: reference,
        description: `Produto ${product.name}`,
        method: paymentMethod,
        mobile: customerPhone,
        email: customerEmail
      });

      if (response.status === 'success' && response.data?.checkout_url) {
        // INTEGRATION: Instead of redirecting, show the checkout in an Iframe
        // This keeps the user "in the app".
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

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-[#1e2329] border border-gray-800 rounded-2xl w-full max-w-md p-8 text-center relative animate-in zoom-in-95 duration-200">
           <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
            <X className="w-6 h-6" />
          </button>
          
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Pagamento Confirmado!</h2>
          <p className="text-gray-400 mb-6">
            Obrigado por comprar <strong>{product.name}</strong>.
          </p>

          <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-6 mb-4">
              {product.productType === 'ebook' && (
                  <>
                    <p className="text-sm text-gray-400 mb-3">Seu ebook está pronto para download:</p>
                    <a 
                        href={product.productFile || '#'} 
                        target="_blank"
                        className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        <Download className="w-5 h-5" /> Baixar Agora (PDF)
                    </a>
                  </>
              )}

              {product.productType === 'application' && (
                  <>
                    <p className="text-sm text-gray-400 mb-3">Acesse seu aplicativo abaixo:</p>
                    <a 
                        href={product.accessLink || '#'} 
                        target="_blank"
                        className="flex items-center justify-center gap-2 w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        <Smartphone className="w-5 h-5" /> Acessar App
                    </a>
                  </>
              )}

              {product.productType === 'course' && (
                  <>
                    <p className="text-sm text-gray-400 mb-3">Acesse a área de membros:</p>
                    <a 
                        href={product.accessLink || '#'} 
                        target="_blank"
                        className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        <MonitorPlay className="w-5 h-5" /> Ir para o Curso
                    </a>
                  </>
              )}

              {!product.productType && (
                   <p className="text-sm text-gray-400">Verifique seu email ({customerEmail}) para acessar o produto.</p>
              )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden min-h-[500px] shadow-2xl">
        {/* Left: Product Info */}
        <div className="w-full md:w-1/3 bg-slate-50 p-6 md:p-8 border-r border-slate-200 flex flex-col">
          <div className="mb-6">
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">SIMBA CHECKOUT</span>
          </div>
          
          {product.imageUrl && (
            <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover rounded-lg mb-4 shadow-sm border border-slate-200" />
          )}

          <h2 className="text-xl font-bold text-slate-800 mb-2">{product.name}</h2>
          <p className="text-slate-500 text-sm mb-6 flex-1">{product.description}</p>

          <div className="border-t border-slate-200 pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-600">Preço</span>
              <span className="text-slate-900 font-bold">{product.price.toLocaleString('pt-MZ')} MT</span>
            </div>
            <div className="flex justify-between items-center text-emerald-600 font-medium text-sm">
              <span>Garantia</span>
              <span>7 Dias</span>
            </div>
          </div>
        </div>

        {/* Right: Form or Iframe */}
        <div className="w-full md:w-2/3 p-6 md:p-8 relative bg-white flex flex-col">
           <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10">
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-slate-500 font-medium">Pagamento seguro via <strong>PaySuite</strong></span>
          </div>

          {step === 'error' && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="break-words w-full">
                    <strong>Erro:</strong> {errorMessage}
                </div>
            </div>
          )}
          
          {step === 'iframe' && paymentUrl ? (
             <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300 flex-1">
                <div className="flex items-center justify-between mb-3 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    <div className="flex items-center gap-2">
                         {paymentMethod !== 'credit_card' && (
                             <Smartphone className="w-4 h-4 text-emerald-600 animate-pulse" />
                         )}
                         <span className="text-sm font-bold text-emerald-800">
                            {paymentMethod === 'credit_card' 
                                ? 'Insira os dados do cartão' 
                                : 'Confirme no seu celular'}
                         </span>
                    </div>
                    <button 
                        onClick={() => window.open(paymentUrl, '_blank')} 
                        className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline flex items-center font-medium"
                    >
                        Abrir em nova aba <ExternalLink className="w-3 h-3 ml-1"/>
                    </button>
                </div>
                
                <div className="flex-1 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden relative shadow-inner">
                     <iframe 
                        src={paymentUrl} 
                        className="w-full h-full absolute inset-0 bg-white" 
                        title="Checkout PaySuite"
                     />
                </div>

                <div className="mt-4 flex justify-between items-center">
                    <button onClick={() => setStep('form')} className="text-slate-500 hover:text-slate-800 text-sm underline">
                        Voltar
                    </button>
                    <button 
                        onClick={() => setStep('success')} // Simulation of successful webhook
                        className="bg-slate-900 text-white px-4 py-2 rounded text-sm font-bold hover:bg-slate-800 flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Já paguei
                    </button>
                </div>
            </div>
          ) : (
             <form onSubmit={handlePay} className="space-y-6 flex-1 flex flex-col">
                <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">1. Seus Dados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                    type="text" 
                    placeholder="Nome Completo" 
                    required 
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900" 
                    />
                    <input 
                    type="email" 
                    placeholder="Seu Email" 
                    required 
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900" 
                    />
                </div>
                </div>

                <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">2. Método de Pagamento</h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <button 
                    type="button" 
                    onClick={() => setPaymentMethod('mpesa')}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${paymentMethod === 'mpesa' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                    <Smartphone className="w-6 h-6 mb-1" />
                    <span className="text-xs font-bold">M-Pesa</span>
                    </button>
                    <button 
                    type="button" 
                    onClick={() => setPaymentMethod('emola')}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${paymentMethod === 'emola' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                    <Smartphone className="w-6 h-6 mb-1" />
                    <span className="text-xs font-bold">e-Mola</span>
                    </button>
                    <button 
                    type="button" 
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${paymentMethod === 'credit_card' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                    <CreditCard className="w-6 h-6 mb-1" />
                    <span className="text-xs font-bold">Cartão</span>
                    </button>
                </div>

                {/* Dynamic Inputs based on Method */}
                {paymentMethod !== 'credit_card' && (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Número de Celular</label>
                        <input 
                        type="tel" 
                        placeholder="84 123 4567" 
                        required
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 text-lg font-mono" 
                        />
                    </div>
                )}
                </div>

                <div className="mt-auto">
                    <button 
                    type="submit" 
                    disabled={step === 'processing'}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                    {step === 'processing' ? (
                        <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" /> Conectando à PaySuite...
                        </div>
                    ) : (
                        `Pagar ${product.price.toLocaleString('pt-MZ')} MT`
                    )}
                    </button>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-slate-400">Powered by PaySuite • Transação criptografada</p>
                    </div>
                </div>
             </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;