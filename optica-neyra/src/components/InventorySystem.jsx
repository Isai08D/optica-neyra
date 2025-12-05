import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, AlertCircle, Package, DollarSign, TrendingDown } from 'lucide-react';
import { supabase } from '../supabaseClient'; // Importamos la conexión

const InventorySystem = () => {
  // 1. Estado inicial vacío (ya no usamos datos falsos)
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Nuevo estado de carga

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

  // 2. Cargar productos desde Supabase al iniciar
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

      // Convertimos los nombres de columna de la BD (guion bajo) a tus variables (camelCase)
      const formattedData = data.map(item => ({
        ...item,
        stockMinimo: item.stock_minimo,
        precioVenta: item.precio_venta,
        tamaño: item.tamano // Nota: en BD se llama 'tamano' sin ñ
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

  // 3. Guardar en Supabase (Crear o Editar)
  const handleSubmit = async () => {
    if (!formData.nombre || !formData.proveedor || !formData.codigo) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    // Preparamos los datos para enviar a la BD
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
        // ACTUALIZAR
        const { error } = await supabase
          .from('productos')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
      } else {
        // CREAR NUEVO
        const { error } = await supabase
          .from('productos')
          .insert([productData]);
        
        if (error) throw error;
      }
      
      fetchProducts(); // Recargamos la lista real
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

  // 4. Eliminar en Supabase
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        const { error } = await supabase
          .from('productos')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        fetchProducts(); // Recargar lista
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
  
  // Renderizado (Tu UI original se mantiene igual)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Óptica Neyra - Inventario</h1>
              <p className="text-gray-600">Sistema de Gestión de Productos y Control de Stock</p>
              <p className="text-sm text-blue-600 mt-1">📍 Huánuco, Perú</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Moneda: Soles Peruanos</p>
              <p className="text-2xl font-bold text-blue-600">S/</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Productos</p>
                <p className="text-3xl font-bold text-gray-800">{products.length}</p>
              </div>
              <Package className="text-blue-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Valor Inventario</p>
                <p className="text-3xl font-bold text-green-600">S/ {totalValue.toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">Costo total</p>
              </div>
              <DollarSign className="text-green-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Alertas Stock Bajo</p>
                <p className="text-3xl font-bold text-red-600">{lowStockProducts.length}</p>
                <p className="text-xs text-gray-400 mt-1">Requieren reorden</p>
              </div>
              <TrendingDown className="text-red-500" size={40} />
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {lowStockProducts.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg shadow-md">
            <div className="flex items-start">
              <AlertCircle className="text-red-500 mr-3 flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold mb-2 flex items-center">
                  ⚠️ Alertas de Stock Bajo - Acción Requerida
                </h3>
                <div className="space-y-2">
                  {lowStockProducts.map(product => (
                    <div key={product.id} className="bg-white rounded p-3 border border-red-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-red-700 font-medium">{product.nombre}</p>
                          <p className="text-sm text-gray-600">
                            Código: {product.codigo} | Proveedor: {product.proveedor}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-red-800 font-bold">Stock: {product.stock} uds</p>
                          <p className="text-xs text-gray-500">Mínimo: {product.stockMinimo}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre, código o proveedor..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <Plus size={20} />
              Nuevo Producto
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl text-blue-600 font-semibold animate-pulse">Cargando inventario...</p>
          </div>
        ) : (
          /* Products Table */
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Categoría</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Proveedor</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Costo</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">P. Venta</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Margen</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map(product => {
                    const margen = product.precioVenta - product.costo;
                    const margenPorcentaje = product.costo > 0 ? ((margen / product.costo) * 100).toFixed(1) : '0';
                    
                    return (
                      <tr key={product.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.nombre}</div>
                            <div className="text-xs text-gray-500">SKU: {product.codigo}</div>
                            {product.modelo && (
                              <div className="text-xs text-blue-600 mt-1">{product.modelo}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            {product.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product.proveedor}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            product.stock <= product.stockMinimo 
                              ? 'bg-red-100 text-red-800 border border-red-300' 
                              : 'bg-green-100 text-green-800 border border-green-300'
                          }`}>
                            {product.stock} uds
                          </span>
                          <div className="text-xs text-gray-400 mt-1">Min: {product.stockMinimo}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">S/ {Number(product.costo).toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">S/ {Number(product.precioVenta).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-green-600">
                            S/ {margen.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {margenPorcentaje}%
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Package size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No se encontraron productos</p>
                  <p className="text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <p>
              <strong>Óptica Neyra</strong> - Sistema de Gestión de Inventario v1.0
            </p>
            <p className="mt-2 md:mt-0">
              Total productos mostrados: <strong>{filteredProducts.length}</strong> de <strong>{products.length}</strong>
            </p>
          </div>
        </div>
        
        {/* Modal Formulario (Se mantiene igual, solo reusamos la estructura visual) */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                
                <div className="space-y-4">
                  {/* ... El formulario es idéntico a tu original, las variables formData ya están conectadas ... */}
                  {/* Por brevedad, asumo que dejas el formulario igual que en tu código original,
                      ya que las variables de estado (formData) coinciden perfectamente.
                      Si necesitas el código del formulario completo dímelo, pero encaja perfecto con lo que tenías. 
                   */}
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto *</label>
                      <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                      <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.categoria} onChange={(e) => setFormData({...formData, categoria: e.target.value})}>
                        {categorias.filter(c => c !== 'Todos').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label>
                      <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.proveedor} onChange={(e) => setFormData({...formData, proveedor: e.target.value})}>
                        {proveedores.map(prov => <option key={prov} value={prov}>{prov}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código de Barra / SKU *</label>
                      <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.codigo} onChange={(e) => setFormData({...formData, codigo: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Actual *</label>
                      <input type="number" required min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.stock} onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo *</label>
                      <input type="number" required min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.stockMinimo} onChange={(e) => setFormData({...formData, stockMinimo: parseInt(e.target.value) || 0})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Costo (S/) *</label>
                      <input type="number" required min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.costo} onChange={(e) => setFormData({...formData, costo: parseFloat(e.target.value) || 0})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta (S/) *</label>
                      <input type="number" required min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.precioVenta} onChange={(e) => setFormData({...formData, precioVenta: parseFloat(e.target.value) || 0})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                      <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño</label>
                      <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.tamaño} onChange={(e) => setFormData({...formData, tamaño: e.target.value})} />
                    </div>
                     <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                      <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.modelo} onChange={(e) => setFormData({...formData, modelo: e.target.value})} />
                    </div>
                   </div>

                  <div className="flex gap-3 pt-4">
                    <button onClick={handleSubmit} className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md">
                      {editingProduct ? '✓ Actualizar Producto' : '+ Guardar Producto'}
                    </button>
                    <button onClick={resetForm} className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium">
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventorySystem;