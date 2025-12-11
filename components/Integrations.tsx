import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, Webhook, Copy, Check, Lock, AlertTriangle, Plus, 
  Search, ExternalLink, Trash2, Eye, EyeOff, X, Save, CloudLightning, Globe
} from 'lucide-react';
import { ApiKeyConfig, IntegrationApp, WebhookConfig } from '../types';
import { SimbaCloud } from '../services/cloudService';

// --- MOCK APP DATA ---
const AVAILABLE_APPS: IntegrationApp[] = [
  { id: 'hotzapp', name: 'Hotzapp', category: 'Marketing', logoColor: '#FF5722', status: 'disconnected' },
  { id: 'activecampaign', name: 'ActiveCampaign', category: 'Marketing', logoColor: '#356AE6', status: 'disconnected' },
  { id: 'enotas', name: 'eNotas', category: 'Finance', logoColor: '#00A699', status: 'disconnected' },
  { id: 'notazz', name: 'Notazz', category: 'Finance', logoColor: '#102F4D', status: 'disconnected' },
  { id: 'leadlovers', name: 'Leadlovers', category: 'Marketing', logoColor: '#E91E63', status: 'disconnected' },
  { id: 'mailchimp', name: 'Mailchimp', category: 'Marketing', logoColor: '#FFE01B', status: 'disconnected' },
  { id: 'memberkit', name: 'Memberkit', category: 'Members', logoColor: '#6200EA', status: 'disconnected' },
  { id: 'mailingboss', name: 'MailingBoss', category: 'Marketing', logoColor: '#00C3FF', status: 'disconnected' },
  { id: 'tiny', name: 'Tiny', category: 'Finance', logoColor: '#2962FF', status: 'disconnected' },
  { id: 'voxuy', name: 'Voxuy', category: 'Marketing', logoColor: '#00E676', status: 'disconnected' },
  { id: 'notificacoes', name: 'Notificações Int.', category: 'Notification', logoColor: '#FFD600', status: 'disconnected' },
  { id: 'zapier', name: 'Zapier', category: 'Tools', logoColor: '#FF4A00', status: 'disconnected' },
];

const Integrations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'apps' | 'webhooks' | 'api'>('apps');
  const [integrations, setIntegrations] = useState<IntegrationApp[]>(AVAILABLE_APPS);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>([]);

  // Modals
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [showAppModal, setShowAppModal] = useState<IntegrationApp | null>(null);
  const [showApiResult, setShowApiResult] = useState<ApiKeyConfig | null>(null);

  // Load Data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [loadedWebhooks, loadedKeys, intStatus] = await Promise.all([
        SimbaCloud.getWebhooks(),
        SimbaCloud.getApiKeys(),
        SimbaCloud.getIntegrationsStatus()
    ]);
    
    setWebhooks(loadedWebhooks);
    setApiKeys(loadedKeys);
    
    // Merge status
    setIntegrations(prev => prev.map(app => ({
        ...app,
        status: intStatus[app.id] ? 'connected' : 'disconnected',
        config: intStatus[app.id]?.config
    })));
  };

  // --- TAB RENDERERS ---

  // 1. APPS GRID
  const renderApps = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
      {/* Special Internal Cards */}
      <button 
        onClick={() => setActiveTab('webhooks')}
        className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-4 transition-all group shadow-sm hover:shadow-md h-48"
      >
         <div className="p-4 bg-slate-900 rounded-full text-white group-hover:scale-110 transition-transform">
            <Webhook className="w-8 h-8" />
         </div>
         <span className="font-bold text-xl text-slate-800">Webhooks</span>
      </button>

      <button 
        onClick={() => setActiveTab('api')}
        className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-4 transition-all group shadow-sm hover:shadow-md h-48"
      >
         <div className="p-4 bg-slate-900 rounded-full text-white group-hover:scale-110 transition-transform">
            <Key className="w-8 h-8" />
         </div>
         <span className="font-bold text-xl text-slate-800">API</span>
      </button>

      {/* External Apps */}
      {integrations.map(app => (
        <button 
          key={app.id}
          onClick={() => setShowAppModal(app)}
          className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-4 transition-all shadow-sm hover:shadow-md h-48 relative"
        >
          {app.status === 'connected' && (
              <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                  <Check className="w-3 h-3" /> ATIVO
              </div>
          )}
          
          <div className="text-3xl font-black" style={{ color: app.logoColor }}>
             {/* Simulating Logos with Text/Color */}
             {app.name}
          </div>
          <span className="text-sm text-gray-500 font-medium">{app.category}</span>
        </button>
      ))}
    </div>
  );

  // 2. WEBHOOKS LIST
  const renderWebhooks = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg"><Webhook className="w-6 h-6 text-slate-700"/></div>
            <div>
                <h3 className="text-lg font-bold text-slate-800">Webhooks</h3>
                <p className="text-sm text-slate-500">Notifique sistemas externos sobre eventos.</p>
            </div>
        </div>
        <button 
            onClick={() => setShowWebhookModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
        >
            <Plus className="w-4 h-4" /> Criar Webhook
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
         <table className="w-full text-left">
             <thead className="bg-slate-50 border-b border-slate-200">
                 <tr>
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nome</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">URL</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Eventos</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                 </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                 {webhooks.length === 0 ? (
                     <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Nenhum webhook configurado.</td></tr>
                 ) : (
                     webhooks.map(wh => (
                         <tr key={wh.id} className="hover:bg-slate-50">
                             <td className="px-6 py-4 font-medium text-slate-800">{wh.name}</td>
                             <td className="px-6 py-4 text-sm text-slate-500 truncate max-w-[200px]">{wh.url}</td>
                             <td className="px-6 py-4">
                                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs border border-slate-200">
                                    {wh.events.length} eventos
                                </span>
                             </td>
                             <td className="px-6 py-4">
                                 <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold border border-emerald-100">ATIVO</span>
                             </td>
                         </tr>
                     ))
                 )}
             </tbody>
         </table>
      </div>
    </div>
  );

  // 3. API KEYS LIST
  const renderApi = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
       <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg"><Key className="w-6 h-6 text-slate-700"/></div>
            <div>
                <h3 className="text-lg font-bold text-slate-800">API Keys</h3>
                <p className="text-sm text-slate-500">Chaves para integração direta via código.</p>
            </div>
        </div>
        <button 
            onClick={() => setShowApiModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
        >
            <Plus className="w-4 h-4" /> Nova Chave
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
         <table className="w-full text-left">
             <thead className="bg-slate-50 border-b border-slate-200">
                 <tr>
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nome</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Client ID</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Escopos</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
                 </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                 {apiKeys.length === 0 ? (
                     <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Nenhuma chave API criada.</td></tr>
                 ) : (
                     apiKeys.map(key => (
                         <tr key={key.id} className="hover:bg-slate-50">
                             <td className="px-6 py-4 font-medium text-slate-800">{key.name}</td>
                             <td className="px-6 py-4 text-sm font-mono text-slate-500">{key.clientId}</td>
                             <td className="px-6 py-4 text-sm text-slate-500">{key.scopes.length} Permissões</td>
                             <td className="px-6 py-4 text-right">
                                <button className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                             </td>
                         </tr>
                     ))
                 )}
             </tbody>
         </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b border-slate-700 pb-2 mb-6">
        <button 
            onClick={() => setActiveTab('apps')}
            className={`pb-2 text-sm font-bold transition-colors ${activeTab === 'apps' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white'}`}
        >
            Apps & Integrações
        </button>
        <button 
            onClick={() => setActiveTab('webhooks')}
            className={`pb-2 text-sm font-bold transition-colors ${activeTab === 'webhooks' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white'}`}
        >
            Webhooks
        </button>
        <button 
            onClick={() => setActiveTab('api')}
            className={`pb-2 text-sm font-bold transition-colors ${activeTab === 'api' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white'}`}
        >
            API
        </button>
      </div>

      {activeTab === 'apps' && renderApps()}
      {activeTab === 'webhooks' && renderWebhooks()}
      {activeTab === 'api' && renderApi()}

      {/* --- MODALS --- */}

      {/* 1. APP CONFIG MODAL */}
      {showAppModal && (
        <IntegrationConfigModal 
            app={showAppModal} 
            onClose={() => setShowAppModal(null)}
            onSave={async (config) => {
                await SimbaCloud.saveIntegration(showAppModal.id, config);
                await loadData();
                setShowAppModal(null);
            }}
        />
      )}

      {/* 2. WEBHOOK CREATE MODAL */}
      {showWebhookModal && (
          <CreateWebhookModal 
            onClose={() => setShowWebhookModal(false)}
            onSave={async (wh) => {
                await SimbaCloud.saveWebhook(wh);
                await loadData();
                setShowWebhookModal(false);
            }}
          />
      )}

      {/* 3. API CREATE MODAL */}
      {showApiModal && (
          <CreateApiModal
             onClose={() => setShowApiModal(false)}
             onSave={async (key) => {
                 const savedKey = await SimbaCloud.saveApiKey(key);
                 await loadData();
                 setShowApiModal(false);
                 setShowApiResult(savedKey);
             }}
          />
      )}

      {/* 4. API RESULT MODAL (Copy Keys) */}
      {showApiResult && (
          <ApiResultModal 
             apiKey={showApiResult}
             onClose={() => setShowApiResult(null)}
          />
      )}

    </div>
  );
};

