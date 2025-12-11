import React, { useState } from 'react';
import { Eye, EyeOff, ChevronDown, CreditCard, Smartphone, Globe, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface DashboardProps {
  products: Product[];
}

const Dashboard: React.FC<DashboardProps> = ({ products }) => {
  const [showValues, setShowValues] = useState(true);

  // Calculate totals
  const totalRevenue = products.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalSales = products.reduce((acc, curr) => acc + curr.salesCount, 0);

  // Mock data for payment methods
  const paymentMethods = [
    { name: 'M-Pesa', icon: Smartphone, conversion: '45%', value: totalRevenue * 0.45 },
    { name: 'e-Mola', icon: Smartphone, conversion: '25%', value: totalRevenue * 0.25 },
    { name: 'Cartão de Crédito', icon: CreditCard, conversion: '20%', value: totalRevenue * 0.20 },
    { name: 'Boleto/Transferência', icon: Globe, conversion: '10%', value: totalRevenue * 0.10 },
  ];

  return (
    <div className="space-y-6 text-white">
      {/* Banner Area */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-900 to-[#0f1419] border border-emerald-500/30 p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
              SIMBA é a <span className="text-emerald-400">1ª plataforma</span> de Moçambique com PaySuite
            </h2>
            <p className="text-gray-400 text-sm md:text-base max-w-xl">
              Saia na frente da concorrência: 87% de renovação automática sem depender de cartão de crédito.
            </p>
          </div>
          <button className="bg-white text-emerald-900 px-6 py-2 rounded-lg font-bold text-sm hover:bg-emerald-50 transition-colors whitespace-nowrap">
            COMEÇAR AGORA ↗
          </button>
        </div>
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <select className="appearance-none bg-[#1e2329] border border-gray-700 text-gray-300 py-2 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:border-emerald-500">
              <option>Tipo</option>
              <option>Venda</option>
              <option>Reembolso</option>
            </select>
            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select className="appearance-none bg-[#1e2329] border border-gray-700 text-gray-300 py-2 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:border-emerald-500 min-w-[150px]">
              <option>Todos Produtos</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select className="appearance-none bg-[#1e2329] border border-gray-700 text-gray-300 py-2 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:border-emerald-500">
              <option>Hoje</option>
              <option>Ontem</option>
              <option>Últimos 7 dias</option>
              <option>Este Mês</option>
            </select>
            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales Value Card */}
        <div className="bg-[#1e2329] p-6 rounded-xl border border-gray-800 relative group hover:border-emerald-500/50 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Vendas realizadas</p>
              <div className="flex items-center gap-2 h-10">
                {showValues ? (
                  <h3 className="text-3xl font-bold text-white">{totalRevenue.toLocaleString('pt-MZ')} MT</h3>
                ) : (
                  <div className="h-8 w-32 bg-gray-700 rounded animate-pulse"></div>
                )}
              </div>
            </div>
            <button 
              onClick={() => setShowValues(!showValues)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              {showValues ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[70%]"></div>
          </div>
        </div>

        {/* Sales Quantity Card */}
        <div className="bg-[#1e2329] p-6 rounded-xl border border-gray-800 relative group hover:border-emerald-500/50 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Quantidade de vendas</p>
              <div className="flex items-center gap-2 h-10">
                {showValues ? (
                  <h3 className="text-3xl font-bold text-white">{totalSales}</h3>
                ) : (
                   <div className="h-8 w-16 bg-gray-700 rounded animate-pulse"></div>
                )}
              </div>
            </div>
            <button 
              onClick={() => setShowValues(!showValues)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              {showValues ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-[45%]"></div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Payment Methods Table */}
        <div className="lg:col-span-2 bg-[#1e2329] rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="font-semibold text-gray-200">Meios de Pagamento</h3>
            <div className="flex gap-4 text-xs font-medium text-gray-500 uppercase">
              <span>Conversão</span>
              <span className="flex items-center gap-1">Valor <Eye className="w-3 h-3" /></span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-800">
            {paymentMethods.map((method, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-800 rounded-lg text-gray-400">
                    <method.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-200">{method.name}</span>
                </div>
                <div className="flex items-center gap-12 md:gap-24">
                  <span className="text-sm text-gray-400 w-12 text-right">{method.conversion}</span>
                  <span className="text-sm text-white font-medium w-24 text-right">
                    {showValues ? `${method.value.toLocaleString('pt-MZ')} MT` : '****'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-800 text-center">
            <button className="text-xs text-gray-500 hover:text-white transition-colors">Ver todos os meios</button>
          </div>
        </div>

        {/* Side Stats */}
        <div className="bg-[#1e2329] rounded-xl border border-gray-800 p-6 space-y-6">
          
          <div className="flex items-center justify-between group">
            <div>
              <p className="text-gray-400 text-xs mb-1">Abandono de Carrinho</p>
              <p className="text-xl font-bold text-white">0</p>
            </div>
            <div className="p-2 rounded-full bg-gray-800 text-gray-500 group-hover:text-emerald-500 transition-colors">
               <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          
          <div className="w-full h-px bg-gray-800"></div>

          <div className="flex items-center justify-between group">
            <div>
              <p className="text-gray-400 text-xs mb-1">Reembolso</p>
              <p className="text-xl font-bold text-white">0%</p>
            </div>
            <div className="p-2 rounded-full bg-gray-800 text-gray-500 group-hover:text-red-500 transition-colors">
               <Eye className="w-5 h-5" />
            </div>
          </div>

          <div className="w-full h-px bg-gray-800"></div>

          <div className="flex items-center justify-between group">
            <div>
              <p className="text-gray-400 text-xs mb-1">Charge Back</p>
              <p className="text-xl font-bold text-white">0%</p>
            </div>
            <div className="p-2 rounded-full bg-gray-800 text-gray-500 group-hover:text-yellow-500 transition-colors">
               <Eye className="w-5 h-5" />
            </div>
          </div>

          <div className="w-full h-px bg-gray-800"></div>

          <div className="flex items-center justify-between group">
            <div>
              <p className="text-gray-400 text-xs mb-1">Disputas (MED)</p>
              <p className="text-xl font-bold text-white">0%</p>
            </div>
            <div className="p-2 rounded-full bg-gray-800 text-gray-500 group-hover:text-blue-500 transition-colors">
               <Eye className="w-5 h-5" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;