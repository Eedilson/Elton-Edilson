import React, { useState } from 'react';
import { Search, Filter, Thermometer, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface VitrineProps {
  products: Product[];
  onAffiliateClick: (product: Product) => void;
}

const Vitrine: React.FC<VitrineProps> = ({ products, onAffiliateClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter only active products
  const marketplaceProducts = products.filter(p => 
    p.status === 'active' && 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-white">Vitrine de Afiliação</h2>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#1e2329] p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Pesquisar produtos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0f1419] border border-gray-800 text-gray-300 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <select className="bg-[#0f1419] border border-gray-800 text-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:border-emerald-500 text-sm flex-1">
            <option>Todas as categorias</option>
            <option>Finanças</option>
            <option>Marketing</option>
            <option>Saúde</option>
          </select>

          <select className="bg-[#0f1419] border border-gray-800 text-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:border-emerald-500 text-sm flex-1">
            <option>Mais quentes</option>
            <option>Mais recentes</option>
            <option>Maior comissão</option>
          </select>

          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0f1419] border border-gray-800 rounded-lg text-gray-300 hover:text-white hover:border-emerald-500 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="hidden md:inline">Filtros</span>
          </button>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        Mais quentes que o deserto <span className="text-2xl">🌵</span>
      </h3>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {marketplaceProducts.map((product) => {
          const commissionValue = (product.price * (product.commissionPercentage || 0.1));
          
          return (
            <div key={product.id} className="bg-[#1e2329] rounded-xl overflow-hidden border border-gray-800 hover:border-emerald-500/50 transition-all group flex flex-col h-full">
              {/* Image Area */}
              <div className="relative h-48 bg-gray-800 overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <span className="text-gray-600 font-bold text-lg">{product.name.substring(0,2).toUpperCase()}</span>
                  </div>
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button 
                     onClick={() => onAffiliateClick(product)}
                     className="bg-emerald-500 text-white px-6 py-2 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform flex items-center gap-2"
                   >
                     Afiliar-se Agora <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white text-lg line-clamp-1" title={product.name}>{product.name}</h4>
                  <div className="flex items-center text-emerald-500 font-bold text-sm bg-emerald-500/10 px-2 py-1 rounded">
                    {product.temperature || 150}° <Thermometer className="w-3 h-3 ml-1" />
                  </div>
                </div>

                <div className="mt-auto">
                  <p className="text-gray-500 text-xs mb-1">Você recebe até</p>
                  <p className="text-2xl font-bold text-emerald-500 mb-4">
                    {commissionValue.toLocaleString('pt-MZ')} MT
                  </p>

                  <div className="space-y-1">
                    {product.tags && product.tags.length > 0 ? (
                        product.tags.map((tag, idx) => (
                            <div key={idx} className="flex items-center text-xs text-gray-400">
                                <div className="w-3 h-3 border border-emerald-500/30 bg-emerald-500/10 rounded flex items-center justify-center mr-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                </div>
                                {tag}
                            </div>
                        ))
                    ) : (
                         <>
                            <div className="flex items-center text-xs text-gray-400">
                                <div className="w-3 h-3 border border-emerald-500/30 bg-emerald-500/10 rounded flex items-center justify-center mr-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                </div>
                                Página de alta conversão
                            </div>
                            <div className="flex items-center text-xs text-gray-400">
                                <div className="w-3 h-3 border border-emerald-500/30 bg-emerald-500/10 rounded flex items-center justify-center mr-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                </div>
                                Suporte para afiliados
                            </div>
                        </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Vitrine;