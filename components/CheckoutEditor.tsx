import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { SimbaCloud } from '../services/cloudService';
import { 
  Save, ArrowLeft, Smartphone, Monitor, Image as ImageIcon, 
  Video, Clock, Type, ShieldCheck, Trash2, UploadCloud, PlayCircle
} from 'lucide-react';

interface CheckoutEditorProps {
  product: Product;
  onSave: (updatedProduct: Product) => void;
  onBack: () => void;
}

type ComponentType = 'header' | 'image' | 'video' | 'timer' | 'text' | 'form';

const CheckoutEditor: React.FC<CheckoutEditorProps> = ({ product, onSave, onBack }) => {
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [activeComponent, setActiveComponent] = useState<ComponentType | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state for editing
  const [config, setConfig] = useState(product.checkoutConfig || {
    components: ['header', 'form', 'seal'],
    primaryColor: '#10b981',
    showCountdown: false,
    showTestimonials: false,
    checkoutCoverImage: '',
    checkoutVideoUrl: '',
    timerSettings: {
        enabled: false,
        minutes: 15,
        text: 'Oferta por tempo limitado',
        backgroundColor: '#ef4444',
        textColor: '#ffffff'
    }
  });

  // Ensure timerSettings exists if older product
  useEffect(() => {
    if (!config.timerSettings) {
        setConfig(prev => ({
            ...prev,
            timerSettings: {
                enabled: false,
                minutes: 15,
                text: 'Oferta por tempo limitado',
                backgroundColor: '#ef4444',
                textColor: '#ffffff'
            }
        }));
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const updatedProduct = { ...product, checkoutConfig: config };
    await SimbaCloud.saveProduct(updatedProduct);
    onSave(updatedProduct);
    setIsSaving(false);
  };

  const toggleComponent = (id: string) => {
    const current = config.components || [];
    const updated = current.includes(id) 
      ? current.filter(c => c !== id)
      : [...current, id];
    
    setConfig(prev => ({ ...prev, components: updated }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = await SimbaCloud.uploadImage(file);
      setConfig(prev => ({ ...prev, checkoutCoverImage: imageUrl }));
    }
  };

  const renderPropertiesPanel = () => {
    if (!activeComponent) return (
        <div className="p-6 text-center text-gray-500">
            <p>Selecione um elemento na pré-visualização ou na barra lateral para editar.</p>
        </div>
    );

    return (
        <div className="p-6 space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                <h3 className="text-lg font-bold text-white capitalize">{activeComponent}</h3>
                <button onClick={() => setActiveComponent(null)} className="text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /></button>
            </div>

            {activeComponent === 'image' && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-400">Esta imagem é exclusiva do checkout (diferente da capa do produto).</p>
                    <div className="border-2 border-dashed border-gray-700 rounded-lg h-40 flex flex-col items-center justify-center relative hover:bg-gray-800 transition-colors">
                        {config.checkoutCoverImage ? (
                            <img src={config.checkoutCoverImage} className="h-full w-full object-cover rounded-lg" />
                        ) : (
                            <div className="flex flex-col items-center">
                                <UploadCloud className="w-8 h-8 text-gray-500 mb-2" />
                                <span className="text-xs text-gray-400">Carregar Imagem</span>
                            </div>
                        )}
                        <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                    </div>
                    {config.checkoutCoverImage && (
                        <button 
                            onClick={() => setConfig(prev => ({...prev, checkoutCoverImage: ''}))}
                            className="text-red-500 text-xs flex items-center gap-1 hover:underline"
                        >
                            <Trash2 className="w-3 h-3" /> Remover Imagem
                        </button>
                    )}
                </div>
            )}

            {activeComponent === 'video' && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-400">Insira a URL do vídeo de vendas (YouTube, Vimeo ou Panda).</p>
                    <input 
                        type="text" 
                        placeholder="https://youtube.com/watch?v=..." 
                        value={config.checkoutVideoUrl || ''}
                        onChange={(e) => setConfig(prev => ({...prev, checkoutVideoUrl: e.target.value}))}
                        className="w-full bg-[#0f1419] border border-gray-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none text-sm"
                    />
                </div>
            )}

            {activeComponent === 'timer' && config.timerSettings && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-white">Ativar Cronômetro</span>
                        <button 
                            onClick={() => setConfig(prev => ({
                                ...prev, 
                                timerSettings: { ...prev.timerSettings!, enabled: !prev.timerSettings!.enabled }
                            }))}
                            className={`w-10 h-5 rounded-full relative transition-colors ${config.timerSettings.enabled ? 'bg-emerald-500' : 'bg-gray-700'}`}
                        >
                            <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${config.timerSettings.enabled ? 'left-6' : 'left-1'}`}></div>
                        </button>
                    </div>

                    {config.timerSettings.enabled && (
                        <>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Tempo (minutos)</label>
                                <input 
                                    type="number" 
                                    value={config.timerSettings.minutes}
                                    onChange={(e) => setConfig(prev => ({
                                        ...prev, 
                                        timerSettings: { ...prev.timerSettings!, minutes: parseInt(e.target.value) }
                                    }))}
                                    className="w-full bg-[#0f1419] border border-gray-700 rounded-lg p-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Texto</label>
                                <input 
                                    type="text" 
                                    value={config.timerSettings.text}
                                    onChange={(e) => setConfig(prev => ({
                                        ...prev, 
                                        timerSettings: { ...prev.timerSettings!, text: e.target.value }
                                    }))}
                                    className="w-full bg-[#0f1419] border border-gray-700 rounded-lg p-2 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Cor Fundo</label>
                                    <input 
                                        type="color" 
                                        value={config.timerSettings.backgroundColor}
                                        onChange={(e) => setConfig(prev => ({
                                            ...prev, 
                                            timerSettings: { ...prev.timerSettings!, backgroundColor: e.target.value }
                                        }))}
                                        className="w-full h-8 rounded bg-transparent cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Cor Texto</label>
                                    <input 
                                        type="color" 
                                        value={config.timerSettings.textColor}
                                        onChange={(e) => setConfig(prev => ({
                                            ...prev, 
                                            timerSettings: { ...prev.timerSettings!, textColor: e.target.value }
                                        }))}
                                        className="w-full h-8 rounded bg-transparent cursor-pointer"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0f1419] flex flex-col h-screen">
      {/* Top Bar */}
      <div className="h-16 bg-[#161b22] border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
         <div className="flex items-center gap-4">
            <button onClick={onBack} className="flex items-center text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
            </button>
            <div className="h-6 w-px bg-gray-700 mx-2"></div>
            <h2 className="text-white font-bold">{product.name} <span className="text-gray-500 font-normal text-sm">/ Editor de Checkout</span></h2>
         </div>

         <div className="flex items-center bg-[#0f1419] rounded-lg p-1 border border-gray-800">
            <button 
                onClick={() => setDevice('desktop')}
                className={`p-2 rounded ${device === 'desktop' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
                <Monitor className="w-4 h-4" />
            </button>
            <button 
                onClick={() => setDevice('mobile')}
                className={`p-2 rounded ${device === 'mobile' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
                <Smartphone className="w-4 h-4" />
            </button>
         </div>

         <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20"
         >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Checkout
         </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Components */}
        <div className="w-20 bg-[#161b22] border-r border-gray-800 flex flex-col items-center py-6 gap-4 shrink-0">
             <button 
                onClick={() => { toggleComponent('image'); setActiveComponent('image'); }}
                className={`p-3 rounded-xl transition-all ${config.components?.includes('image') ? 'bg-emerald-500/20 text-emerald-500' : 'text-gray-500 hover:bg-gray-800 hover:text-white'}`}
                title="Imagem"
             >
                 <ImageIcon className="w-6 h-6" />
             </button>
             <button 
                onClick={() => { toggleComponent('video'); setActiveComponent('video'); }}
                className={`p-3 rounded-xl transition-all ${config.components?.includes('video') ? 'bg-blue-500/20 text-blue-500' : 'text-gray-500 hover:bg-gray-800 hover:text-white'}`}
                title="Vídeo"
             >
                 <Video className="w-6 h-6" />
             </button>
             <button 
                onClick={() => { toggleComponent('timer'); setActiveComponent('timer'); }}
                className={`p-3 rounded-xl transition-all ${config.timerSettings?.enabled ? 'bg-red-500/20 text-red-500' : 'text-gray-500 hover:bg-gray-800 hover:text-white'}`}
                title="Cronômetro"
             >
                 <Clock className="w-6 h-6" />
             </button>
             <button 
                className="p-3 rounded-xl text-gray-500 hover:bg-gray-800 hover:text-white transition-all"
                title="Texto (Em breve)"
             >
                 <Type className="w-6 h-6" />
             </button>
             <button 
                className="p-3 rounded-xl text-gray-500 hover:bg-gray-800 hover:text-white transition-all"
                title="Garantia (Em breve)"
             >
                 <ShieldCheck className="w-6 h-6" />
             </button>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 bg-[#0f1419] flex items-center justify-center p-8 overflow-y-auto relative">
             <div 
                className={`bg-white shadow-2xl transition-all duration-300 overflow-hidden flex flex-col ${
                    device === 'mobile' 
                    ? 'w-[375px] h-[750px] rounded-[30px] border-[8px] border-gray-800' 
                    : 'w-[1024px] h-[700px] rounded-lg border border-gray-200'
                }`}
             >
                {/* Fake Browser Bar for Desktop */}
                {device === 'desktop' && (
                    <div className="h-8 bg-gray-100 border-b flex items-center px-4 gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        <div className="flex-1 bg-white h-5 rounded text-[10px] text-gray-400 flex items-center px-2 ml-4">
                            simba.app/pay/checkout
                        </div>
                    </div>
                )}
                
                {/* CHECKOUT CONTENT SIMULATION */}
                <div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar relative">
                    
                    {/* Timer Component */}
                    {config.timerSettings?.enabled && (
                        <div 
                            className="w-full py-3 text-center font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: config.timerSettings.backgroundColor, color: config.timerSettings.textColor }}
                            onClick={() => setActiveComponent('timer')}
                        >
                            {config.timerSettings.text}: {config.timerSettings.minutes}:00
                        </div>
                    )}

                    <div className={`p-6 ${device === 'desktop' ? 'max-w-4xl mx-auto grid grid-cols-2 gap-8' : 'flex flex-col gap-4'}`}>
                        
                        {/* Left Column (Desktop) / Top (Mobile) */}
                        <div className="space-y-4">
                             {/* Header / Logo */}
                            <div className="flex justify-center mb-4">
                                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400">Logo</div>
                            </div>

                            {/* Custom Image Component */}
                            {config.components?.includes('image') && (
                                <div 
                                    onClick={() => setActiveComponent('image')}
                                    className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-emerald-500 overflow-hidden relative group"
                                >
                                    {config.checkoutCoverImage ? (
                                        <img src={config.checkoutCoverImage} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-400">
                                            <ImageIcon className="w-8 h-8 mb-1" />
                                            <span className="text-xs">Clique para adicionar imagem</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                            )}

                             {/* Custom Video Component */}
                             {config.components?.includes('video') && (
                                <div 
                                    onClick={() => setActiveComponent('video')}
                                    className="w-full h-40 bg-black rounded-lg flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-emerald-500 overflow-hidden relative group"
                                >
                                    <PlayCircle className="w-12 h-12 text-white opacity-80" />
                                    {config.checkoutVideoUrl && (
                                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded">
                                            Vídeo Vinculado
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                                <h1 className="font-bold text-slate-800 text-lg">{product.name}</h1>
                                <p className="text-slate-500 text-sm mt-1 mb-4">{product.description?.substring(0, 60)}...</p>
                                <div className="flex justify-between items-center border-t pt-3">
                                    <span className="text-sm font-medium">Total</span>
                                    <span className="text-emerald-600 font-bold text-lg">{product.price.toLocaleString('pt-MZ')} MT</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column (Desktop) / Bottom (Mobile) */}
                        <div className="space-y-4">
                             <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                                 <h3 className="text-sm font-bold uppercase text-slate-500 mb-3">Dados Pessoais</h3>
                                 <div className="space-y-3">
                                    <input disabled placeholder="Nome Completo" className="w-full border p-2 rounded bg-slate-50 text-sm" />
                                    <input disabled placeholder="Seu Email" className="w-full border p-2 rounded bg-slate-50 text-sm" />
                                    <input disabled placeholder="Celular (M-Pesa/e-Mola)" className="w-full border p-2 rounded bg-slate-50 text-sm" />
                                 </div>
                             </div>

                             <button 
                                className="w-full py-4 text-white font-bold rounded shadow-lg text-sm hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: config.primaryColor }}
                             >
                                PAGAR AGORA
                             </button>

                             <div className="flex justify-center items-center gap-2 text-slate-400 text-xs">
                                <ShieldCheck className="w-4 h-4" /> Pagamento 100% Seguro
                             </div>
                        </div>

                    </div>
                </div>
             </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 bg-[#161b22] border-l border-gray-800 shrink-0">
             {renderPropertiesPanel()}
        </div>
      </div>
    </div>
  );
};

export default CheckoutEditor;
import { Loader2 } from 'lucide-react';