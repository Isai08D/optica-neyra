import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  User, 
  CreditCard, 
  Wallet, 
  Smartphone, 
  X, 
  Check, 
  Printer, 
  DollarSign,
  Phone,    // Icono nuevo
  Mail,     // Icono nuevo
  MapPin    // Icono nuevo
} from 'lucide-react';
import { supabase } from '../supabaseClient.js'; 

const POSSystem = () => {
  // Estados principales
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true); 

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  
  // --- DATOS DEL CLIENTE ---
  const [customerName, setCustomerName] = useState('');
  const [customerDNI, setCustomerDNI] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');     
  const [customerEmail, setCustomerEmail] = useState('');     
  const [customerAddress, setCustomerAddress] = useState(''); 

  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [amountPaid, setAmountPaid] = useState(0);
  const [lastSale, setLastSale] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [processing, setProcessing] = useState(false);

  const IGV_RATE = 0.18;

  // Utilitario de moneda (interno)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 }).format(amount);
  };

  // 1. CARGAR PRODUCTOS DESDE SUPABASE
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .gt('stock', 0)
        .order('nombre', { ascending: true });

      if (error) throw error;

      const formattedData = data.map(item => ({
        ...item,
        precioVenta: item.precio_venta,
        stockMinimo: item.stock_minimo
      }));

      setProducts(formattedData);
      setFilteredProducts(formattedData);
    } catch (error) {
      console.error('Error cargando productos:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Buscar productos
  useEffect(() => {
    const filtered = products.filter(product =>
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Agregar producto al carrito
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        alert(`Stock insuficiente. Solo hay ${product.stock} unidades disponibles.`);
      }
    } else {
      if (product.stock > 0) {
        setCart([...cart, { ...product, quantity: 1 }]);
      } else {
        alert('Producto sin stock disponible.');
      }
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    const product = products.find(p => p.id === productId);
    
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQuantity > product.stock) {
      alert(`Stock insuficiente. Solo hay ${product.stock} unidades disponibles.`);
      return;
    }

    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    if (window.confirm('¿Estás seguro de vaciar el carrito?')) {
      setCart([]);
      setDiscount(0);
    }
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.precioVenta * item.quantity), 0);
    const discountAmount = (subtotal * discount) / 100;
    const subtotalWithDiscount = subtotal - discountAmount;
    const igv = subtotalWithDiscount * IGV_RATE;
    const total = subtotalWithDiscount + igv;
    
    return {
      subtotal: subtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      subtotalWithDiscount: subtotalWithDiscount.toFixed(2),
      igv: igv.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const openPaymentModal = () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    setShowPaymentModal(true);
    setAmountPaid(calculateTotals().total);
  };

  // --- FUNCIÓN ROBUSTA PARA REGISTRAR CLIENTE ---
  const registerCustomerIfNew = async () => {
    if (!customerName || customerName.trim() === '') return;

    try {
      const clientData = {
        nombre: customerName,
        dni: customerDNI || null,
        telefono: customerPhone || null, 
        email: customerEmail || null,    
        direccion: customerAddress || null 
      };

      if (customerDNI && customerDNI.trim() !== '') {
        const { data: existing, error: searchError } = await supabase
          .from('clientes')
          .select('id')
          .eq('dni', customerDNI)
          .maybeSingle();

        if (searchError) throw searchError;

        if (existing) {
          await supabase.from('clientes').update(clientData).eq('id', existing.id);
        } else {
          await supabase.from('clientes').insert([clientData]);
        }
      } else {
        await supabase.from('clientes').insert([clientData]);
      }

    } catch (err) {
      console.error('Error en lógica de cliente:', err);
    }
  };

  // 2. PROCESAR PAGO
  const handlePayment = async () => {
    if (cart.length === 0) return;

    const totals = calculateTotals();
    
    if (paymentMethod === 'efectivo' && parseFloat(amountPaid) < parseFloat(totals.total)) {
      alert('El monto pagado es insuficiente');
      return;
    }

    setProcessing(true);

    try {
      // PASO A: Registrar/Actualizar cliente
      await registerCustomerIfNew();

      // PASO B: Guardar Venta
      const saleData = {
        total: parseFloat(totals.total),
        items: cart, 
        cliente_nombre: customerName || 'Cliente General',
        cliente_dni: customerDNI || 'N/A',
        metodo_pago: paymentMethod,
        subtotal: parseFloat(totals.subtotalWithDiscount),
        igv: parseFloat(totals.igv),
        descuento: parseFloat(discount)
      };

      const { error: saleError } = await supabase
        .from('ventas')
        .insert([saleData]);

      if (saleError) throw saleError;

      // PASO C: Actualizar Stock
      for (const item of cart) {
        const product = products.find(p => p.id === item.id);
        const newStock = product.stock - item.quantity;

        const { error: stockError } = await supabase
          .from('productos')
          .update({ stock: newStock })
          .eq('id', item.id);

        if (stockError) throw stockError;
      }

      // PASO D: Generar recibo local (CON FECHA Y HORA COMPLETA)
      const saleReceipt = {
        id: Date.now(),
        // Usamos toLocaleString para obtener fecha y hora (ej: 9/12/2025, 12:42:31 a. m.)
        date: new Date().toLocaleString('es-PE', { 
           year: 'numeric', month: 'numeric', day: 'numeric',
           hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
        }),
        customer: {
          name: customerName || 'Cliente General',
          dni: customerDNI || 'N/A'
        },
        items: [...cart],
        totals: totals,
        paymentMethod: paymentMethod,
        amountPaid: paymentMethod === 'efectivo' ? parseFloat(amountPaid) : parseFloat(totals.total),
        change: paymentMethod === 'efectivo' ? (parseFloat(amountPaid) - parseFloat(totals.total)).toFixed(2) : '0.00'
      };

      await fetchProducts(); 
      setLastSale(saleReceipt);
      setCart([]);
      
      setCustomerName('');
      setCustomerDNI('');
      setCustomerPhone(''); 
      setCustomerEmail(''); 
      setCustomerAddress(''); 
      
      setDiscount(0);
      setAmountPaid(0);
      setShowPaymentModal(false);
      setShowReceiptModal(true);

    } catch (error) {
      alert('Error al procesar la venta: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const totals = calculateTotals();

  // Función necesaria para que el stock cambie de color sin romper la app
  const getStockColor = (stock, min) => {
    const limit = min || 5;
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock <= limit) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Punto de Venta (POS)</h1>
          <p className="text-gray-600">Sistema de ventas - Óptica Neyra</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel Izquierdo: Productos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Buscador */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar producto por nombre o código..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Lista de Productos */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Productos Disponibles</h2>
              
              {loading ? (
                 <div className="text-center py-12 text-green-600 animate-pulse">Cargando catálogo...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors cursor-pointer bg-white"
                      onClick={() => addToCart(product)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{product.nombre}</h3>
                          <p className="text-xs text-gray-500">{product.codigo}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-green-600">{formatCurrency(product.precioVenta)}</span>
                        <span className={`text-sm px-2 py-1 rounded ${getStockColor(product.stock, product.stockMinimo)}`}>
                          Stock: {product.stock}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Panel Cliente */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="text-gray-600" size={20} />
                <h2 className="text-lg font-bold text-gray-800">Cliente</h2>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nombre del Cliente (Obligatorio para registro)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="DNI (Opcional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    value={customerDNI}
                    onChange={(e) => setCustomerDNI(e.target.value)}
                  />
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="Teléfono"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Email (Opcional)"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Dirección (Opcional)"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                  />
                </div>

                <p className="text-xs text-gray-400 mt-1">* Si el cliente es nuevo, se guardará automáticamente en el directorio.</p>
              </div>
            </div>

            {/* Carrito */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="text-gray-600" size={20} />
                  <h2 className="text-lg font-bold text-gray-800">Carrito ({cart.length})</h2>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Vaciar
                  </button>
                )}
              </div>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">El carrito está vacío</p>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-gray-800">{item.nombre}</h4>
                          <p className="text-xs text-gray-500">S/ {item.precioVenta.toFixed(2)} c/u</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="bg-gray-200 p-1 rounded hover:bg-gray-300"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="bg-gray-200 p-1 rounded hover:bg-gray-300"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="font-bold text-green-600">
                          S/ {(item.precioVenta * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <>
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descuento (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">S/ {totals.subtotal}</span>
                    </div>
                    {discount > 0 && (
                      <>
                        <div className="flex justify-between text-sm text-red-600">
                          <span>Descuento ({discount}%):</span>
                          <span>- S/ {totals.discountAmount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal con descuento:</span>
                          <span className="font-medium">S/ {totals.subtotalWithDiscount}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">IGV (18%):</span>
                      <span className="font-medium">S/ {totals.igv}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                      <span>Total:</span>
                      <span className="text-green-600">S/ {totals.total}</span>
                    </div>
                  </div>
                </>
              )}
              
              {/* Botón de Procesar Pago (Fuera del condicional para verse siempre) */}
              <button
                onClick={openPaymentModal}
                disabled={cart.length === 0}
                className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
                  cart.length === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                Procesar Pago
              </button>
            </div>
          </div>
        </div>

        {/* Modal de Pago */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Procesar Pago</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Total a Pagar:</p>
                  <p className="text-3xl font-bold text-green-600">S/ {totals.total}</p>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Método de Pago:
                </label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {['efectivo', 'tarjeta', 'yape', 'plin'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors capitalize ${
                        paymentMethod === method
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-green-300'
                      }`}
                    >
                      {method === 'efectivo' && <Wallet size={20} />}
                      {method === 'tarjeta' && <CreditCard size={20} />}
                      {(method === 'yape' || method === 'plin') && <Smartphone size={20} />}
                      <span className="font-medium">{method}</span>
                    </button>
                  ))}
                </div>

                {paymentMethod === 'efectivo' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monto Recibido:
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={totals.total}
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                    />
                    {parseFloat(amountPaid) >= parseFloat(totals.total) && (
                      <p className="mt-2 text-sm text-green-600">
                        Vuelto: S/ {(parseFloat(amountPaid) - parseFloat(totals.total)).toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className={`flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors ${
                    processing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {processing ? 'Procesando...' : 'Confirmar Pago'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Comprobante (Rediseñado según image_bc4618.png) */}
        {showReceiptModal && lastSale && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-8 animate-scale-in">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="text-green-500" size={32} strokeWidth={3} />
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">¡Venta Exitosa!</h2>
                <p className="text-gray-500 text-sm mt-1">Comprobante de Venta</p>
              </div>

              {/* Ticket Virtual */}
              <div className="text-sm space-y-3 mb-8">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-gray-800 text-lg">Óptica Neyra</h3>
                  <p className="text-gray-500 text-xs">Huánuco, Perú</p>
                  <p className="text-gray-400 text-xs mt-1">{lastSale.date}</p>
                </div>

                <div className="flex justify-between text-gray-600 border-b border-gray-100 pb-2">
                  <span>Cliente:</span>
                  <span className="font-medium text-gray-800 text-right">{lastSale.customer.name}</span>
                </div>

                <div className="space-y-2 py-2">
                  {lastSale.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-gray-700">
                      <span>{item.quantity}x {item.nombre}</span>
                      <span className="font-medium">S/ {(item.precioVenta * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-3 space-y-1">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>{lastSale.totals.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>IGV (18%):</span>
                    <span>{lastSale.totals.igv}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold text-green-600 pt-2">
                    <span>Total:</span>
                    <span>{lastSale.totals.total}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Printer size={18} />
                  Imprimir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default POSSystem;