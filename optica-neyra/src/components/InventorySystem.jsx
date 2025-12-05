import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, AlertCircle, Package, DollarSign, TrendingDown } from 'lucide-react';
import { supabase } from '../supabaseClient'; // Conexión a Supabase

const InventorySystem = () => {
  // Estado inicial vacío (esperando datos reales)
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');

  const categorias = ['Todos', 'Armazones', 'Lentes Oftálmicos', 'Lentes de Contacto', 'Líquidos', 'Accesorios'];
  const proveedores = ['GMO', 'Econolentes', 'Vision Center', 'Suntime Store', 'SUEGUST LENS'];

  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'Armazones',
    proveedor: 'GMO',
    codigo: '',
    stock: 0,
    stockMinimo: 0,
    costo: 0,
    precioVenta: 0,
    color: '',
    tamaño: '',
    modelo: ''
  });

  // CARGAR PRODUCTOS DESDE SUPABASE
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('id', { ascending: true });
      
      if (error) throw error;

      const formattedData = data.map(item => ({
        ...item,
        stockMinimo: item.stock_minimo,
        precioVenta: item.precio_venta,
        tamaño: item.tamano
      }));
      
      setProducts(formattedData);
    } catch (error) {
      alert('Error cargando productos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      categoria: 'Armazones',
      proveedor: 'GMO',
      codigo: '',
      stock: 0,
      stockMinimo: 0,
      costo: 0,
      precioVenta: 0,
      color: '',
      tamaño: '',
      modelo: ''
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  // GUARDAR EN SUPABASE
  const handleSubmit = async () => {
    if (!formData.nombre || !formData.proveedor || !formData.codigo) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    const productData = {
      nombre: formData.nombre,
      categoria: formData.categoria,
      proveedor: formData.proveedor,
      codigo: formData.codigo,
      stock: formData.stock,
      stock_minimo: formData.stockMinimo,
      costo: formData.costo,
      precio_venta: formData.precioVenta,
      color: formData.color,
      tamano: formData.tamaño,
      modelo: formData.modelo
    };
    
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('productos')
          .update(productData)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('productos')
          .insert([productData]);
        if (error) throw error;
      }
      fetchProducts();
      resetForm();
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    }
  };

  const handleEdit = (product) => {
    setFormData(product);
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        const { error } = await supabase
          .from('productos')
          .delete()
          .eq('id', id);
        if (error) throw error;
        fetchProducts();
      } catch (error) {
        alert('Error al eliminar: ' + error.message);
      }
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.proveedor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'Todos' || product.categoria === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(p => p.stock <= p.stockMinimo);
  const totalValue = products.reduce((sum, p) => sum + (p.stock * p.costo), 0);

  // INTERFAZ VISUAL
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Óptica Neyra - Inventario</h1>
              <p className="text-gray-600">Sistema de Gestión de Productos y Control de Stock</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Base de Datos: Supabase</p>
              <p className="text-2xl font-bold text-blue-600">S/</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow-md"
            >
              <Plus size={20} /> Nuevo Producto
            </button>
          </div>
        </div>

        {/* Loading / Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl text-blue-600 animate-pulse">Cargando datos desde la nube...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Producto</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Categoría</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Precio</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-blue-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.nombre}</div>
                        <div className="text-xs text-gray-500">{product.codigo}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">{product.categoria}</span>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            product.stock <= product.stockMinimo 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {product.stock} uds
                          </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">S/ {Number(product.precioVenta).toFixed(2)}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <button onClick={() => handleEdit(product)} className="text-blue-600 p-2"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(product.id)} className="text-red-600 p-2"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">No hay productos en el inventario.</div>
              )}
            </div>
          </div>
        )}
        
        {/* Formulario Modal (Simplificado para encajar) */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
               <h2 className="text-2xl font-bold mb-4">{editingProduct ? 'Editar' : 'Nuevo'} Producto</h2>
               <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Nombre" className="border p-2 rounded" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                  <input placeholder="Código" className="border p-2 rounded" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} />
                  <select className="border p-2 rounded" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                     {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="number" placeholder="Stock" className="border p-2 rounded" value={formData.stock} onChange={e => setFormData({...formData, stock: +e.target.value})} />
                  <input type="number" placeholder="Costo" className="border p-2 rounded" value={formData.costo} onChange={e => setFormData({...formData, costo: +e.target.value})} />
                  <input type="number" placeholder="Precio Venta" className="border p-2 rounded" value={formData.precioVenta} onChange={e => setFormData({...formData, precioVenta: +e.target.value})} />
                  <input type="number" placeholder="Stock Mínimo" className="border p-2 rounded" value={formData.stockMinimo} onChange={e => setFormData({...formData, stockMinimo: +e.target.value})} />
                  <input placeholder="Proveedor" className="border p-2 rounded" value={formData.proveedor} onChange={e => setFormData({...formData, proveedor: e.target.value})} />
               </div>
               <div className="flex gap-2 mt-4">
                 <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded flex-1">Guardar</button>
                 <button onClick={resetForm} className="bg-gray-300 px-4 py-2 rounded flex-1">Cancelar</button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventorySystem;