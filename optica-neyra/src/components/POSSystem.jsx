import React, { useState, useEffect } from 'react';
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
  DollarSign
} from 'lucide-react';

const POSSystem = () => {
  // Estados principales
  const [products, setProducts] = useState([
    {
      id: 1,
      nombre: 'Armazón Ray-Ban Aviador',
      categoria: 'Armazones',
      proveedor: 'GMO',
      codigo: 'RB3025-001',
      stock: 5,
      precioVenta: 299.90
    },
    {
      id: 2,
      nombre: 'Lente Oftálmico Transitions',
      categoria: 'Lentes Oftálmicos',
      proveedor: 'Vision Center',
      codigo: 'TR-SV-150',
      stock: 15,
      precioVenta: 260.00
    },
    {
      id: 3,
      nombre: 'Lentes de Contacto Acuvue',
      categoria: 'Lentes de Contacto',
      proveedor: 'Econolentes',
      codigo: 'ACV-OASYS-6',
      stock: 3,
      precioVenta: 119.90
    },
    {
      id: 4,
      nombre: 'Líquido de Limpieza OptiClean',
      categoria: 'Líquidos',
      proveedor: 'SUEGUST LENS',
      codigo: 'OC-360ML',
      stock: 25,
      precioVenta: 29.90
    },
    {
      id: 5,
      nombre: 'Armazón Deportivo Suntime',
      categoria: 'Armazones',
      proveedor: 'Suntime Store',
      codigo: 'ST-SPT-100',
      stock: 8,
      precioVenta: 180.00
    }
  ]);

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerDNI, setCustomerDNI] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [amountPaid, setAmountPaid] = useState(0);
  const [lastSale, setLastSale] = useState(null);
  const [discount, setDiscount] = useState(0);

  const IGV_RATE = 0.18;

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

  // Actualizar cantidad en carrito
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

  // Remover del carrito
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  // Limpiar carrito
  const clearCart = () => {
    if (window.confirm('¿Estás seguro de vaciar el carrito?')) {
      setCart([]);
      setDiscount(0);
    }
  };

  // Calcular totales
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

  // Procesar pago
  const handlePayment = () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    const totals = calculateTotals();
    
    if (paymentMethod === 'efectivo' && parseFloat(amountPaid) < parseFloat(totals.total)) {
      alert('El monto pagado es insuficiente');
      return;
    }

    // Crear registro de venta
    const sale = {
      id: Date.now(),
      date: new Date().toLocaleString('es-PE'),
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

    // Actualizar stock
    const updatedProducts = products.map(product => {
      const cartItem = cart.find(item => item.id === product.id);
      if (cartItem) {
        return {
          ...product,
          stock: product.stock - cartItem.quantity
        };
      }
      return product;
    });

    setProducts(updatedProducts);
    setLastSale(sale);
    setCart([]);
    setCustomerName('');
    setCustomerDNI('');
    setDiscount(0);
    setAmountPaid(0);
    setShowPaymentModal(false);
    setShowReceiptModal(true);
  };

  // Preparar pago
  const openPaymentModal = () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    setShowPaymentModal(true);
    setAmountPaid(calculateTotals().total);
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Punto de Venta (POS)</h1>
          <p className="text-gray-600">Sistema de ventas - Óptica Neyra</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de Productos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Búsqueda */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors cursor-pointer"
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
                      <span className="text-lg font-bold text-green-600">S/ {product.precioVenta.toFixed(2)}</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        product.stock > 10 
                          ? 'bg-green-100 text-green-800' 
                          : product.stock > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel de Carrito */}
          <div className="space-y-6">
            {/* Información del Cliente */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="text-gray-600" size={20} />
                <h2 className="text-lg font-bold text-gray-800">Cliente</h2>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nombre (opcional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="DNI (opcional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={customerDNI}
                  onChange={(e) => setCustomerDNI(e.target.value)}
                />
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

              {/* Items del carrito */}
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

              {/* Descuento */}
              {cart.length > 0 && (
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
              )}

              {/* Totales */}
              {cart.length > 0 && (
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
              )}

              {/* Botón de pago */}
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
                  <button
                    onClick={() => setPaymentMethod('efectivo')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'efectivo'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-green-300'
                    }`}
                  >
                    <Wallet size={20} />
                    <span className="font-medium">Efectivo</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('tarjeta')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'tarjeta'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-green-300'
                    }`}
                  >
                    <CreditCard size={20} />
                    <span className="font-medium">Tarjeta</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('yape')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'yape'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-green-300'
                    }`}
                  >
                    <Smartphone size={20} />
                    <span className="font-medium">Yape</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('plin')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'plin'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-green-300'
                    }`}
                  >
                    <DollarSign size={20} />
                    <span className="font-medium">Plin</span>
                  </button>
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
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Confirmar Pago
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Comprobante */}
        {showReceiptModal && lastSale && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="text-green-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Venta Exitosa!</h2>
                <p className="text-gray-600">Comprobante de Venta</p>
              </div>

              <div className="border-t border-b border-gray-200 py-4 mb-4 space-y-2">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg">Óptica Neyra</h3>
                  <p className="text-sm text-gray-600">Huánuco, Perú</p>
                  <p className="text-xs text-gray-500">{lastSale.date}</p>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cliente:</span>
                  <span className="font-medium">{lastSale.customer.name}</span>
                </div>
                {lastSale.customer.dni !== 'N/A' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">DNI:</span>
                    <span className="font-medium">{lastSale.customer.dni}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-2 mt-2">
                  {lastSale.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm py-1">
                      <span>{item.quantity}x {item.nombre}</span>
                      <span>S/ {(item.precioVenta * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>S/ {lastSale.totals.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IGV (18%):</span>
                    <span>S/ {lastSale.totals.igv}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-300">
                    <span>Total:</span>
                    <span className="text-green-600">S/ {lastSale.totals.total}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span>Método de pago:</span>
                    <span className="font-medium capitalize">{lastSale.paymentMethod}</span>
                  </div>
                  {lastSale.paymentMethod === 'efectivo' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Recibido:</span>
                        <span>S/ {lastSale.amountPaid.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Vuelto:</span>
                        <span>S/ {lastSale.change}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="flex-1 py-3 bg-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Printer size={20} />
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