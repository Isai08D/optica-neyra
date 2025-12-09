import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, TrendingUp, DollarSign, ShoppingBag, Search,
  Trophy, AlertTriangle, CreditCard, Eye, X, Package
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const SalesReports = () => {
  const [sales, setSales] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- NUEVOS ESTADOS PARA EL MODAL DE DETALLE ---
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: salesData, error: salesError } = await supabase.from('ventas').select('*').order('created_at', { ascending: false });
      if (salesError) throw salesError;

      const { data: stockData, error: stockError } = await supabase.from('productos').select('*').lt('stock', 5).order('stock', { ascending: true });
      if (stockError) throw stockError;

      setSales(salesData);
      setLowStockProducts(stockData);
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = useMemo(() => {
    let filtered = sales;
    const now = new Date();
    if (timeFilter === 'today') filtered = filtered.filter(s => new Date(s.created_at).toDateString() === now.toDateString());
    else if (timeFilter === 'week') { const d = new Date(); d.setDate(d.getDate() - 7); filtered = filtered.filter(s => new Date(s.created_at) >= d); }
    else if (timeFilter === 'month') { const d = new Date(now.getFullYear(), now.getMonth(), 1); filtered = filtered.filter(s => new Date(s.created_at) >= d); }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(s => (s.cliente_nombre?.toLowerCase().includes(lower) || s.metodo_pago?.toLowerCase().includes(lower)));
    }
    return filtered;
  }, [sales, timeFilter, searchTerm]);

  const { stats, topProducts, paymentBreakdown } = useMemo(() => {
    const totalRevenue = filteredSales.reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);
    const totalSalesCount = filteredSales.length;
    const averageTicket = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

    const breakdown = filteredSales.reduce((acc, sale) => {
      const method = sale.metodo_pago ? sale.metodo_pago.toLowerCase() : 'otros';
      acc[method] = (acc[method] || 0) + (parseFloat(sale.total) || 0);
      return acc;
    }, {});

    const productCount = {};
    filteredSales.forEach(sale => {
      if (sale.items && Array.isArray(sale.items)) {
        sale.items.forEach(item => productCount[item.nombre] = (productCount[item.nombre] || 0) + item.quantity);
      }
    });

    let sortedProducts = Object.entries(productCount).map(([name, quantity]) => ({ name, quantity })).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    const maxQuantity = sortedProducts[0]?.quantity || 1;
    sortedProducts = sortedProducts.map(p => ({ ...p, percent: Math.round((p.quantity / maxQuantity) * 100) }));

    return { stats: { totalRevenue, totalSalesCount, averageTicket }, topProducts: sortedProducts, paymentBreakdown: breakdown };
  }, [filteredSales]);

  // --- FUNCIÓN PARA ABRIR MODAL ---
  const handleViewDetail = (sale) => {
    setSelectedSale(sale);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header y Filtros */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><BarChart3 className="text-purple-600" /> Reporte de Ventas</h1>
            <p className="text-gray-500 text-sm">Resumen de rendimiento y estadísticas</p>
          </div>
          <div className="flex bg-white rounded-lg shadow-sm p-1">
            {['today', 'week', 'month', 'all'].map(filter => (
              <button key={filter} onClick={() => setTimeFilter(filter)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${timeFilter === filter ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                {filter === 'all' ? 'Todo' : filter === 'today' ? 'Hoy' : filter === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
        </div>

        {loading ? <div className="text-center py-20 text-purple-600">Cargando datos...</div> : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 flex justify-between">
                <div><p className="text-sm font-medium text-gray-500">Ingresos Totales</p><h3 className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalRevenue)}</h3></div>
                <div className="p-2 bg-green-100 rounded-lg text-green-600"><DollarSign size={24} /></div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 flex justify-between">
                <div><p className="text-sm font-medium text-gray-500">Nro. de Ventas</p><h3 className="text-2xl font-bold text-gray-800">{stats.totalSalesCount}</h3></div>
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><ShoppingBag size={24} /></div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 flex justify-between">
                <div><p className="text-sm font-medium text-gray-500">Ticket Promedio</p><h3 className="text-2xl font-bold text-gray-800">{formatCurrency(stats.averageTicket)}</h3></div>
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><TrendingUp size={24} /></div>
              </div>
            </div>

            {/* Desglose de Caja */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex flex-wrap gap-6 items-center justify-between">
              <h3 className="text-gray-700 font-bold text-sm flex items-center gap-2"><CreditCard size={18} className="text-gray-400"/> Desglose de Caja ({timeFilter === 'today' ? 'Hoy' : 'Periodo'}):</h3>
              <div className="flex gap-8 flex-wrap">
                <div className="flex flex-col"><span className="text-xs text-gray-500 uppercase font-bold">Efectivo</span><span className="text-gray-800 font-bold text-lg">{formatCurrency(paymentBreakdown['efectivo'] || 0)}</span></div>
                <div className="flex flex-col"><span className="text-xs text-gray-500 uppercase font-bold">Yape/Plin</span><span className="text-purple-600 font-bold text-lg">{formatCurrency((paymentBreakdown['yape'] || 0) + (paymentBreakdown['plin'] || 0))}</span></div>
                <div className="flex flex-col"><span className="text-xs text-gray-500 uppercase font-bold">Tarjeta</span><span className="text-blue-600 font-bold text-lg">{formatCurrency(paymentBreakdown['tarjeta'] || 0)}</span></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tabla Historial */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center gap-4">
                  <h3 className="font-bold text-gray-800 text-lg">Historial de Transacciones</h3>
                  <div className="relative"><Search className="absolute left-3 top-2.5 text-gray-400" size={18} /><input type="text" placeholder="Buscar cliente..." className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                </div>
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-800 font-semibold sticky top-0">
                      <tr>
                        <th className="p-4">Fecha</th>
                        <th className="p-4">Cliente</th>
                        <th className="p-4">Método</th>
                        <th className="p-4 text-right">Total</th>
                        <th className="p-4 text-center">Acción</th> {/* Columna Nueva */}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredSales.length > 0 ? filteredSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 text-xs">{formatDate(sale.created_at)}</td>
                          <td className="p-4 font-medium text-gray-900">{sale.cliente_nombre || 'General'}</td>
                          <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${sale.metodo_pago === 'efectivo' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{sale.metodo_pago}</span></td>
                          <td className="p-4 text-right font-bold text-gray-900">{formatCurrency(sale.total)}</td>
                          <td className="p-4 text-center">
                            <button onClick={() => handleViewDetail(sale)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full hover:text-blue-600 transition-colors">
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      )) : <tr><td colSpan="5" className="p-8 text-center text-gray-400">No se encontraron ventas.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Panel Derecho (Top y Alertas) */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-indigo-50"><h3 className="font-bold text-indigo-800 flex items-center gap-2"><Trophy size={18} /> Productos Top</h3></div>
                  <div className="p-6 space-y-5">
                    {topProducts.length > 0 ? topProducts.map((p, i) => (
                      <div key={i}><div className="flex justify-between text-sm mb-1 font-medium text-gray-700"><span className="truncate w-2/3">{p.name}</span><span className="text-indigo-600">{p.quantity} un.</span></div><div className="w-full bg-gray-100 rounded-full h-2.5"><div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${p.percent}%` }}></div></div></div>
                    )) : <p className="text-center text-gray-400 text-sm">Sin datos</p>}
                  </div>
                </div>
                {lowStockProducts.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-red-50"><h3 className="font-bold text-red-800 flex items-center gap-2 text-sm"><AlertTriangle size={16} /> Stock Bajo ({lowStockProducts.length})</h3></div>
                    <ul className="divide-y divide-gray-100 max-h-[200px] overflow-y-auto">{lowStockProducts.map(p => <li key={p.id} className="p-3 flex justify-between text-sm hover:bg-gray-50"><span className="text-gray-700 truncate w-2/3">{p.nombre}</span><span className="font-bold text-red-600">{p.stock} un.</span></li>)}</ul>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* --- MODAL DE DETALLE DE VENTA --- */}
        {showDetailModal && selectedSale && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-800">Detalle de Venta</h3>
                  <p className="text-xs text-gray-500">{formatDate(selectedSale.created_at)}</p>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <div><p className="text-xs text-blue-600 uppercase font-bold">Cliente</p><p className="font-medium text-gray-800">{selectedSale.cliente_nombre || 'General'}</p></div>
                  <div className="text-right"><p className="text-xs text-blue-600 uppercase font-bold">DNI</p><p className="font-medium text-gray-800">{selectedSale.cliente_dni || '-'}</p></div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-2">Productos Comprados</p>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-gray-100">
                        {selectedSale.items && selectedSale.items.map((item, idx) => (
                          <tr key={idx} className="bg-white">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="bg-gray-100 p-2 rounded"><Package size={14} className="text-gray-500"/></div>
                                <div>
                                  <p className="font-medium text-gray-800">{item.nombre}</p>
                                  <p className="text-xs text-gray-500">{item.quantity} x {formatCurrency(item.precioVenta)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-right font-bold text-gray-700">
                              {formatCurrency(item.precioVenta * item.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="font-medium text-gray-600">Total Pagado</span>
                  <span className="text-2xl font-bold text-green-600">{formatCurrency(selectedSale.total)}</span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 flex justify-end">
                <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SalesReports;