// --- SUB COMPONENTS (MODALS) ---

// APP CONFIG MODAL
const IntegrationConfigModal = ({ app, onClose, onSave }: { app: IntegrationApp, onClose: () => void, onSave: (data: any) => void }) => {
    const [apiKey, setApiKey] = useState('');
    const [apiUrl, setApiUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate checking API
        await new Promise(r => setTimeout(r, 1000));
        const config: any = { apiKey };
        if (apiUrl) config.apiUrl = apiUrl;
        
        onSave(config);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1e2329] border border-gray-700 rounded-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        Configurar {app.name}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Nome da Integração</label>
                        <input type="text" className="w-full bg-[#0f1419] border border-gray-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" placeholder="Ex: Minha conta principal" required />
                    </div>
                    
                    {app.id === 'activecampaign' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">URL da API</label>
                            <div className="relative">
                                <input type="url" value={apiUrl} onChange={e => setApiUrl(e.target.value)} className="w-full bg-[#0f1419] border border-gray-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none pr-10" placeholder="https://sua-conta.api-us1.com" required />
                                <Globe className="absolute right-3 top-3.5 w-4 h-4 text-gray-500" />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">API Key / Token</label>
                        <div className="relative">
                            <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full bg-[#0f1419] border border-gray-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none pr-10" placeholder="Cole sua chave aqui" required />
                            <Lock className="absolute right-3 top-3.5 w-4 h-4 text-gray-500" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800">Cancelar</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-2">
                            {loading ? 'Conectando...' : 'Salvar e Conectar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// WEBHOOK CREATE MODAL
const CreateWebhookModal = ({ onClose, onSave }: { onClose: () => void, onSave: (wh: WebhookConfig) => void }) => {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [events, setEvents] = useState<string[]>([]);

    // Updated Events for Mozambique Context
    const availableEvents = ['M-Pesa gerado', 'e-Mola gerado', 'Carrinho abandonado', 'Compra recusada', 'Compra aprovada', 'Reembolso', 'Chargeback', 'Assinatura cancelada', 'Assinatura renovada'];

    const toggleEvent = (evt: string) => {
        if (events.includes(evt)) setEvents(events.filter(e => e !== evt));
        else setEvents([...events, evt]);
    };

    const handleSave = () => {
        if (!name || !url || events.length === 0) return alert("Preencha todos os campos");
        const newWebhook: WebhookConfig = {
            id: Date.now().toString(),
            name,
            url,
            token: Math.random().toString(36).substring(2, 15),
            events,
            status: 'active'
        };
        onSave(newWebhook);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 text-slate-800">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Criar Webhook</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nome</label>
                        <input value={name} onChange={e => setName(e.target.value)} type="text" className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-emerald-500 outline-none" placeholder="Ex: Integração Zapier" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">URL do Webhook</label>
                        <input value={url} onChange={e => setUrl(e.target.value)} type="url" className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-emerald-500 outline-none" placeholder="https://..." />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Eventos</label>
                        <div className="space-y-2">
                            {availableEvents.map(evt => (
                                <label key={evt} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-200">
                                    <input 
                                        type="checkbox" 
                                        checked={events.includes(evt)} 
                                        onChange={() => toggleEvent(evt)}
                                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                                    />
                                    <span className="text-sm text-slate-600">{evt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg">Criar</button>
                </div>
            </div>
        </div>
    );
};

// API KEY CREATE MODAL
const CreateApiModal = ({ onClose, onSave }: { onClose: () => void, onSave: (key: ApiKeyConfig) => void }) => {
    const [name, setName] = useState('');
    const [scopes, setScopes] = useState<string[]>([]);

    const availableScopes = [
        'Relatórios', 'Produtos', 'Gerenciar ingressos', 'Vendas', 'Reembolsar vendas', 'Afiliados', 'Financeiro', 'Webhooks'
    ];

    const toggleScope = (scope: string) => {
        if (scopes.includes(scope)) setScopes(scopes.filter(s => s !== scope));
        else setScopes([...scopes, scope]);
    };

    const handleSave = () => {
        if (!name) return alert("Defina um nome");
        if (scopes.length === 0) return alert("Selecione pelo menos um escopo.");

        const newKey: ApiKeyConfig = {
            id: Date.now().toString(),
            name,
            clientId: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
            clientSecret: 'sk_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
            scopes,
            createdAt: new Date().toLocaleDateString()
        };
        onSave(newKey);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
             <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 text-slate-800">
                 <div className="p-6 border-b border-slate-200">
                     <h3 className="text-xl font-bold">Criar API Key</h3>
                 </div>
                 <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nome</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2" placeholder="Ex: Integração Mobile" />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Escopos (Endpoints)</label>
                        <div className="space-y-2">
                             {availableScopes.map(scope => (
                                <label key={scope} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-200">
                                    <input 
                                        type="checkbox" 
                                        checked={scopes.includes(scope)} 
                                        onChange={() => toggleScope(scope)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-600">{scope}</span>
                                </label>
                             ))}
                        </div>
                    </div>
                 </div>
                 <div className="p-4 border-t border-slate-200 flex justify-end gap-2">
                     <button onClick={onClose} className="px-4 py-2 text-slate-500">Cancelar</button>
                     <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">Criar</button>
                 </div>
             </div>
        </div>
    );
};

// API RESULT MODAL
const ApiResultModal = ({ apiKey, onClose }: { apiKey: ApiKeyConfig, onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 text-slate-800 shadow-2xl">
                 <div className="p-6 text-center">
                     <h3 className="text-xl font-bold mb-2">Copiar sua API Key</h3>
                     <p className="text-sm text-slate-500 mb-6">Por favor, copie o client_secret agora. Por segurança, ele não será exibido novamente.</p>
                     
                     <div className="space-y-4 text-left">
                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase">Client ID</label>
                             <input readOnly value={apiKey.clientId} className="w-full bg-slate-100 border border-slate-200 rounded p-2 text-sm font-mono text-slate-600" />
                         </div>
                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase">Client Secret</label>
                             <div className="flex gap-2">
                                <input readOnly value={apiKey.clientSecret} className="w-full bg-slate-100 border border-slate-200 rounded p-2 text-sm font-mono text-emerald-600 font-bold" />
                             </div>
                         </div>
                     </div>
                 </div>
                 <div className="p-4 bg-slate-50 text-center">
                     <button onClick={onClose} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-500/30">
                         Copiei, pode fechar
                     </button>
                 </div>
            </div>
        </div>
    );
};

export default Integrations;