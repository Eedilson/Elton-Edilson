import React, { useState } from 'react';
import { Product } from '../types';
import { 
  Copy, ExternalLink, DollarSign, Users, MousePointer, 
  Search, Filter, MoreHorizontal, Check, X, SlidersHorizontal, UserCheck
} from 'lucide-react';

interface AffiliatesProps {
  affiliatedProducts: Product[];
  onGoToVitrine: () => void;
}

// Mock Data for "My Affiliates" (People affiliated to MY products)
const MOCK_MY_AFFILIATES = [
  { id: 1, date: '12/12/2025', name: 'João Silva', email: 'joao.silva@gmail.com', product: 'Destravando o Iceberg', commission: '150.00 MT', status: 'active' },
  { id: 2, date: '11/12/2025', name: 'Maria Santos', email: 'maria.s@hotmail.com', product: 'Código da Reconquista', commission: '240.00 MT', status: 'pending' },
  { id: 3, date: '10/12/2025', name: 'Pedro Muxanga', email: 'pedro.mux@outlook.com', product: 'Destravando o Iceberg', commission: '150.00 MT', status: 'active' },
  { id: 4, date: '05/12/2025', name: 'Ana Costa', email: 'ana.costa@gmail.com', product: 'Mentoria 10x', commission: '500.00 MT', status: 'rejected' },
  { id: 5, date: '01/12/2025', name: 'Lucas Tamele', email: 'lucas.t@yahoo.com', product: 'Código da Reconquista', commission: '240.00 MT', status: 'active' },
];

type AffiliateViewMode = 'producer' | 'affiliate';

