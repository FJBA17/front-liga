import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GET_CLUBES } from '../graphql/queries/clubs';
import { getClubLogo } from '../utils/clubImages';
import { Club } from '../types';
import LoadingScreen from '../components/LoadingScreen';
import LazyImage from '../components/LazyImage';

// Colores temáticos por club basados en sus escudos
const clubColors: Record<string, { primary: string; secondary: string; accent: string }> = {
  'Atletico Talcarehue': { primary: '#6b7280', secondary: '#374151', accent: '#9ca3af' },
  'Talcarehue': { primary: '#6b7280', secondary: '#374151', accent: '#9ca3af' },
  'Santa Isabel de Polonia': { primary: '#dc2626', secondary: '#991b1b', accent: '#fee2e2' },
  'Polonia': { primary: '#dc2626', secondary: '#991b1b', accent: '#fee2e2' },
  'San Jose de los Lingues': { primary: '#fbbf24', secondary: '#1f2937', accent: '#fef3c7' },
  'San Jose': { primary: '#fbbf24', secondary: '#1f2937', accent: '#fef3c7' },
  'Condor de Roma': { primary: '#1e3a8a', secondary: '#dc2626', accent: '#dbeafe' },
  'Condor': { primary: '#1e3a8a', secondary: '#dc2626', accent: '#dbeafe' },
  'Santa Elba': { primary: '#1f2937', secondary: '#d4a574', accent: '#f3e8d8' },
  'Carlina': { primary: '#dc2626', secondary: '#16a34a', accent: '#fee2e2' },
  'CD Juventud el Trapiche': { primary: '#2563eb', secondary: '#dc2626', accent: '#dbeafe' },
  'Trapiche': { primary: '#2563eb', secondary: '#dc2626', accent: '#dbeafe' },
  'Miraflores': { primary: '#16a34a', secondary: '#15803d', accent: '#dcfce7' },
  'CD Nilcunlauta': { primary: '#15803d', secondary: '#166534', accent: '#dcfce7' },
  'Nilcunlauta': { primary: '#15803d', secondary: '#166534', accent: '#dcfce7' },
};

const getClubColors = (clubName: string) => {
  return clubColors[clubName] || { primary: '#c71585', secondary: '#7c0e54', accent: '#d8bfd8' };
};

export default function ClubsPage() {
  const { data, loading } = useQuery<{ clubes: Club[] }>(GET_CLUBES);
  
  if (loading) return <LoadingScreen />;
  
  const clubes = data?.clubes || [];
  
  return (
    <div>
      <div className="container-custom py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Nuestros Clubes
        </h1>
        <p className="text-premier-muted text-lg">
          Conoce a los 8 equipos de la Liga Rural 2026
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubes.map((club, index) => {
          const colors = getClubColors(club.nombre);
          
          return (
            <motion.div
              key={club.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/clubes/${club.id}`}>
                <div 
                  className="relative overflow-hidden rounded-2xl h-48 group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, #37003c 100%)`
                  }}
                >
                  {/* Escudo grande difuminado de fondo */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                    <LazyImage
                      src={getClubLogo(club.nombre)}
                      alt=""
                      className="w-64 h-64 object-contain blur-sm scale-150"
                    />
                  </div>
                  
                  {/* Escudo pequeño en esquina superior izquierda */}
                  <div className="absolute top-3 left-3 z-10">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-black/40 backdrop-blur-md p-2">
                      <LazyImage
                        src={getClubLogo(club.nombre)}
                        alt={club.nombre}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  
                  {/* Contenido */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
                    <div className="relative">
                      <h3 className="text-2xl md:text-3xl font-black text-white mb-1.5 drop-shadow-lg group-hover:scale-105 transition-transform">
                        {club.nombreCorto}
                      </h3>
                      <div 
                        className="h-1 w-20 rounded-full transition-all group-hover:w-32"
                        style={{ backgroundColor: colors.accent }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Overlay de hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-50 group-hover:opacity-60 transition-opacity"></div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
