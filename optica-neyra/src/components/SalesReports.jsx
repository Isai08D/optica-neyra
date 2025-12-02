import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar
} from 'lucide-react';

const SalesReports = () => {
  // Datos simulados para el reporte
  const stats = [
    {
      title: 'Ventas Totales (Hoy)',
      value: 'S/ 1,250.00',
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign,
      color: 'bg-blue-500'
    },
    {
      title: 'Pedidos Realizados',
      value: '15',
      change: '+4',
      isPositive: true,
      icon: ShoppingBag,
      color: 'bg-orange-500'
    },
    {
      title: 'Ticket Promedio',
      value: 'S/ 83.30',
      change: '-2.1%',
      isPositive: false,
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      title: 'Nuevos Clientes',
      value: '3',
      change: '+1',
      isPositive: true,
      icon: Users,
      color: 'bg-purple-500'
    }
  ];

  const recentSales = [
    { id: 1, product: 'Armazón Ray-Ban Aviador', customer: 'Juan Pérez', amount: 'S/ 299.90', status: 'Completado', time: '10:30 AM' },
    { id: 2, product: 'Lente Oftálmico Transitions', customer: 'María Gonzales', amount: 'S/ 260.00', status: 'Completado', time: '11:15 AM' },
    { id: 3, product: 'Líquido OptiClean', customer: 'Cliente General', amount: 'S/ 29.90', status: 'Completado', time: '11:45 AM' },
    { id: 4, product: 'Lentes de Contacto', customer: 'Carlos Ruiz', amount: 'S/ 119.90', status: 'Pendiente', time: '12:20 PM' },
  ];

  const topProducts = [
    { name: 'Lente Oftálmico UV', sales: 45, percent: '70%' },
    { name: 'Armazón Económico', sales: 32, percent: '50%' },
    { name: 'Líquido Limpiador', sales: 28, percent: '45%' },
    { name: 'Lentes de Contacto', sales: 15, percent: '25%' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Reportes y Estadísticas</h1>
            <p className="text-gray-600">Resumen de actividad - Óptica Neyra</p>
          </div>
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200 text-sm text-gray-600">
            <Calendar size={16} />
            <span>{new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className={`${stat.color} p-3 rounded-lg text-white shadow-lg shadow-opacity-20`}>
                  <stat.icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ventas Recientes */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Transacciones Recientes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Producto</th>
                    <th className="px-6 py-3">Cliente</th>
                    <th className="px-6 py-3">Monto</th>
                    <th className="px-6 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {sale.product}
                        <div className="text-xs text-gray-500">{sale.time}</div>
                      </td>
                      <td className="px-6 py-4">{sale.customer}</td>
                      <td className="px-6 py-4 font-bold">{sale.amount}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          sale.status === 'Completado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Productos Más Vendidos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Productos Top</h2>
            <div className="space-y-6">
              {topProducts.map((product, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{product.name}</span>
                    <span className="text-gray-500">{product.sales} ventas</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: product.percent }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="text-sm font-bold text-blue-800 mb-2">Consejo del día</h4>
              <p className="text-xs text-blue-600">
                Los lentes con filtro UV tienen alta demanda esta semana. Considera aumentar el stock.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReports;