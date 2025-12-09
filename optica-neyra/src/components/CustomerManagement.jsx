import React, { useState, useEffect } from 'react';
import {
  Search, UserPlus, Phone, Mail, MapPin, Edit, Trash2,
  X, Save, User, Loader, Star, Award, Smile,
  ShoppingBag, Calendar, Clock, Trophy
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
};

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '', dni: '', telefono: '', email: '', direccion: ''
  });

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: clients, error: clientsError } = await supabase.from('clientes').select('*').order('created_at', { ascending: false });
      if (clientsError) throw clientsError;

      const { data: sales, error: salesError } = await supabase.from('ventas').select('cliente_dni, total');
      if (salesError) throw salesError;

      // Formatear fecha para visualización
      const clientsWithDate = clients.map(c => ({
        ...c,
        fechaRegistro: new Date(c.created_at).toLocaleDateString('es-PE')
      }));

      setCustomers(clientsWithDate);
      setSalesData(sales);
    } catch (error) { console.error('Error:', error.message); } finally { setLoading(false); }
  };

  const getCustomerMetrics = (dni) => {
    if (!dni) return { count: 0, total: 0, level: 'Nuevo' };
    const clientSales = salesData.filter(s => s.cliente_dni === dni);
    const count = clientSales.length;
    const total = clientSales.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);
    
    let level = 'Nuevo';
    if (count >= 5 || total >= 1000) level = 'VIP';
    else if (count >= 2) level = 'Frecuente';
    return { count, total, level };
  };

  const filteredCustomers = customers.filter(customer =>
    (customer.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (customer.dni || '').includes(searchTerm)
  );

  const renderAutomaticBadge = (dni) => {
    const { level } = getCustomerMetrics(dni);
    switch (level) {
      case 'VIP': return <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-bold border border-yellow-200 shadow-sm"><Trophy size={12} fill="currentColor" /> VIP</span>;
      case 'Frecuente': return <span className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold border border-blue-200"><Award size={12} /> Frecuente</span>;
      default: return <span className="flex items-center gap-1 bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full font-medium border border-gray-200"><Smile size={12} /> Nuevo</span>;
    }
  };

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setCurrentCustomer(customer);
      setFormData({ nombre: customer.nombre || '', dni: customer.dni || '', telefono: customer.telefono || '', email: customer.email || '', direccion: customer.direccion || '' });
    } else {
      setCurrentCustomer(null);
      setFormData({ nombre: '', dni: '', telefono: '', email: '', direccion: '' });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentCustomer) await supabase.from('clientes').update(formData).eq('id', currentCustomer.id);
      else await supabase.from('clientes').insert([formData]);
      fetchData(); setShowModal(false);
    } catch (error) { alert(error.message); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar cliente?')) {
      await supabase.from('clientes').delete().eq('id', id);
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const handleViewHistory = async (customer) => {
    if (!customer.dni) return alert("Cliente sin DNI.");
    setSelectedCustomerName(customer.nombre);
    setHistoryLoading(true);
    setShowHistoryModal(true);
    const { data } = await supabase.from('ventas').select('*').eq('cliente_dni', customer.dni).order('created_at', { ascending: false });
    setCustomerHistory(data || []);
    setHistoryLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div><h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Clientes</h1><p className="text-gray-600">Directorio y niveles de fidelización</p></div>
          <button onClick={() => handleOpenModal()} className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-lg"><UserPlus size={20} /> Nuevo Cliente</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="md:col-span-3 bg-white rounded-lg shadow-md p-4 relative"><Search className="absolute left-3 top-3 text-gray-400" size={20} /><input type="text" placeholder="Buscar por nombre o DNI..." className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between"><div><p className="text-gray-500 text-sm">Total Clientes</p><p className="text-3xl font-bold text-purple-600">{customers.length}</p></div><div className="p-3 bg-purple-100 rounded-full"><User className="text-purple-600" size={24} /></div></div>
        </div>

        {loading ? <div className="text-center py-20"><Loader className="animate-spin text-purple-600 mx-auto" /></div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map(customer => {
              const metrics = getCustomerMetrics(customer.dni);
              return (
                <div key={customer.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6 border border-transparent hover:border-purple-200 group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${metrics.level === 'VIP' ? 'bg-yellow-100 text-yellow-600 ring-2 ring-yellow-300' : metrics.level === 'Frecuente' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>{customer.nombre ? customer.nombre.charAt(0).toUpperCase() : '?'}</div>
                      <div className="overflow-hidden">
                        <h3 className="font-bold text-gray-800 text-lg truncate group-hover:text-purple-600 transition-colors">{customer.nombre}</h3>
                        <div className="flex gap-2 items-center mt-1">{renderAutomaticBadge(customer.dni)}</div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(customer)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-full"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(customer.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full"><Trash2 size={18} /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4 py-3 border-y border-gray-50">
                    <div className="text-center border-r border-gray-100"><p className="text-xs text-gray-400 uppercase font-bold">Compras</p><p className="font-bold text-gray-800">{metrics.count}</p></div>
                    <div className="text-center"><p className="text-xs text-gray-400 uppercase font-bold">Total Gastado</p><p className="font-bold text-green-600">{formatCurrency(metrics.total)}</p></div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2"><div className="w-4 flex justify-center"><Phone size={14}/></div> <span className="truncate">{customer.telefono || '-'}</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 flex justify-center"><Mail size={14}/></div> <span className="truncate">{customer.email || '-'}</span></div>
                  </div>
                  
                  {/* --- AQUÍ ESTÁ EL CAMBIO SOLICITADO: Fecha a la izquierda, botón a la derecha --- */}
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-medium">Reg: {customer.fechaRegistro}</span>
                    <button onClick={() => handleViewHistory(customer)} className="text-sm font-bold text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1 transition-colors">
                      Ver Historial <Clock size={14}/>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-gray-800">{currentCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}</h2><button onClick={() => setShowModal(false)}><X size={24} /></button></div>
              <form onSubmit={handleSave} className="space-y-4">
                <div><label className="text-sm font-medium text-gray-700">Nombre</label><input type="text" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium text-gray-700">DNI</label><input type="text" maxLength="8" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={formData.dni} onChange={(e) => setFormData({...formData, dni: e.target.value})} /></div>
                  <div><label className="text-sm font-medium text-gray-700">Teléfono</label><input type="tel" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} /></div>
                </div>
                <div><label className="text-sm font-medium text-gray-700">Email</label><input type="email" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
                <div><label className="text-sm font-medium text-gray-700">Dirección</label><textarea className="w-full px-3 py-2 border rounded-lg resize-none" value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})}></textarea></div>
                <div className="pt-4 flex gap-3"><button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded-lg">Cancelar</button><button type="submit" className="flex-1 py-2 bg-purple-600 text-white rounded-lg">Guardar</button></div>
              </form>
            </div>
          </div>
        )}

        {showHistoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[80vh]">
              <div className="bg-purple-50 p-4 border-b border-purple-100 flex justify-between items-center"><div><h3 className="font-bold text-purple-900">Historial de Compras</h3><p className="text-xs text-purple-600">{selectedCustomerName}</p></div><button onClick={() => setShowHistoryModal(false)}><X size={20} className="text-purple-400 hover:text-purple-600"/></button></div>
              <div className="p-0 overflow-y-auto flex-1">
                {historyLoading ? <div className="text-center py-10"><Loader className="animate-spin text-purple-500 mx-auto"/></div> : customerHistory.length === 0 ? <div className="text-center py-10 text-gray-400"><ShoppingBag size={48} className="mx-auto mb-2 opacity-20"/><p>Sin compras registradas.</p></div> : (
                  <table className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-600 font-semibold sticky top-0"><tr><th className="p-4">Fecha</th><th className="p-4">Productos</th><th className="p-4 text-right">Total</th></tr></thead><tbody className="divide-y divide-gray-100">{customerHistory.map((sale) => (<tr key={sale.id} className="hover:bg-gray-50"><td className="p-4 align-top"><div className="flex items-center gap-1 text-gray-700"><Calendar size={14}/>{new Date(sale.created_at).toLocaleDateString('es-PE')}</div></td><td className="p-4 align-top"><ul className="space-y-1">{sale.items && sale.items.map((item, idx) => <li key={idx} className="text-gray-800 text-xs"><span className="font-bold">{item.quantity}x</span> {item.nombre}</li>)}</ul></td><td className="p-4 text-right align-top font-bold text-green-600">{formatCurrency(sale.total)}</td></tr>))}</tbody></table>
                )}
              </div>
              <div className="bg-gray-50 p-3 text-right border-t border-gray-100"><button onClick={() => setShowHistoryModal(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cerrar</button></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerManagement;