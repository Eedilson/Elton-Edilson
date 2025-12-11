import React, { useState } from 'react';
import { Eye, EyeOff, Search, Filter, ChevronDown, MoreVertical } from 'lucide-react';

// Mock Data for Sales
const SALES_DATA = [
  {
    id: '1',
    date: '19/11/2025 00:59',
    product: 'Comunidade Espião - HelpSpyAds',
    customer: 'Luiz Paulo Amaral Peixoto',
    customerEmail: 'luiz.paulo@gmail.com',
    status: 'Pago',
    method: 'M-Pesa',
    recurrence: 1,
    netValue: 23.63,
  },
  {
    id: '2',
    date: '17/11/2025 19:13',
    product: 'Comunidade Espião - HelpSpyAds',
    customer: 'Edson Magule',
    customerEmail: 'edson.magule@hotmail.com',
    status: 'Pago',
    method: 'e-Mola',
    recurrence: 1,
    netValue: 22.68,
  },
  {
      id: '3',
      date: '15/11/2025 14:30',
      product: 'Curso de Marketing Digital',
      customer: 'Ana Maria Silva',
      customerEmail: 'ana.silva@outlook.com',
      status: 'Pago',
      method: 'Cartão de Crédito',
      recurrence: 1,
      netValue: 1500.00,
  },
  {
      id: '4',
      date: '15/11/2025 10:15',
      product: 'Mentoria 10x',
      customer: 'João Monjane',
      customerEmail: 'joao.m@gmail.com',
      status: 'Pago',
      method: 'M-Pesa',
      recurrence: 2,
      netValue: 500.00,
  }
];

const MySales: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Aprovadas');
    const [showValues, setShowValues] = useState(true);

    const cards = [
        { label: 'Vendas encontradas', value: '5' },
        { label: 'Valor líquido', value: '148,50 MT' },
        { label: 'Total reembolsado', value: '0,00 MT' },
        { label: 'Vendas no M-Pesa', value: '70,14 MT' },
        { label: 'Porcentagem de reembolso', value: '0,0%' },
        { label: 'Chargeback', value: '0,00 MT' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Minhas Vendas</h2>
                <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2 bg-[#1e2329] px-3 py-1.5 rounded-full border border-gray-700 cursor-pointer hover:border-gray-500 transition-colors" title="Alternar tema">
                         <div className="w-8 h-4 bg-gray-600 rounded-full relative px-0.5 flex items-center">
                           <div className="w-3 h-3 bg-white rounded-full absolute right-0.5"></div>
                        </div>
                    </div>
                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-lg shadow-emerald-900/20">
                        Exportar <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-[#1e2329] p-6 rounded-xl border border-gray-800 flex flex-col justify-between h-32 hover:border-emerald-500/30 transition-colors group">
                        <div className="flex justify-between items-start">
                            <span className="text-gray-400 text-sm font-medium">{card.label}</span>
                             <button onClick={() => setShowValues(!showValues)} className="text-gray-500 hover:text-white transition-colors">
                                {showValues ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {showValues ? card.value : '****'}
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs & Filters Area */}
            <div className="bg-[#1e2329] border border-gray-800 rounded-xl overflow-hidden shadow-sm">
                {/* Tabs */}
                <div className="flex border-b border-gray-800 overflow-x-auto">
                    {['Aprovadas', 'Reembolsadas', 'Chargeback', 'MED', 'Todas'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === tab 
                                ? 'border-emerald-500 text-emerald-500' 
                                : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/50'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Filter Bar */}
                <div className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-[#1e2329]">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Pesquisar" 
                            className="w-full bg-[#0f1419] border border-gray-700 text-gray-300 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-emerald-500 transition-colors placeholder-gray-600"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0f1419] border border-gray-700 rounded-lg text-gray-300 font-medium hover:text-white hover:border-gray-600 transition-colors w-full md:w-auto justify-center">
                        <Filter className="w-4 h-4" /> Filtros
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#161b22] border-y border-gray-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Produto</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Valor Líquido</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {SALES_DATA.map(sale => (
                                <tr key={sale.id} className="hover:bg-[#252b33] transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-300 font-medium whitespace-nowrap">{sale.date}</td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{sale.product}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-white">{sale.customer}</div>
                                        <div className="text-xs text-gray-500">{sale.customerEmail}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <div>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 uppercase tracking-wide">
                                                    {sale.status}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-gray-500">Recorrência: {sale.recurrence}</div>
                                            <div className="text-[10px] text-gray-500">{sale.method}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-white whitespace-nowrap">
                                        MT {sale.netValue.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-500 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {SALES_DATA.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                        Nenhuma venda encontrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination (Visual only) */}
                <div className="bg-[#161b22] px-6 py-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
                     <span>Mostrando 1-4 de 4 resultados</span>
                     <div className="flex gap-2">
                        <button className="px-3 py-1 bg-[#1e2329] rounded border border-gray-700 hover:text-white disabled:opacity-50" disabled>Anterior</button>
                        <button className="px-3 py-1 bg-[#1e2329] rounded border border-gray-700 hover:text-white disabled:opacity-50" disabled>Próxima</button>
                     </div>
                </div>
            </div>
        </div>
    );
};
export default MySales;