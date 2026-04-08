import { useQuery } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendar, FaClock, FaMapMarkerAlt, FaChevronRight } from 'react-icons/fa';
import { GET_JORNADAS, GET_PARTIDOS_BY_JORNADA, GET_RESULTADOS_BY_PARTIDO } from '../graphql/queries/matches';
import { GET_CLUBES } from '../graphql/queries/clubs';
import { getClubLogo } from '../utils/clubImages';
import { Jornada, Partido, ResultadoSerie } from '../types';
import { useState } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import LazyImage from '../components/LazyImage';

export default function FixturePage() {
  const [selectedJornada, setSelectedJornada] = useState<string | null>(null);
  
  const { data: jornadasData, loading: jornadasLoading, error: jornadasError } = useQuery<{ jornadas: Jornada[] }>(GET_JORNADAS);
  const { data: clubesData } = useQuery<{ clubes: Array<{ id: string; estadio?: string; ubicacionEstadio?: string }> }>(GET_CLUBES);
  const clubes = clubesData?.clubes ?? [];
  
  const { data: partidosData, loading: partidosLoading } = useQuery<{
    partidosPorJornada: Partido[];
  }>(GET_PARTIDOS_BY_JORNADA, {
    variables: { jornadaId: selectedJornada },
    skip: !selectedJornada,
  });
  
  const jornadas = jornadasData?.jornadas || [];
  const partidos = partidosData?.partidosPorJornada || [];
  
  const jornadaSeleccionada = jornadas.find(j => j.id === selectedJornada);
  
  if (jornadasLoading) return <LoadingScreen />;

  if (jornadasError) {
    return (
      <div className="container-custom py-12">
        <div className="card p-8 bg-red-900/20 border-red-500">
          <h3 className="text-xl font-bold text-red-400 mb-4">❌ Error al cargar jornadas</h3>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-12">
      {/* Hero Header */}
      <div className="py-12 mb-8">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
              Fixture <span className="text-premier-accent">2026</span>
            </h1>
            <p className="text-xl text-premier-muted">
              Calendario completo de la temporada
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom">
        {/* Selector de Jornadas - Horizontal Scroll */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Jornadas</h3>
          <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
            {jornadas.map((jornada, idx) => (
              <motion.button
                key={jornada.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedJornada(jornada.id)}
                className={`flex-shrink-0 relative overflow-hidden rounded-xl p-4 min-w-[180px] transition-all duration-300 ${
                  selectedJornada === jornada.id
                    ? 'bg-gradient-to-br from-premier-accent to-purple-700 text-white shadow-md shadow-premier-accent/20'
                    : 'bg-premier-card/60 text-premier-muted hover:bg-premier-card border border-premier-border/20'
                }`}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-black">J{jornada.numero}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      jornada.estado === 'FINALIZADA' 
                        ? 'bg-premier-accent/20 text-premier-accent' 
                        : jornada.estado === 'ACTIVA'
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {jornada.estado === 'FINALIZADA' ? '✓' : jornada.estado === 'ACTIVA' ? '●' : '○'}
                    </span>
                  </div>
                  <div className="text-xs opacity-75 flex items-center gap-1">
                    <FaCalendar className="text-xs" />
                    {new Date(jornada.fecha.slice(0, 10) + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="text-xs opacity-75 flex items-center gap-1 mt-1">
                    <FaClock className="text-xs" />
                    {jornada.hora}
                  </div>
                  {jornada.esSegundaVuelta && (
                    <div className="mt-2 text-xs font-bold opacity-90">2da Vuelta</div>
                  )}
                </div>
                {selectedJornada === jornada.id && (
                  <motion.div
                    layoutId="activeJornada"
                    className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Partidos */}
        <AnimatePresence mode="wait">
          {!selectedJornada ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-24"
            >
              <p className="text-xl text-premier-muted mt-12">
                Selecciona una jornada para ver los partidos
              </p>
            </motion.div>
          ) : partidosLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-8 animate-pulse">
                  <div className="h-32 bg-premier-border/10 rounded"></div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={selectedJornada}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {partidos.map((partido, idx) => (
                <PartidoCard key={partido.id} partido={partido} index={idx} clubes={clubes} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Componente para cada partido
interface PartidoCardProps {
  partido: Partido;
  index: number;
  clubes: Array<{ id: string; estadio?: string; ubicacionEstadio?: string }>;
}

function PartidoCard({ partido, index, clubes }: PartidoCardProps) {
  // Obtener resultados del partido si está finalizado
  const { data: resultadosData } = useQuery<{ resultadosPorPartido: ResultadoSerie[] }>(
    GET_RESULTADOS_BY_PARTIDO,
    {
      variables: { partidoId: partido.id },
      skip: partido.estado !== 'FINALIZADO',
      fetchPolicy: 'network-only',
    }
  );

  const resultados = resultadosData?.resultadosPorPartido || [];

  const calcularPuntos = (esLocal: boolean): number => {
    let puntos = 0;
    resultados.forEach(resultado => {
      const golesClub = esLocal ? resultado.golesLocal : resultado.golesVisitante;
      const golesRival = esLocal ? resultado.golesVisitante : resultado.golesLocal;
      const puntosVictoria = resultado.tipoSerie === 'PRIMERA' ? 4 : 3;
      const puntosEmpate = resultado.tipoSerie === 'PRIMERA' ? 2 : 1;

      // ganadorAdminId tiene prioridad
      if (resultado.ganadorAdminId) {
        const clubId = esLocal ? partido.clubLocal?.id : partido.clubVisitante?.id;
        if (resultado.ganadorAdminId === clubId) {
          puntos += puntosVictoria;
        }
        return;
      }
      
      if (golesClub > golesRival) {
        if (!resultado.puntosInvertidos) {
          puntos += puntosVictoria;
        }
      } else if (golesClub < golesRival) {
        if (resultado.puntosInvertidos) {
          puntos += puntosVictoria;
        }
      } else {
        if (!resultado.puntosInvertidos) {
          puntos += puntosEmpate;
        }
      }
    });
    return puntos;
  };

  const puntosLocal = calcularPuntos(true);
  const puntosVisitante = calcularPuntos(false);

  const seriesData = {
    PRIMERA: { label: 'Primera', color: 'from-premier-accent to-purple-600', icon: '1ra' },
    SEGUNDA: { label: 'Segunda', color: 'from-purple-500 to-purple-700', icon: '2da' },
    TERCERA: { label: 'Tercera', color: 'from-red-500 to-red-600', icon: '3ra' },
    SENIOR: { label: 'Senior', color: 'from-purple-500 to-purple-600', icon: 'Sen' },
  };

  const ganadorLocal = puntosLocal > puntosVisitante;
  const ganadorVisitante = puntosVisitante > puntosLocal;
  const empate = puntosLocal === puntosVisitante && puntosLocal > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-premier-card/80 to-premier-bg border border-premier-border/20 hover:border-premier-accent/30 transition-all duration-300 hover:shadow-2xl hover:shadow-premier-accent/10"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMCAxMmMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIGZpbGw9IiMyMmM1NWUiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-50"></div>
      
      <div className="relative z-10 p-4 md:p-8">
        {/* Enfrentamiento Principal */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 md:gap-12 items-center mb-4 md:mb-6">
          {/* Club Local */}
          <motion.div 
            className="flex flex-col items-center text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative mb-2 md:mb-4">
              <div className={`absolute inset-0 blur-2xl ${ganadorLocal ? 'bg-premier-accent/40' : 'bg-white/10'}`}></div>
              <LazyImage
                src={getClubLogo(partido.clubLocal?.nombre || '')}
                alt={partido.clubLocal?.nombreCorto}
                className="w-16 h-16 md:w-28 md:h-28 object-contain relative z-10"
              />
            </div>
            <h3 className="text-base md:text-2xl font-black text-white mb-1 md:mb-2">
              {partido.clubLocal?.nombreCorto}
            </h3>
            {partido.estado === 'FINALIZADO' && resultados.length > 0 && (
              <div className="flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-premier-bg/60 backdrop-blur-sm">
                <span className={`text-2xl md:text-4xl font-black ${
                  ganadorLocal ? 'text-premier-accent' : empate ? 'text-white' : 'text-premier-muted'
                }`}>
                  {puntosLocal}
                </span>
                <span className="text-xs text-premier-muted">PTS</span>
              </div>
            )}
          </motion.div>

          {/* VS */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="h-6 md:h-10 w-px bg-premier-border/40"></div>
            <span className="text-[11px] md:text-xs font-bold text-premier-muted/60 uppercase tracking-widest">vs</span>
            <div className="h-6 md:h-10 w-px bg-premier-border/40"></div>
            {partido.estado !== 'FINALIZADO' && (
              <span className="mt-1 text-[10px] text-premier-muted uppercase tracking-wider">{partido.estado}</span>
            )}
          </div>

          {/* Club Visitante */}
          <motion.div 
            className="flex flex-col items-center text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative mb-2 md:mb-4">
              <div className={`absolute inset-0 blur-2xl ${ganadorVisitante ? 'bg-premier-accent/40' : 'bg-white/10'}`}></div>
              <LazyImage
                src={getClubLogo(partido.clubVisitante?.nombre || '')}
                alt={partido.clubVisitante?.nombreCorto}
                className="w-16 h-16 md:w-28 md:h-28 object-contain relative z-10"
              />
            </div>
            <h3 className="text-base md:text-2xl font-black text-white mb-1 md:mb-2">
              {partido.clubVisitante?.nombreCorto}
            </h3>
            {partido.estado === 'FINALIZADO' && resultados.length > 0 && (
              <div className="flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-premier-bg/60 backdrop-blur-sm">
                <span className={`text-2xl md:text-4xl font-black ${
                  ganadorVisitante ? 'text-premier-accent' : empate ? 'text-white' : 'text-premier-muted'
                }`}>
                  {puntosVisitante}
                </span>
                <span className="text-xs text-premier-muted">PTS</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Resultados por Serie */}
        {partido.estado === 'FINALIZADO' && resultados.length > 0 && (
          <div className="border-t border-premier-border/20 pt-3 md:pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              {resultados.map((resultado, idx) => {
                const serie = seriesData[resultado.tipoSerie as keyof typeof seriesData];
                const ganadorLocalField = resultado.golesLocal > resultado.golesVisitante;
                const ganadorVisitanteField = resultado.golesVisitante > resultado.golesLocal;
                const empate = resultado.golesLocal === resultado.golesVisitante;
                // Who actually gets the points (ganadorAdminId > puntosInvertidos > marcador)
                const puntosVanALocal = resultado.ganadorAdminId
                  ? resultado.ganadorAdminId === partido.clubLocal?.id
                  : resultado.puntosInvertidos ? ganadorVisitanteField : ganadorLocalField;
                const puntosVanAVisitante = resultado.ganadorAdminId
                  ? resultado.ganadorAdminId === partido.clubVisitante?.id
                  : resultado.puntosInvertidos ? ganadorLocalField : ganadorVisitanteField;
                const ajustado = resultado.puntosInvertidos || !!resultado.ganadorAdminId || !!resultado.mensajeAjuste;
                
                return (
                  <motion.div
                    key={resultado.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative overflow-hidden rounded-xl p-2 md:p-4 backdrop-blur-sm border transition-all ${
                      ajustado
                        ? 'bg-orange-900/20 border-orange-500/40'
                        : 'bg-premier-bg/40 border-premier-border/10 hover:border-premier-accent/30'
                    }`}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${ajustado ? 'from-orange-500 to-orange-700' : serie.color}`}></div>
                    <div className="text-center">
                      <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
                        {serie.icon}
                      </span>
                      {(resultado.puntosInvertidos || resultado.ganadorAdminId) && (
                        <div className="text-[9px] text-orange-300 font-bold uppercase tracking-wide leading-none mt-0.5">
                          {resultado.ganadorAdminId ? 'Sec.' : 'Pts inv.'}
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-2 md:gap-3 mt-1 md:mt-2">
                        <span className={`text-xl md:text-3xl font-black transition-all ${
                          puntosVanALocal
                            ? resultado.puntosInvertidos ? 'text-orange-300 scale-110' : 'text-premier-accent scale-110'
                            : empate ? 'text-white'
                            : 'text-premier-muted/50'
                        }`}>
                          {resultado.golesLocal}
                        </span>
                        <span className="text-premier-muted/30 font-bold">:</span>
                        <span className={`text-xl md:text-3xl font-black transition-all ${
                          puntosVanAVisitante
                            ? resultado.puntosInvertidos ? 'text-orange-300 scale-110' : 'text-premier-accent scale-110'
                            : empate ? 'text-white'
                            : 'text-premier-muted/50'
                        }`}>
                          {resultado.golesVisitante}
                        </span>
                      </div>
                      {resultado.mensajeAjuste && (
                        <p className="text-[9px] text-orange-200/80 mt-1.5 leading-tight line-clamp-2 px-1">
                          {resultado.mensajeAjuste}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer - Estadio */}
        {partido.estadio && (
          <div className="mt-6 pt-4 border-t border-premier-border/10 flex items-center justify-center gap-2 text-premier-muted">
            <FaMapMarkerAlt className="text-premier-accent" />
            <span className="text-sm">{partido.estadio}</span>
            {(() => {
              const clubDueno = clubes.find(c => c.estadio && partido.estadio && c.estadio.toLowerCase() === partido.estadio.toLowerCase());
              const mapaUrl = clubDueno?.ubicacionEstadio;
              return mapaUrl ? (
              <a
                href={mapaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-premier-accent/20 text-premier-accent hover:bg-premier-accent/30 transition-colors"
              >
                <FaMapMarkerAlt className="text-xs" /> Mapa
              </a>
              ) : null;
            })()}
          </div>
        )}
      </div>
    </motion.div>
  );
}
