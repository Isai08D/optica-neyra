import React, { useState, useEffect } from 'react';
import { 
  Search, 
  UserPlus, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  Trash2, 
  X,
  Save,
  User
} from 'lucide-react';
import { supabase } from '../supabaseClient'; // Conexión a Supabase

const CustomerManagement = () => {
  // Estado para clientes (ahora vacío inicialmente)
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    telefono: '',
    email: '',
    direccion: ''
  });

  // 1. Cargar Clientes desde Supabase
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false }); // Más recientes primero

      if (error) throw error;
      setCustomers(data);
    } catch (error) {
      console.error('Error cargando clientes:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar clientes
  const filteredCustomers = customers.filter(customer =>
    customer.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.dni && customer.dni.includes(searchTerm))
  );

  // Manejar apertura del modal (Crear o Editar)
  const handleOpenModal = (customer = null) => {
    if (customer) {
      setCurrentCustomer(customer);
      setFormData({
        nombre: customer.nombre,
        dni: customer.dni || '',
        telefono: customer.telefono || '',
        email: customer.email || '',
        direccion: customer.direccion || ''
      });
    } else {
      setCurrentCustomer(null);
      setFormData({
        nombre: '',
        dni: '',
        telefono: '',
        email: '',
        direccion: ''
      });
    }
    setShowModal(true);
  };

  // Guardar cliente (Supabase)
  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      if (currentCustomer) {
        // Editar existente
        const { error } = await supabase
          .from('clientes')
          .update(formData)
          .eq('id', currentCustomer.id);
        
        if (error) throw error;
      } else {
        // Crear nuevo
        const { error } = await supabase
          .from('clientes')
          .insert([formData]);
        
        if (error) throw error;
      }
      
      // Recargar lista y cerrar modal
      fetchCustomers();
      setShowModal(false);
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    }
  };

  // Eliminar cliente (Supabase)
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        const { error } = await supabase
          .from('clientes')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchCustomers();
      } catch (error) {
        alert('Error al eliminar: ' + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Clientes</h1>
              <p className="text-gray-600">Directorio de pacientes y clientes - Óptica Neyra</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-lg"
            >
              <UserPlus size={20} />
              Nuevo Cliente
            </button>
          </div>
        </div>

        {/* Buscador y Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="md:col-span-3 bg-white rounded-lg shadow-md p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre o DNI..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Clientes</p>
              <p className="text-3xl font-bold text-purple-600">{customers.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <User className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        {/* Lista de Clientes */}
        {loading ? (
           <div className="text-center py-12">
             <p className="text-purple-600 animate-pulse text-xl">Cargando directorio...</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map(customer => (
              <div key={customer.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">
                        {customer.nombre.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{customer.nombre}</h3>
                        <p className="text-sm text-gray-500">DNI: {customer.dni || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleOpenModal(customer)}
                        className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(customer.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      <span>{customer.telefono || 'Sin teléfono'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      <span className="truncate">{customer.email || 'Sin email'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="truncate">{customer.direccion || 'Sin dirección'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
                    <span>Registrado: {new Date(customer.created_at).toLocaleDateString()}</span>
                    <span className="text-purple-600 font-medium cursor-pointer hover:underline">Ver Historial</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredCustomers.length === 0 && (
                <div className="col-span-full text-center py-10 text-gray-500">
                    No se encontraron clientes.
                </div>
            )}
          </div>
        )}

        {/* Modal Formulario */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {currentCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                    <input
                      type="text"
                      maxLength="8"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      value={formData.dni}
                      onChange={(e) => setFormData({...formData, dni: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <textarea
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                    value={formData.direccion}
                    onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  ></textarea>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex justify-center items-center gap-2"
                  >
                    <Save size={18} />
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerManagement;