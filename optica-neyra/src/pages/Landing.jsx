import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Clock, Award, MapPin, ArrowRight } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Eye size={32} />
              <span className="text-2xl font-bold">Óptica Neyra</span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Acceso Administrativo
            </button>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Tu Salud Visual es Nuestra Prioridad
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Exámenes de la vista, asesoría personalizada y monturas modernas en Huánuco
            </p>
            <div className="flex gap-4">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2">
                Contáctanos
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
          ¿Por Qué Elegirnos?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="text-blue-600" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Atención Profesional</h3>
            <p className="text-gray-600">
              Exámenes de la vista con tecnología apropiada y personal capacitado
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Calidad Garantizada</h3>
            <p className="text-gray-600">
              Monturas modernas y accesibles con garantía de calidad
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-purple-600" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Atención Rápida</h3>
            <p className="text-gray-600">
              Servicio ágil y experiencia cálida y profesional
            </p>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-gray-100 py-20">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-2 text-gray-700 mb-4">
            <MapPin size={24} className="text-blue-600" />
            <h2 className="text-3xl font-bold">Encuéntranos en Huánuco</h2>
          </div>
          <p className="text-center text-gray-600 mb-8">
            Estamos comprometidos con el cuidado integral de la salud visual en nuestra comunidad
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="mb-2">© 2025 Isaí Daza - Todos los derechos reservados</p>
          <p className="text-gray-400 text-sm">Huánuco, Perú</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;