const Affiliates: React.FC<AffiliatesProps> = ({ affiliatedProducts, onGoToVitrine }) => {
  const [viewMode, setViewMode] = useState<AffiliateViewMode>('producer'); // Default to Producer view (Screenshots)
  const [activeTab, setActiveTab] = useState<'ativos' | 'pendentes' | 'recusados'>('ativos');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter Logic for Producer View
  const getFilteredAffiliates = () => {
    let statusFilter = '';
    switch(activeTab) {
      case 'ativos': statusFilter = 'active'; break;
      case 'pendentes': statusFilter = 'pending'; break;
      case 'recusados': statusFilter = 'rejected'; break;
    }

    return MOCK_MY_AFFILIATES.filter(aff => 
      (statusFilter === '' || aff.status === statusFilter) &&
      (aff.name.toLowerCase().includes(searchTerm.toLowerCase()) || aff.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const filteredAffiliates = getFilteredAffiliates();

  // --- RENDER: PRODUCER VIEW (Meus Afiliados) ---
  const renderProducerView = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
       <div className="bg-[#1e2329] border border-gray-800 rounded-xl overflow-hidden shadow-sm">
          {/* Header & Tabs */}
          <div className="border-b border-gray-800 p-6 pb-0">
             <h3 className="text-xl font-bold text-white mb-6">Meus Afiliados</h3>
             <div className="flex gap-6 overflow-x-auto">
                {[
                  { id: 'ativos', label: 'Ativos' },
                  { id: 'pendentes', label: 'Pendentes' },
                  { id: 'recusados', label: 'Recusados, Bloqueados Ou Cancelados' }
                ].map(tab => (
                   <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`pb-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                        activeTab === tab.id 
                          ? 'border-emerald-500 text-emerald-500' 
                          : 'border-transparent text-gray-400 hover:text-white'
                      }`}
                   >
                      {tab.label}
                   </button>
                ))}
             </div>
          </div>

          {/* Controls Bar */}
          <div className="p-4 bg-[#161b22] border-b border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Pesquisar por nome ou e-mail" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#0f1419] border border-gray-700 text-gray-300 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                />
             </div>
             <div className="flex gap-3 w-full md:w-auto">
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-emerald-900/20">
                   <MoreHorizontal className="w-4 h-4" /> Ações
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0f1419] border border-gray-700 hover:border-gray-500 text-gray-300 rounded-lg font-medium text-sm transition-colors">
                   <SlidersHorizontal className="w-4 h-4" /> Filtros
                </button>
             </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-[#1e2329] border-b border-gray-800">
                   <tr>
                      <th className="px-6 py-4 w-4">
                        <input type="checkbox" className="rounded border-gray-700 bg-[#0f1419] text-emerald-500 focus:ring-emerald-500" />
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Data</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Nome</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">E-mail</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Produto</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Comissão</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                   {filteredAffiliates.length === 0 ? (
                      <tr>
                         <td colSpan={8} className="px-6 py-12 text-center text-gray-500 bg-[#161b22]">
                            Nenhum registro encontrado
                         </td>
                      </tr>
                   ) : (
                      filteredAffiliates.map(aff => (
                         <tr key={aff.id} className="hover:bg-[#252b33] transition-colors bg-[#161b22]">
                            <td className="px-6 py-4">
                               <input type="checkbox" className="rounded border-gray-700 bg-[#0f1419] text-emerald-500 focus:ring-emerald-500" />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-400">{aff.date}</td>
                            <td className="px-6 py-4 text-sm font-bold text-white">{aff.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-400">{aff.email}</td>
                            <td className="px-6 py-4 text-sm text-emerald-500">{aff.product}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-300">{aff.commission}</td>
                            <td className="px-6 py-4">
                               <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                  aff.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                  aff.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                  'bg-red-500/10 text-red-500 border-red-500/20'
                               }`}>
                                  {aff.status === 'active' ? 'Ativo' : aff.status === 'pending' ? 'Pendente' : 'Recusado'}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <button className="text-gray-500 hover:text-white p-1">
                                  <MoreHorizontal className="w-4 h-4" />
                               </button>
                            </td>
                         </tr>
                      ))
                   )}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );

  // --- RENDER: AFFILIATE VIEW (Sou Afiliado) ---
  const renderAffiliateView = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Affiliate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1e2329] p-6 rounded-xl border border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-gray-400 font-medium">Comissões Pendentes</span>
          </div>
          <p className="text-2xl font-bold text-white">12.500 MT</p>
        </div>
        <div className="bg-[#1e2329] p-6 rounded-xl border border-gray-800">
           <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <MousePointer className="w-5 h-5" />
            </div>
            <span className="text-gray-400 font-medium">Cliques nos Links</span>
          </div>
          <p className="text-2xl font-bold text-white">1,240</p>
        </div>
        <div className="bg-[#1e2329] p-6 rounded-xl border border-gray-800">
           <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-gray-400 font-medium">Vendas Realizadas</span>
          </div>
          <p className="text-2xl font-bold text-white">18</p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8 mb-4">
         <h3 className="text-lg font-bold text-white">Produtos que promovo</h3>
         <button 
          onClick={onGoToVitrine}
          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
        >
          Encontrar mais produtos
        </button>
      </div>

      {affiliatedProducts.length === 0 ? (
        <div className="bg-[#1e2329] border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">Você ainda não se afiliou a nenhum produto.</p>
          <button 
            onClick={onGoToVitrine}
            className="text-emerald-500 font-bold hover:underline"
          >
            Ir para a Vitrine
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {affiliatedProducts.map(product => (
            <div key={product.id} className="bg-[#1e2329] border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-emerald-500/30 transition-colors">
              <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                 {product.imageUrl ? (
                    <img src={product.imageUrl} className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">{product.name[0]}</div>
                 )}
              </div>
              
              <div className="flex-1">
                <h4 className="text-white font-bold">{product.name}</h4>
                <p className="text-gray-500 text-sm">Comissão: <span className="text-emerald-500 font-bold">{(product.price * (product.commissionPercentage || 0.1)).toLocaleString('pt-MZ')} MT</span> por venda</p>
              </div>

              <div className="w-full md:w-auto flex flex-col gap-2">
                <div className="flex items-center gap-2 bg-[#0f1419] border border-gray-700 rounded-lg px-3 py-2">
                  <span className="text-xs text-gray-500 font-mono truncate max-w-[200px]">https://simba.app/pay/{product.id}?ref=user123</span>
                  <button className="text-gray-400 hover:text-white" title="Copiar Link">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <button className="text-xs text-gray-500 hover:text-emerald-500 flex items-center justify-center gap-1">
                  Ver Página de Vendas <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
                {viewMode === 'producer' ? 'Gestão de Afiliados' : 'Minhas Afiliações'}
            </h2>
            <p className="text-sm text-gray-400">
                {viewMode === 'producer' 
                    ? 'Gerencie quem está vendendo seus produtos.' 
                    : 'Acompanhe os produtos que você promove.'}
            </p>
          </div>
          
          {/* Toggle View Mode */}
          <div className="bg-[#1e2329] p-1 rounded-lg border border-gray-800 flex">
             <button 
                onClick={() => setViewMode('producer')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    viewMode === 'producer' 
                    ? 'bg-[#0f1419] text-white shadow' 
                    : 'text-gray-400 hover:text-white'
                }`}
             >
                <Users className="w-4 h-4" /> Meus Afiliados
             </button>
             <button 
                onClick={() => setViewMode('affiliate')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    viewMode === 'affiliate' 
                    ? 'bg-[#0f1419] text-white shadow' 
                    : 'text-gray-400 hover:text-white'
                }`}
             >
                <UserCheck className="w-4 h-4" /> Sou Afiliado
             </button>
          </div>
       </div>

       {viewMode === 'producer' ? renderProducerView() : renderAffiliateView()}
    </div>
  );
};

export default Affiliates;