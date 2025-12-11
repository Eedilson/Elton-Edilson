import React, { useState } from 'react';
import { HelpCircle, ChevronDown, CheckCircle, Clock } from 'lucide-react';
import { Transaction } from '../types';

// Mock Data matching the screenshot logic
const MOCK_TRANSACTIONS: Transaction[] = [
    { id: '1', date: '05/12/2025', amount: 356.33, type: 'sale', status: 'success' },
    { id: '2', date: '19/11/2025', amount: 289.24, type: 'sale', status: 'success' },
    { id: '3', date: '17/11/2025', amount: 66.33, type: 'sale', status: 'success' },
    { id: '4', date: '17/11/2025', amount: 3.33, type: 'sale', status: 'success' },
    { id: '5', date: '15/11/2025', amount: 217.96, type: 'sale', status: 'success' },
    { id: '6', date: '29/10/2025', amount: 282.33, type: 'sale', status: 'success' },
    { id: '7', date: '08/10/2025', amount: 265.12, type: 'sale', status: 'success' },
    { id: '8', date: '24/09/2025', amount: 503.33, type: 'sale', status: 'success' },
];

const Finance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'saques' | 'dados' | 'taxas' | 'identidade'>('saques');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Financeiro</h2>
        <div className="bg-[#1e2329] border border-gray-700 rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-gray-300">
            <span>MZN (MT)</span>
            <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Available Balance */}
          <div className="bg-[#1e2329] rounded-xl p-8 border-l-4 border-l-emerald-500 border-y border-r border-gray-800 shadow-sm relative overflow-hidden">
              <p className="text-gray-400 text-sm font-medium mb-2">Saldo disponível</p>
              <h3 className="text-4xl font-bold text-white">166,02 MT</h3>
          </div>

          {/* Pending Balance */}
          <div className="bg-[#1e2329] rounded-xl p-8 border-l-4 border-l-yellow-500 border-y border-r border-gray-800 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                  <p className="text-gray-400 text-sm font-medium">Saldo pendente</p>
                  <HelpCircle className="w-4 h-4 text-gray-500 cursor-help" />
              </div>
              <h3 className="text-4xl font-bold text-white">37,56 MT</h3>
          </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
          <a href="#" className="text-sm text-blue-400 hover:text-blue-300 hover:underline">Alterar minha conta para CNPJ/Empresa</a>
          <button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-indigo-900/20 transition-all">
              Efetuar saque
          </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
          <div className="flex gap-8">
            {[
                { id: 'saques', label: 'Saques' },
                { id: 'dados', label: 'Dados bancários' },
                { id: 'taxas', label: 'Taxas e Prazos' },
                { id: 'identidade', label: 'Identidade' },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-4 text-sm font-medium transition-all relative ${
                        activeTab === tab.id 
                        ? 'text-blue-500' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                >
                    {tab.label}
                    {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full"></div>
                    )}
                </button>
            ))}
          </div>
      </div>

      {/* Content Area (Table) */}
      <div className="bg-[#1e2329] rounded-xl border border-gray-800 overflow-hidden">
         <table className="w-full text-left">
             <thead>
                 <tr className="border-b border-gray-800">
                     <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Data</th>
                     <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Valor</th>
                     <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Status</th>
                 </tr>
             </thead>
             <tbody className="divide-y divide-gray-800">
                 {MOCK_TRANSACTIONS.map((tx) => (
                     <tr key={tx.id} className="hover:bg-[#252b33] transition-colors">
                         <td className="px-6 py-4 text-sm text-gray-400">{tx.date}</td>
                         <td className="px-6 py-4 text-sm font-medium text-white">{tx.amount.toLocaleString('pt-MZ')} MT</td>
                         <td className="px-6 py-4 text-right">
                             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                 {tx.status === 'success' ? 'Sucesso' : tx.status}
                             </span>
                         </td>
                     </tr>
                 ))}
             </tbody>
         </table>
         <div className="p-4 border-t border-gray-800 text-center">
             <button className="text-xs text-gray-500 hover:text-white">Carregar mais</button>
         </div>
      </div>

    </div>
  );
};

export default Finance;