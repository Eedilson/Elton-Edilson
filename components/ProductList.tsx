import React from 'react';
import { Product } from '../types';
import { FileText, Edit, Trash2, ExternalLink, Plus, Smartphone, MonitorPlay, LayoutTemplate } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  onCreateNew: () => void;
  onEditProduct: (product: Product) => void;
  onEditCheckout: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onCreateNew, onEditProduct, onEditCheckout }) => {
  
  const getIconByType = (type?: string) => {
      if (type === 'application') return <Smartphone className="w-5 h-5" />;
      if (type === 'course') return <MonitorPlay className="w-5 h-5" />;
      return <FileText className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-white">Meus Produtos</h2>
            <div className="text-sm text-gray-400">Gerencie seus produtos digitais</div>
        </div>
        
        <button
            onClick={onCreateNew}
            className="flex items-center justify-center px-6 py-3 text-sm font-bold text-white transition-all duration-200 bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 group whitespace-nowrap"
        >
            <Plus className="w-5 h-5 mr-2" />
            Novo Produto
        </button>
      </div>

      <div className="bg-[#1e2329] rounded-xl shadow-sm border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#0f1419] border-b border-gray-800">
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Preço Base</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Vendas</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Receita</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {products.map((product) => (
                <tr 
                    key={product.id} 
                    className="hover:bg-[#2d333b] transition-colors group cursor-pointer"
                    onClick={() => onEditProduct(product)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-800 rounded-lg flex items-center justify-center text-emerald-500 overflow-hidden">
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            getIconByType(product.productType)
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-white">{product.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]">
                            {product.description ? product.description.substring(0, 30) + '...' : 'Sem descrição'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-800 text-gray-300 border border-gray-700 capitalize">
                      {product.productType || 'ebook'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">
                    {product.price.toLocaleString('pt-MZ')} MT
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {product.salesCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-500 font-bold">
                    {product.revenue.toLocaleString('pt-MZ')} MT
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                    }`}>
                      {product.status === 'active' ? 'Ativo' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEditCheckout(product); }}
                        className="text-gray-500 hover:text-purple-500 p-1" 
                        title="Editar Checkout"
                      >
                        <LayoutTemplate className="w-4 h-4" />
                      </button>
                      {product.links?.checkout && (
                          <a 
                            href={product.links.checkout} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-gray-500 hover:text-emerald-500 p-1" 
                            title="Ver Checkout"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                      )}
                      <button className="text-gray-500 hover:text-red-500 p-1" title="Excluir" onClick={(e) => e.stopPropagation()}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {products.length === 0 && (
                <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        Nenhum produto encontrado. Crie seu primeiro produto agora!
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductList;