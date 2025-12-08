import SalesReports from '../components/SalesReports';
import CustomerManagement from '../components/CustomerManagement';
import POSSystem from '../components/POSSystem';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  LogOut, 
  Menu, 
  X,
  Home
} from 'lucide-react';
import InventorySystem from '../components/InventorySystem';

const Dashboard = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [currentModule, setCurrentModule] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'home', name: 'Inicio', icon: Home, disabled: false },
    { id: 'inventory', name: 'Inventario', icon: Package, disabled: false },
    { id: 'sales', name: 'Ventas', icon: ShoppingCart, disabled: false },
    { id: 'customers', name: 'Clientes', icon: Users, disabled: false },
    { id: 'reports', name: 'Reportes', icon: BarChart3, disabled: false },
  ];

  const renderModule = () => {
    switch(currentModule) {
      case 'inventory':
        return <InventorySystem />;
      case 'sales':
        return <POSSystem />;  // ← Actualiza esta línea
      case 'customers':
        return <CustomerManagement />;  
      case 'reports':
        return <SalesReports />;
      case 'home':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  ¡Bienvenido, {user?.name}! 👋
                </h1>
                <p className="text-gray-600 text-lg">
                  Sistema de Gestión - Óptica Neyra
                </p>
                <p className="text-blue-600 mt-2">📍 Huánuco, Perú</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                
                {/* 1. Inventario (Azul) */}
                <div 
                  className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6 cursor-pointer hover:scale-105 transition-transform" 
                  onClick={() => setCurrentModule('inventory')}
                >
                  <Package size={40} className="mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Inventario</h3>
                  <p className="text-blue-100">Gestión de productos y stock</p>
                  <button className="mt-4 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium text-sm">
                    Acceder →
                  </button>
                </div>

                {/* 2. Ventas (Verde) - YA ACTIVADO */}
                <div 
                  className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setCurrentModule('sales')}
                >
                  <ShoppingCart size={40} className="mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Ventas</h3>
                  <p className="text-green-100">Punto de venta (POS)</p>
                  <button className="mt-4 bg-white text-green-600 px-4 py-2 rounded-lg font-medium text-sm">
                    Acceder →
                  </button>
                </div>

                {/* 3. Clientes (Morado) - YA ACTIVADO */}
                <div 
                  className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setCurrentModule('customers')}
                >
                  <Users size={40} className="mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Clientes</h3>
                  <p className="text-purple-100">Gestión de clientes</p>
                  <button className="mt-4 bg-white text-purple-600 px-4 py-2 rounded-lg font-medium text-sm">
                    Acceder →
                  </button>
                </div>

                {/* 4. Reportes (Naranja) - YA ACTIVADO */}
                <div 
                  className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-6 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setCurrentModule('reports')}
                >
                  <BarChart3 size={40} className="mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Reportes</h3>
                  <p className="text-orange-100">Estadísticas y análisis</p>
                  <button className="mt-4 bg-white text-orange-600 px-4 py-2 rounded-lg font-medium text-sm">
                    Acceder →
                  </button>
                </div>
              </div>

              {/* Tarjeta de Información del Usuario */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Información del Usuario</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Nombre</p>
                    {/* Aquí mostramos el nombre real o "Cargando..." */}
                    <p className="font-bold text-gray-800 text-lg">
                      {profile?.nombre || 'Usuario'} 
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
                    <p className="font-bold text-gray-800 text-lg">{user?.email}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Rol</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {/* Aquí mostramos el rol real */}
                      {profile?.rol || 'Personal'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Módulo en Desarrollo</h2>
              <p className="text-gray-600">Esta funcionalidad estará disponible próximamente.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col`}>
        {/* Header Sidebar */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-lg">Óptica Neyra</h2>
                <p className="text-xs text-gray-400">Sistema de Gestión</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => !item.disabled && setCurrentModule(item.id)}
                    disabled={item.disabled}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      currentModule === item.id
                        ? 'bg-blue-600 text-white'
                        : item.disabled
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={20} />
                    {sidebarOpen && (
                      <span className="flex-1 text-left">{item.name}</span>
                    )}
                    {item.disabled && sidebarOpen && (
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded">Próximamente</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-700">
          {sidebarOpen && (
            <div className="mb-3 px-2">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderModule()}
      </div>
    </div>
  );
};
export default Dashboard;