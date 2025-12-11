
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { SimbaCloud } from '../services/cloudService';
import { 
  Save, ArrowLeft, Smartphone, Monitor, Image as ImageIcon, 
  Video, Clock, Type, ShieldCheck, Trash2, UploadCloud, PlayCircle, Loader2, ArrowUp, ArrowDown, HardDrive, Check
} from 'lucide-react';

interface CheckoutEditorProps {
  product: Product;
  onSave: (updatedProduct: Product) => void;
  onBack: () => void;
}

type ComponentType = 'header' | 'image' | 'video' | 'timer' | 'text' | 'form' | 'seal';

const CheckoutEditor: React.FC<CheckoutEditorProps> = ({ product, onSave, onBack }) => {
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [activeComponent, setActiveComponent] = useState<ComponentType | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  
  // Local state for editing - Explicitly typed to avoid inference issues with optional properties and unions
  const [config, setConfig] = useState<NonNullable<Product['checkoutConfig']>>(product.checkoutConfig || {
    components: ['header', 'video', 'form', 'seal'],
    primaryColor: '#10b981',
    showCountdown: false,
    showTestimonials: false,
    checkoutCoverImage: '',
    checkoutVideoUrl: '',
    checkoutVideoSource: 'external',
    timerSettings: {
        enabled: false,
        minutes: 15,
        text: 'Oferta por tempo limitado',
        backgroundColor: '#ef4444',
        textColor: '#ffffff'
    }
  });

  // Ensure settings exists if older product
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
    const updatedProduct: Product = { ...product, checkoutConfig: config };
    await SimbaCloud.saveProduct(updatedProduct);
    onSave(updatedProduct);
    setIsSaving(false);
  };

  const toggleComponent = (id: string) => {
    // If enabling timer, make sure settings exist and are enabled
    if (id === 'timer') {
         if (!config.timerSettings) {
             setConfig(prev => ({
                 ...prev,
                 timerSettings: {
                    enabled: true,
                    minutes: 15,
                    text: 'Oferta',
                    backgroundColor: '#ef4444',
                    textColor: '#fff'
                 }
             }));
         } else {
             setConfig(prev => ({
                 ...prev,
                 timerSettings: { ...prev.timerSettings!, enabled: true }
             }));
         }
    }

    const current = config.components || [];
    const updated = current.includes(id) 
      ? current.filter(c => c !== id)
      : [...current, id]; // Add to end by default
    
    setConfig(prev => ({ ...prev, components: updated }));
  };

  const moveComponent = (index: number, direction: 'up' | 'down') => {
      const components = [...(config.components || [])];
      if (direction === 'up' && index > 0) {
          [components[index], components[index - 1]] = [components[index - 1], components[index]];
      } else if (direction === 'down' && index < components.length - 1) {
           [components[index], components[index + 1]] = [components[index + 1], components[index]];
      }
      setConfig(prev => ({ ...prev, components }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = await SimbaCloud.uploadImage(file);
      setConfig(prev => ({ ...prev, checkoutCoverImage: imageUrl }));
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setVideoUploadProgress(10);
          
          const interval = setInterval(() => {
              setVideoUploadProgress(prev => {
                  if (prev >= 90) {
                      clearInterval(interval);
                      return 90;
                  }
                  return prev + 10;
              });
          }, 200);

          try {
            const url = await SimbaCloud.uploadFile(file);
            if (url) {
                setConfig(prev => ({ ...prev, checkoutVideoBlobUrl: url, checkoutVideoSource: 'local' }));
                setVideoUploadProgress(100);
            }
          } catch(e) {
              alert("Erro ao carregar vídeo");
          } finally {
              setTimeout(() => setVideoUploadProgress(0), 1000);
              clearInterval(interval);
          }
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
                    <p className="text-sm text-gray-400">Insira a URL do vídeo de vendas ou carregue do computador.</p>
                    
                    <div className="flex gap-2 mb-2">
                        <button 
                            onClick={() => setConfig(prev => ({...prev, checkoutVideoSource: 'external'}))}
                            className={`flex-1 py-1 text-xs font-bold rounded ${config.checkoutVideoSource === 'external' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                        >Link</button>
                        <button 
                            onClick={() => setConfig(prev => ({...prev, checkoutVideoSource: 'local'}))}
                            className={`flex-1 py-1 text-xs font-bold rounded ${config.checkoutVideoSource === 'local' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                        >Upload</button>
                    </div>

                    {config.checkoutVideoSource === 'local' ? (
                        <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center hover:border-emerald-500 transition-colors relative bg-[#0f1419]">
                            <HardDrive className="w-8 h-8 text-gray-500 mb-2" />
                            <span className="text-sm text-gray-400 mb-1">Carregar vídeo</span>
                            <span className="text-xs text-gray-600">Max 600MB</span>
                            <input 
                                type="file" 
                                onChange={handleVideoUpload} 
                                accept="video/*" 
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {videoUploadProgress > 0 && (
                                <div className="w-full mt-4 bg-gray-800 rounded-full h-2 overflow-hidden">
                                    <div className="bg-emerald-500 h-full transition-all duration-200" style={{ width: `${videoUploadProgress}%` }}></div>
                                </div>
                            )}
                            {config.checkoutVideoBlobUrl && videoUploadProgress === 0 && (
                                <div className="mt-4 flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded text-xs">
                                    <Check className="w-3 h-3" /> Carregado
                                </div>
                            )}
                        </div>
                    ) : (
                        <input 
                            type="text" 
                            placeholder="https://youtube.com/watch?v=..." 
                            value={config.checkoutVideoUrl || ''}
                            onChange={(e) => setConfig(prev => ({...prev, checkoutVideoUrl: e.target.value}))}
                            className="w-full bg-[#0f1419] border border-gray-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none text-sm"
                        />
                    )}
                </div>
            )}

            {activeComponent === 'timer' && config.timerSettings && (
                <div className="space-y-4">
                    {/* Timer settings same as before... */}
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
                    {/* ... Inputs for minutes, text, colors ... */}
                </div>
            )}
        </div>
    );
  };

  // --- COMPONENT RENDERERS ---
  const renderComponent = (type: string) => {
      switch(type) {
          case 'video':
              return (
                 <div 
                    key="video"
                    onClick={() => setActiveComponent('video')}
                    className="w-full aspect-video bg-black rounded-lg flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-emerald-500 overflow-hidden relative group mb-4"
                >
                    {config.checkoutVideoSource === 'local' && config.checkoutVideoBlobUrl ? (
                        <video controls src={config.checkoutVideoBlobUrl} className="w-full h-full pointer-events-none"></video>
                    ) : config.checkoutVideoUrl ? (
                            <iframe 
                            src={getEmbedUrl(config.checkoutVideoUrl)} 
                            className="w-full h-full pointer-events-none" 
                            frameBorder="0"
                            referrerPolicy="no-referrer"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            ></iframe>
                    ) : (
                        <div className="flex flex-col items-center text-white/50">
                            <PlayCircle className="w-12 h-12" />
                            <span className="text-[10px] mt-2">Vídeo aparecerá aqui</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-transparent hover:bg-black/10 transition-colors z-10"></div>
                </div>
              );
          // ... other cases ('image', 'timer', etc.) same as before ...
          case 'image':
              return (
                <div 
                    key="image"
                    onClick={() => setActiveComponent('image')}
                    className="w-full h-auto bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-emerald-500 overflow-hidden relative group mb-4"
                >
                    {config.checkoutCoverImage ? (
                        <img src={config.checkoutCoverImage} className="w-full h-auto object-cover" />
                    ) : (
                        <div className="flex flex-col items-center text-gray-400 py-8">
                            <ImageIcon className="w-8 h-8 mb-1" />
                            <span className="text-xs">Clique para adicionar imagem</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              );
          case 'timer':
                if (!config.timerSettings?.enabled) return null;
                return (
                    <div 
                        key="timer"
                        className="w-full py-3 text-center font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity mb-4 rounded-lg shadow-sm"
                        style={{ backgroundColor: config.timerSettings.backgroundColor, color: config.timerSettings.textColor }}
                        onClick={() => setActiveComponent('timer')}
                    >
                        {config.timerSettings.text}: {config.timerSettings.minutes}:00
                    </div>
                );
          case 'form':
              return (
                 <div key="form" className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-4 cursor-default opacity-80 pointer-events-none">
                     <h3 className="text-sm font-bold uppercase text-slate-500 mb-3">Dados (Preview)</h3>
                     <div className="space-y-3">
                        <input disabled placeholder="Nome Completo" className="w-full border p-2 rounded bg-slate-50 text-sm" />
                        <input disabled placeholder="Celular / WhatsApp" className="w-full border p-2 rounded bg-slate-50 text-sm" />
                     </div>
                     <button className="w-full py-4 text-white font-bold rounded shadow-lg text-sm mt-4" style={{ backgroundColor: config.primaryColor }}>
                        PAGAR AGORA
                     </button>
                 </div>
              );
          case 'header':
              return (
                 <div key="header" className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-4 flex gap-4">
                     {product.imageUrl && <img src={product.imageUrl} className="w-16 h-16 rounded object-cover" />}
                     <div>
                        <h1 className="font-bold text-slate-800 text-lg">{product.name}</h1>
                        <p className="text-slate-500 text-sm mt-1 mb-2">{product.description?.substring(0, 40)}...</p>
                        <div className="text-emerald-600 font-bold text-lg">{product.price.toLocaleString('pt-MZ')} MT</div>
                     </div>
                 </div>
              );
          case 'seal':
              return (
                <div key="seal" className="flex justify-center items-center gap-2 text-slate-400 text-xs mb-4">
                    <ShieldCheck className="w-4 h-4" /> Pagamento 100% Seguro
                </div>
              );
          default: return null;
      }
  }

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
        {/* Left Sidebar - Reordering and Components */}
        <div className="w-64 bg-[#161b22] border-r border-gray-800 flex flex-col py-6 shrink-0 overflow-y-auto">
             <div className="px-4 mb-6">
                 <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Componentes Ativos</h3>
                 <div className="space-y-2">
                     {config.components?.map((compId, index) => (
                         <div key={compId} className="bg-[#0f1419] p-2 rounded border border-gray-800 flex items-center justify-between group">
                             <span className="text-sm text-gray-300 capitalize">{compId}</span>
                             <div className="flex gap-1">
                                 <button onClick={() => moveComponent(index, 'up')} className="p-1 hover:bg-gray-700 rounded text-gray-500 hover:text-white" disabled={index === 0}>
                                     <ArrowUp className="w-3 h-3" />
                                 </button>
                                 <button onClick={() => moveComponent(index, 'down')} className="p-1 hover:bg-gray-700 rounded text-gray-500 hover:text-white" disabled={index === (config.components?.length || 0) - 1}>
                                     <ArrowDown className="w-3 h-3" />
                                 </button>
                                 <button onClick={() => toggleComponent(compId)} className="p-1 hover:bg-red-900/30 rounded text-gray-500 hover:text-red-500">
                                     <Trash2 className="w-3 h-3" />
                                 </button>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>

             <div className="px-4 border-t border-gray-800 pt-4">
                 <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Adicionar</h3>
                 <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => toggleComponent('image')} className="p-2 bg-[#0f1419] hover:bg-gray-800 rounded border border-gray-800 text-xs text-gray-300 flex flex-col items-center gap-1">
                        <ImageIcon className="w-4 h-4" /> Imagem
                    </button>
                    <button onClick={() => toggleComponent('video')} className="p-2 bg-[#0f1419] hover:bg-gray-800 rounded border border-gray-800 text-xs text-gray-300 flex flex-col items-center gap-1">
                        <Video className="w-4 h-4" /> Vídeo
                    </button>
                    <button onClick={() => toggleComponent('timer')} className="p-2 bg-[#0f1419] hover:bg-gray-800 rounded border border-gray-800 text-xs text-gray-300 flex flex-col items-center gap-1">
                        <Clock className="w-4 h-4" /> Timer
                    </button>
                 </div>
             </div>
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
                    
                    <div className={`p-6 ${device === 'desktop' ? 'max-w-2xl mx-auto' : 'flex flex-col'}`}>
                        {/* RENDER DYNAMIC COMPONENTS IN ORDER */}
                        {config.components?.map(type => renderComponent(type))}
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
