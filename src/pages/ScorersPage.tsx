import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@apollo/client';
import { useState } from 'react';
import { FaFutbol } from 'react-icons/fa';
import { GET_GOLEADORES_POR_SERIE } from '../graphql/queries/scorers';
import { getClubLogo } from '../utils/clubImages';
import { seriesColors, seriesNames } from '../utils/seriesColors';
import { GoleadorPorSerie, TipoSerie } from '../types';
import LoadingScreen from '../components/LoadingScreen';
import LazyImage from '../components/LazyImage';

export default function ScorersPage() {
  const [serieActiva, setSerieActiva] = useState<TipoSerie>(TipoSerie.TERCERA);
  
  const { data, loading } = useQuery<{ goleadoresPorSerie: GoleadorPorSerie[] }>(
    GET_GOLEADORES_POR_SERIE
  );

  if (loading) return <LoadingScreen />;

  const goleadores = data?.goleadoresPorSerie || [];
  const goleadoresFiltrados = goleadores
    .filter(g => g.serie === serieActiva)
    .sort((a, b) => b.goles - a.goles)
    .slice(0, 10); // Top 10 solamente

  const series = [TipoSerie.TERCERA, TipoSerie.SEGUNDA, TipoSerie.SENIOR, TipoSerie.PRIMERA];

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-premier-card/80 via-premier-bg/50 to-transparent py-12 md:py-16 mb-6 md:mb-8">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-premier-accent blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-premier-border blur-3xl"></div>
        </div>
        
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-black text-white mb-2 md:mb-4">
              Goleadores
            </h1>
            <p className="text-premier-muted text-sm md:text-xl">
              Top 10 artilleros por serie
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom">
        {/* Selector de Series - Tabs Horizontal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 overflow-x-auto pb-2"
        >
          <div className="card p-1.5 inline-flex gap-1.5 min-w-max mx-auto">
            {series.map((serie) => {
              const colors = seriesColors[serie];
              const name = seriesNames[serie];
              const isActive = serieActiva === serie;

              return (
                <button
                  key={serie}
                  onClick={() => setSerieActiva(serie)}
                  className={`px-4 py-2 md:px-5 md:py-2.5 rounded-lg text-sm md:text-base font-bold transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? `${colors.bg} text-white shadow-lg`
                      : `text-premier-muted hover:text-white hover:bg-premier-card/50`
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Grid de Goleadores */}
        <AnimatePresence mode="wait">
          <motion.div
            key={serieActiva}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-2 md:space-y-3"
          >
            {loading ? (
              <div className="card p-8 md:p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-4 border-premier-accent border-t-transparent"></div>
              </div>
            ) : goleadoresFiltrados.length === 0 ? (
              <div className="card p-8 md:p-12 text-center text-premier-muted">
                <p className="text-sm md:text-lg">No hay goleadores registrados en {seriesNames[serieActiva]}</p>
              </div>
            ) : (
              goleadoresFiltrados.map((scorer, index) => {
                const isPodium = index < 3;
                const colors = seriesColors[serieActiva];
                
                return (
                  <motion.div
                    key={scorer.jugador.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`card p-4 hover:scale-[1.01] transition-transform duration-300 ${
                      isPodium ? 'border-2 ' + colors.border : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      {/* Ranking */}
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-lg md:text-xl ${
                          index === 0
                            ? 'bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg shadow-purple-500/50'
                            : index === 1
                            ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-premier-bg shadow-lg shadow-gray-400/50'
                            : index === 2
                            ? 'bg-gradient-to-br from-purple-600 to-purple-800 text-white shadow-lg shadow-purple-600/50'
                            : 'bg-premier-card text-premier-muted border border-premier-border/30'
                        }`}>
                          {index + 1}
                        </div>
                      </div>

                      {/* Escudo - Hidden en móvil pequeño */}
                      <div className="hidden sm:block flex-shrink-0">
                        <div className="relative">
                          <LazyImage
                            src={getClubLogo(scorer.jugador.club.nombre)}
                            alt={scorer.jugador.club.nombreCorto}
                            className="w-10 h-10 md:w-12 md:h-12 object-contain"
                          />
                          {isPodium && (
                            <div className={`absolute -inset-1 md:-inset-2 ${colors.bg} opacity-30 blur-xl -z-10`}></div>
                          )}
                        </div>
                      </div>

                      {/* Info Jugador */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base md:text-lg font-black text-white mb-0.5 truncate">
                          {scorer.jugador.nombre1} {scorer.jugador.apellido1}
                        </h3>
                        <div className="flex items-center gap-2 text-xs md:text-sm flex-wrap">
                          <div className="flex items-center gap-1.5 sm:hidden">
                            <LazyImage
                              src={getClubLogo(scorer.jugador.club.nombre)}
                              alt={scorer.jugador.club.nombreCorto}
                              className="w-4 h-4 object-contain"
                            />
                          </div>
                          <span className="text-premier-muted truncate">
                            {scorer.jugador.club.nombreCorto}
                          </span>
                        </div>
                      </div>

                      {/* Goles */}
                      <div className="flex-shrink-0">
                        <div className={`inline-flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl ${colors.bg} shadow-md`}>
                          <FaFutbol className="text-white text-sm md:text-lg" />
                          <div>
                            <p className="text-2xl md:text-3xl font-black text-white leading-none">
                              {scorer.goles}
                            </p>
                            <p className="text-[9px] md:text-xs text-white/70 uppercase tracking-wider font-bold hidden sm:block">
                              Goles
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
