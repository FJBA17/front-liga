import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FaTrophy, FaChartLine, FaArrowLeft, FaInstagram, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import { GET_CLUB_BY_ID } from '../graphql/queries/clubs';
import { GET_PARTIDOS_BY_CLUB, GET_RESULTADOS_BY_PARTIDO } from '../graphql/queries/matches';
import { GET_TABLA_POSICIONES } from '../graphql/queries/standings';
import { GET_GOLEADORES_BY_CLUB } from '../graphql/queries/scorers';
import { getClubLogo } from '../utils/clubImages';
import { seriesColors, seriesNames } from '../utils/seriesColors';
import { Club, Partido, TablaPosicion, Gol, ResultadoSerie } from '../types';
import LazyImage from '../components/LazyImage';

export default function ClubDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [partidoSeleccionado, setPartidoSeleccionado] = useState<string | null>(null);
  
  const { data: clubData, loading: clubLoading } = useQuery<{ club: Club }>(
    GET_CLUB_BY_ID,
    { variables: { id } }
  );
  
  const { data: matchesData } = useQuery<{ partidosPorClub: Partido[] }>(
    GET_PARTIDOS_BY_CLUB,
    { variables: { clubId: id } }
  );

  const { data: tablaData } = useQuery<{ tablaPosiciones: TablaPosicion[] }>(
    GET_TABLA_POSICIONES
  );

  const { data: golesData } = useQuery<{ golesPorClub: Gol[] }>(
    GET_GOLEADORES_BY_CLUB,
    { variables: { clubId: id } }
  );

  const { data: resultadosData } = useQuery<{ resultadosPorPartido: ResultadoSerie[] }>(
    GET_RESULTADOS_BY_PARTIDO,
    { 
      variables: { partidoId: partidoSeleccionado },
      skip: !partidoSeleccionado
    }
  );
  
  if (clubLoading) {
    return (
      <div className="container-custom py-12">
        <div className="card p-12 animate-pulse">
          <div className="h-64 bg-premier-border/20 rounded"></div>
        </div>
      </div>
    );
  }
  
  const club = clubData?.club;
  const partidos = matchesData?.partidosPorClub || [];
  const partidosPasados = partidos.filter(p => p.estado === 'FINALIZADO');
  const partidosProximos = partidos.filter(p => p.estado !== 'FINALIZADO');
  
  // Encontrar stats del club en la tabla
  const clubStats = tablaData?.tablaPosiciones.find((t: TablaPosicion) => t.club.id === id);

  // LOG DIAGNÓSTICO - Dashboard del club (lo que ve la tabla)
  if (clubStats) {
    console.group(`[ClubDetailPage] DASHBOARD clubId=${id}`);
    console.log('posicion:', clubStats.posicion);
    console.log('puntos en tabla:', clubStats.puntos);
    console.log('partidosJugados:', clubStats.partidosJugados);
    console.log('golesAFavor:', clubStats.golesAFavor, '| golesEnContra:', clubStats.golesEnContra);
    console.groupEnd();
  }

  // Agrupar goles por serie y contar por jugador
  const goles = golesData?.golesPorClub || [];
  const goleadoresPorSerie: Record<string, Array<{ jugador: any; goles: number }>> = {};
  
  goles.forEach((gol) => {
    const serie = gol.resultadoSerie.tipoSerie;
    if (!goleadoresPorSerie[serie]) {
      goleadoresPorSerie[serie] = [];
    }
    
    const jugadorExistente = goleadoresPorSerie[serie].find(
      (g) => g.jugador.id === gol.jugador.id
    );
    
    if (jugadorExistente) {
      jugadorExistente.goles++;
    } else {
      goleadoresPorSerie[serie].push({
        jugador: gol.jugador,
        goles: 1,
      });
    }
  });

  // Ordenar por goles y tomar top 3
  Object.keys(goleadoresPorSerie).forEach((serie) => {
    goleadoresPorSerie[serie].sort((a, b) => b.goles - a.goles);
    goleadoresPorSerie[serie] = goleadoresPorSerie[serie].slice(0, 3);
  });

  // Función para calcular puntos de un partido
  const calcularPuntosPartido = (partidoId: string) => {
    // Esta función será llamada para cada partido pasado, 
    // pero necesitamos los resultados específicos del partido
    // Por ahora retornamos null y lo manejaremos en el componente hijo
    return null;
  };
  
  if (!club) {
    return (
      <div className="container-custom py-12 text-center">
        <p className="text-premier-muted">Club no encontrado</p>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-12"
    >
      {/* Hero Section con Escudo Difuminado */}
      <div className="relative overflow-hidden bg-gradient-to-b from-premier-card/80 via-premier-bg/50 to-transparent py-16 mb-8">
        {/* Escudo gigante difuminado de fondo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <LazyImage
            src={getClubLogo(club.nombre)}
            alt=""
            className="w-[500px] h-[500px] md:w-[800px] md:h-[800px] object-contain blur-sm"
          />
        </div>
        
        {/* Gradiente overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-premier-bg via-transparent to-transparent"></div>
        
        <div className="container-custom relative z-10">
          <button
            onClick={() => navigate('/clubes')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8"
          >
            <FaArrowLeft />
            <span className="font-semibold">Volver a Clubes</span>
          </button>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <LazyImage
              src={getClubLogo(club.nombre)}
              alt={club.nombre}
              className="w-40 h-40 md:w-56 md:h-56 object-contain mx-auto mb-6 drop-shadow-2xl"
            />
            <h1 className="text-5xl md:text-7xl font-black text-white mb-3">
              {club.nombreCorto}
            </h1>
            <p className="text-premier-muted text-xl md:text-2xl font-medium">
              {club.estadio}
            </p>
            
            {/* Redes Sociales y Ubicación */}
            {(club.instagramUrl || club.ubicacionEstadio) && (
              <div className="flex items-center justify-center gap-3 mt-6">
                {club.instagramUrl && (
                  <a
                    href={club.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-12 h-12 flex items-center justify-center rounded-full border-2 border-premier-accent/30 hover:border-premier-accent bg-premier-card/30 hover:bg-premier-accent/10 transition-all duration-300"
                    title="Instagram"
                  >
                    <FaInstagram className="text-xl text-premier-accent transition-colors duration-300" />
                  </a>
                )}
                {club.ubicacionEstadio && (
                  <a
                    href={club.ubicacionEstadio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-12 h-12 flex items-center justify-center rounded-full border-2 border-premier-accent/30 hover:border-premier-accent bg-premier-card/30 hover:bg-premier-accent/10 transition-all duration-300"
                    title="Ver Estadio en Maps"
                  >
                    <FaMapMarkerAlt className="text-xl text-premier-accent transition-colors duration-300" />
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
      
      <div className="container-custom space-y-8">
        {/* Dashboard de Estadísticas - Diseño Horizontal */}
        {clubStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-premier-card/40 backdrop-blur-sm border border-premier-accent/30 p-6 md:p-8"
          >
            {/* Decorative gradient blob */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-premier-accent/20 to-purple-700/20 blur-3xl rounded-full"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <p className="text-premier-accent text-sm font-bold uppercase tracking-widest">Temporada 2025/26</p>
              </div>

              {/* Stats Bar - Horizontal */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                {/* Posición */}
                <div className="bg-premier-bg/60 backdrop-blur-sm rounded-xl p-4 border border-premier-border/20 hover:border-premier-accent/50 transition-all">
                  <div className="flex flex-col items-center">
                    <p className="text-4xl md:text-5xl font-black bg-gradient-to-br from-white to-premier-accent bg-clip-text text-transparent mb-2">
                      {clubStats.posicion}°
                    </p>
                    <p className="text-premier-muted text-xs font-bold uppercase tracking-wider">Posición</p>
                  </div>
                </div>

                {/* Partidos Jugados */}
                <div className="bg-premier-bg/60 backdrop-blur-sm rounded-xl p-4 border border-premier-border/20 hover:border-premier-accent/50 transition-all">
                  <div className="flex flex-col items-center">
                    <p className="text-4xl md:text-5xl font-black text-white mb-2">{clubStats.partidosJugados}</p>
                    <p className="text-premier-muted text-xs font-bold uppercase tracking-wider">Partidos</p>
                  </div>
                </div>

                {/* Goles a Favor */}
                <div className="bg-premier-bg/60 backdrop-blur-sm rounded-xl p-4 border border-green-500/20 hover:border-green-500/50 transition-all">
                  <div className="flex flex-col items-center">
                    <p className="text-4xl md:text-5xl font-black text-green-400 mb-2">{clubStats.golesAFavor}</p>
                    <p className="text-premier-muted text-xs font-bold uppercase tracking-wider">Goles A Favor</p>
                  </div>
                </div>

                {/* Goles en Contra */}
                <div className="bg-premier-bg/60 backdrop-blur-sm rounded-xl p-4 border border-red-500/20 hover:border-red-500/50 transition-all">
                  <div className="flex flex-col items-center">
                    <p className="text-4xl md:text-5xl font-black text-red-400 mb-2">{clubStats.golesEnContra}</p>
                    <p className="text-premier-muted text-xs font-bold uppercase tracking-wider">Goles En Contra</p>
                  </div>
                </div>

                {/* Diferencia de Goles */}
                <div className={`bg-premier-bg/60 backdrop-blur-sm rounded-xl p-4 border transition-all ${
                  clubStats.diferenciaGoles > 0 
                    ? 'border-green-500/20 hover:border-green-500/50' 
                    : clubStats.diferenciaGoles < 0 
                    ? 'border-red-500/20 hover:border-red-500/50'
                    : 'border-premier-border/20 hover:border-premier-accent/50'
                }`}>
                  <div className="flex flex-col items-center">
                    <p className={`text-4xl md:text-5xl font-black mb-2 ${
                      clubStats.diferenciaGoles > 0 
                        ? 'text-green-400' 
                        : clubStats.diferenciaGoles < 0 
                        ? 'text-red-400' 
                        : 'text-premier-muted'
                    }`}>
                      {clubStats.diferenciaGoles > 0 ? '+' : ''}{clubStats.diferenciaGoles}
                    </p>
                    <p className="text-premier-muted text-xs font-bold uppercase tracking-wider">Diferencia</p>
                  </div>
                </div>

                {/* Puntos */}
                <div className="bg-gradient-to-br from-premier-accent/20 to-purple-700/20 backdrop-blur-sm rounded-xl p-4 border-2 border-premier-accent/50 hover:border-premier-accent transition-all shadow-lg shadow-premier-accent/20">
                  <div className="flex flex-col items-center">
                    <p className="text-4xl md:text-5xl font-black text-premier-accent mb-2">{clubStats.puntos}</p>
                    <p className="text-premier-accent text-xs font-bold uppercase tracking-wider">Puntos</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Goleadores por Serie */}
        {Object.keys(goleadoresPorSerie).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-6">
              <h2 className="text-3xl font-black text-white">Goleadores del Club</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {['TERCERA', 'SEGUNDA', 'SENIOR', 'PRIMERA'].map((serie) => {
                if (!goleadoresPorSerie[serie]) return null;
                
                const colors = seriesColors[serie as keyof typeof seriesColors];
                const name = seriesNames[serie as keyof typeof seriesNames];
                
                return (
                  <motion.div
                    key={serie}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6 relative overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 ${colors.gradient} blur-2xl opacity-50`}></div>
                    
                    <div className="relative z-10">
                      <div className="mb-4">
                        <h3 className={`text-xl font-black ${colors.text}`}>{name}</h3>
                      </div>

                      <div className="space-y-3">
                        {goleadoresPorSerie[serie].map((goleador, idx) => (
                          <div
                            key={goleador.jugador.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-premier-bg/50 border border-premier-border/20"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs bg-white/10 text-white border border-white/20">
                                {idx + 1}
                              </div>
                              <div>
                                <p className="font-bold text-sm text-white">
                                  {goleador.jugador.nombre1} {goleador.jugador.apellido1}
                                </p>
                              </div>
                            </div>
                            <div className="font-black text-lg text-white">
                              {goleador.goles}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Partidos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-black text-white mb-6">Calendario de Partidos</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Partidos Pasados */}
            <div className="card p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaChartLine className="text-premier-muted" />
                Últimos Partidos
              </h3>
              <div className="space-y-3 custom-scrollbar max-h-96 overflow-y-auto">
                {partidosPasados.length === 0 ? (
                  <p className="text-premier-muted text-center py-8 text-sm">
                    No hay partidos finalizados
                  </p>
                ) : (
                  partidosPasados.map((partido) => (
                    <PartidoPasadoCard 
                      key={partido.id} 
                      partido={partido} 
                      clubId={id!}
                      onClick={() => setPartidoSeleccionado(partido.id)}
                    />
                  ))
                )}
              </div>
            </div>
            
            {/* Próximos Partidos */}
            <div className="card p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-premier-accent">🗓️</span>
                Próximos Partidos
              </h3>
              <div className="space-y-3 custom-scrollbar max-h-96 overflow-y-auto">
                {partidosProximos.length === 0 ? (
                  <p className="text-premier-muted text-center py-8 text-sm">
                    No hay próximos partidos programados
                  </p>
                ) : (
                  partidosProximos.map((partido) => (
                    <div
                      key={partido.id}
                      className="bg-premier-bg/50 rounded-lg p-3 border border-premier-accent/30 hover:border-premier-accent/50 transition-colors"
                    >
                      <p className="text-xs text-premier-accent mb-2">
                        Jornada {partido.jornada.numero} • {partido.jornada.hora}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <LazyImage
                            src={getClubLogo(partido.clubLocal?.nombre || '')}
                            className="w-6 h-6 object-contain"
                            alt=""
                          />
                          <span className="font-semibold text-sm truncate">
                            {partido.clubLocal?.nombreCorto}
                          </span>
                        </div>
                        <span className="px-3 py-1 bg-premier-accent/20 rounded text-xs font-bold text-premier-accent">
                          vs
                        </span>
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <span className="font-semibold text-sm truncate">
                            {partido.clubVisitante?.nombreCorto}
                          </span>
                          <LazyImage
                            src={getClubLogo(partido.clubVisitante?.nombre || '')}
                            className="w-6 h-6 object-contain"
                            alt=""
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal de Detalle del Partido */}
      <AnimatePresence>
        {partidoSeleccionado && (
          <PartidoDetalleModal
            partidoId={partidoSeleccionado}
            clubId={id!}
            onClose={() => setPartidoSeleccionado(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Componente para card de partido pasado con resultados
interface PartidoPasadoCardProps {
  partido: Partido;
  clubId: string;
  onClick: () => void;
}

function PartidoPasadoCard({ partido, clubId, onClick }: PartidoPasadoCardProps) {
  const { data } = useQuery<{ resultadosPorPartido: ResultadoSerie[] }>(
    GET_RESULTADOS_BY_PARTIDO,
    { variables: { partidoId: partido.id }, fetchPolicy: 'network-only' }
  );

  const resultados = data?.resultadosPorPartido || [];

  // LOG DIAGNÓSTICO - PartidoPasadoCard
  console.group(`[PartidoPasadoCard] partidoId=${partido.id}`);
  console.log('raw resultados count:', resultados.length);
  resultados.forEach((r, i) => {
    console.log(`  [${i}] serie=${r.tipoSerie} golesL=${r.golesLocal} golesV=${r.golesVisitante} puntosInvertidos=${r.puntosInvertidos} ganadorAdminId=${r.ganadorAdminId ?? 'null'} mensajeAjuste=${r.mensajeAjuste ?? 'null'}`);
  });
  console.groupEnd();
  
  // Eliminar duplicados por serie: si hay duplicados, preferir el que tiene puntosInvertidos=true
  const resultadosUnicos = resultados.reduce((acc, resultado) => {
    const existingIdx = acc.findIndex(r => r.tipoSerie === resultado.tipoSerie);
    if (existingIdx === -1) {
      acc.push(resultado);
    } else if (!acc[existingIdx].puntosInvertidos && resultado.puntosInvertidos) {
      acc[existingIdx] = resultado;
    }
    return acc;
  }, [] as ResultadoSerie[]);
  
  // Calcular puntos totales
  let puntosLocal = 0;
  let puntosVisitante = 0;
  
  resultadosUnicos.forEach(resultado => {
    const puntosVictoria = resultado.tipoSerie === 'PRIMERA' ? 4 : 3;
    const puntosEmpate = resultado.tipoSerie === 'PRIMERA' ? 2 : 1;

    // ganadorAdminId tiene prioridad sobre el marcador y puntosInvertidos
    if (resultado.ganadorAdminId) {
      if (resultado.ganadorAdminId === partido.clubLocal?.id) {
        puntosLocal += puntosVictoria;
      } else {
        puntosVisitante += puntosVictoria;
      }
      return;
    }
    
    if (resultado.golesLocal > resultado.golesVisitante) {
      // Victoria local
      if (!resultado.puntosInvertidos) {
        puntosLocal += puntosVictoria;
      } else {
        puntosVisitante += puntosVictoria;
      }
    } else if (resultado.golesVisitante > resultado.golesLocal) {
      // Victoria visitante
      if (!resultado.puntosInvertidos) {
        puntosVisitante += puntosVictoria;
      } else {
        puntosLocal += puntosVictoria;
      }
    } else {
      // Empate
      if (!resultado.puntosInvertidos) {
        puntosLocal += puntosEmpate;
        puntosVisitante += puntosEmpate;
      }
    }
  });

  const esLocal = partido.clubLocal?.id === clubId;
  const puntosClub = esLocal ? puntosLocal : puntosVisitante;
  const puntosRival = esLocal ? puntosVisitante : puntosLocal;

  // LOG DIAGNÓSTICO - Puntajes calculados en PartidoPasadoCard
  console.group(`[PartidoPasadoCard] PUNTAJES CALCULADOS J${partido.jornada.numero} - ${partido.clubLocal?.nombreCorto} vs ${partido.clubVisitante?.nombreCorto}`);
  console.log(`  LOCAL (${partido.clubLocal?.nombreCorto}): ${puntosLocal} pts`);
  console.log(`  VISITANTE (${partido.clubVisitante?.nombreCorto}): ${puntosVisitante} pts`);
  console.log(`  YO soy: ${esLocal ? 'LOCAL' : 'VISITANTE'} → mis pts: ${puntosClub}, rival: ${puntosRival}`);
  console.groupEnd();

  return (
    <div
      onClick={onClick}
      className="bg-premier-bg/50 rounded-lg p-3 border border-premier-border/30 hover:border-premier-accent/50 transition-all cursor-pointer hover:bg-premier-accent/5"
    >
      <p className="text-xs text-premier-muted mb-2">
        Jornada {partido.jornada.numero}
      </p>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <LazyImage
            src={getClubLogo(partido.clubLocal?.nombre || '')}
            className="w-6 h-6 object-contain"
            alt=""
          />
          <span className="font-semibold text-sm truncate">
            {partido.clubLocal?.nombreCorto}
          </span>
        </div>
        
        {/* Marcador */}
        <div className="flex items-center gap-2 px-3 py-1 bg-premier-card rounded-lg">
          <span className={`font-black text-lg ${puntosLocal > puntosVisitante ? 'text-premier-accent' : 'text-white'}`}>
            {puntosLocal}
          </span>
          <span className="text-premier-muted text-xs">-</span>
          <span className={`font-black text-lg ${puntosVisitante > puntosLocal ? 'text-premier-accent' : 'text-white'}`}>
            {puntosVisitante}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className="font-semibold text-sm truncate">
            {partido.clubVisitante?.nombreCorto}
          </span>
          <LazyImage
            src={getClubLogo(partido.clubVisitante?.nombre || '')}
            className="w-6 h-6 object-contain"
            alt=""
          />
        </div>
      </div>
      
      {/* Indicador de click */}
      <p className="text-xs text-premier-accent text-center mt-2">Click para ver detalle</p>
    </div>
  );
}

// Modal de detalle del partido
interface PartidoDetalleModalProps {
  partidoId: string;
  clubId: string;
  onClose: () => void;
}

function PartidoDetalleModal({ partidoId, clubId, onClose }: PartidoDetalleModalProps) {
  const { data: matchData } = useQuery<{ partidosPorClub: Partido[] }>(
    GET_PARTIDOS_BY_CLUB,
    { variables: { clubId } }
  );

  const { data: resultadosData, loading: loadingResultados } = useQuery<{ resultadosPorPartido: ResultadoSerie[] }>(
    GET_RESULTADOS_BY_PARTIDO,
    { variables: { partidoId }, fetchPolicy: 'no-cache' }
  );

  const partido = matchData?.partidosPorClub.find(p => p.id === partidoId);
  const resultados = resultadosData?.resultadosPorPartido || [];

  // LOG DIAGNÓSTICO - PartidoDetalleModal
  console.group(`[PartidoDetalleModal] partidoId=${partidoId} loading=${loadingResultados}`);
  console.log('raw resultados count:', resultados.length);
  resultados.forEach((r, i) => {
    console.log(`  [${i}] serie=${r.tipoSerie} golesL=${r.golesLocal} golesV=${r.golesVisitante} puntosInvertidos=${r.puntosInvertidos} ganadorAdminId=${r.ganadorAdminId ?? 'null'} mensajeAjuste=${r.mensajeAjuste ?? 'null'}`);
  });
  console.groupEnd();

  // Eliminar duplicados por serie: si hay duplicados, preferir el que tiene puntosInvertidos=true
  const resultadosUnicos = resultados.reduce((acc, resultado) => {
    const existingIdx = acc.findIndex(r => r.tipoSerie === resultado.tipoSerie);
    if (existingIdx === -1) {
      acc.push(resultado);
    } else if (!acc[existingIdx].puntosInvertidos && resultado.puntosInvertidos) {
      acc[existingIdx] = resultado;
    }
    return acc;
  }, [] as ResultadoSerie[]);

  if (!partido) return null;

  const series = ['TERCERA', 'SEGUNDA', 'SENIOR', 'PRIMERA'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-premier-bg border-2 border-premier-accent/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-white mb-1">
              Detalle del Partido
            </h2>
            <p className="text-premier-muted text-sm">
              Jornada {partido.jornada.numero} • {new Date(partido.jornada.fecha).toLocaleDateString('es-AR')} • {partido.jornada.hora}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-premier-muted hover:text-white transition-colors"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* Marcador Principal - RESULTADO FINAL */}
        <div className="mb-8 p-8 bg-gradient-to-br from-premier-accent/20 via-purple-900/20 to-transparent rounded-2xl border-2 border-premier-accent/40 shadow-xl shadow-premier-accent/20">
          <p className="text-center text-premier-accent font-bold text-sm uppercase tracking-widest mb-4">
            Resultado Final
          </p>
          <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
            {/* Club Local */}
            <div className="text-center">
              <LazyImage
                src={getClubLogo(partido.clubLocal?.nombre || '')}
                className="w-16 h-16 md:w-20 md:h-20 object-contain mx-auto mb-3"
                alt=""
              />
              <h3 className="font-black text-white text-base md:text-lg mb-3">
                {partido.clubLocal?.nombreCorto}
              </h3>
              <div className="inline-flex items-center justify-center bg-premier-card/80 rounded-xl px-6 py-3 min-w-[80px]">
                <span className="text-4xl md:text-5xl font-black text-white">
                  {resultadosUnicos.reduce((acc, r) => {
                    const puntosVictoria = r.tipoSerie === 'PRIMERA' ? 4 : 3;
                    const puntosEmpate = r.tipoSerie === 'PRIMERA' ? 2 : 1;
                    if (r.ganadorAdminId) {
                      return acc + (r.ganadorAdminId === partido.clubLocal?.id ? puntosVictoria : 0);
                    }
                    if (r.golesLocal > r.golesVisitante) {
                      return acc + (r.puntosInvertidos ? 0 : puntosVictoria);
                    }
                    if (r.golesVisitante > r.golesLocal) {
                      return acc + (r.puntosInvertidos ? puntosVictoria : 0);
                    }
                    return acc + (r.puntosInvertidos ? 0 : puntosEmpate);
                  }, 0)}
                </span>
              </div>
              <p className="text-premier-muted text-xs mt-2 uppercase tracking-wide">Puntos</p>
            </div>
            
            {/* Separador */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-8 w-px bg-premier-border/40"></div>
              <span className="text-[10px] font-bold text-premier-muted/60 uppercase tracking-widest px-2">vs</span>
              <div className="h-8 w-px bg-premier-border/40"></div>
              <span className="text-[9px] text-premier-muted/50 uppercase tracking-wider mt-1">
                J{partido.jornada.numero}
              </span>
            </div>
            
            {/* Club Visitante */}
            <div className="text-center">
              <LazyImage
                src={getClubLogo(partido.clubVisitante?.nombre || '')}
                className="w-16 h-16 md:w-20 md:h-20 object-contain mx-auto mb-3"
                alt=""
              />
              <h3 className="font-black text-white text-base md:text-lg mb-3">
                {partido.clubVisitante?.nombreCorto}
              </h3>
              <div className="inline-flex items-center justify-center bg-premier-card/80 rounded-xl px-6 py-3 min-w-[80px]">
                <span className="text-4xl md:text-5xl font-black text-white">
                  {resultadosUnicos.reduce((acc, r) => {
                    const puntosVictoria = r.tipoSerie === 'PRIMERA' ? 4 : 3;
                    const puntosEmpate = r.tipoSerie === 'PRIMERA' ? 2 : 1;
                    if (r.ganadorAdminId) {
                      return acc + (r.ganadorAdminId === partido.clubVisitante?.id ? puntosVictoria : 0);
                    }
                    if (r.golesVisitante > r.golesLocal) {
                      return acc + (r.puntosInvertidos ? 0 : puntosVictoria);
                    }
                    if (r.golesLocal > r.golesVisitante) {
                      return acc + (r.puntosInvertidos ? puntosVictoria : 0);
                    }
                    return acc + (r.puntosInvertidos ? 0 : puntosEmpate);
                  }, 0)}
                </span>
              </div>
              <p className="text-premier-muted text-xs mt-2 uppercase tracking-wide">Puntos</p>
            </div>
          </div>
        </div>

        {/* Desglose por Serie */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 bg-premier-border/30"></div>
            <h3 className="text-sm font-bold text-premier-muted uppercase tracking-wide">Desglose por Serie</h3>
            <div className="h-px flex-1 bg-premier-border/30"></div>
          </div>
          
          <div className="space-y-2">
            {series.map((serie) => {
              const resultado = resultadosUnicos.find(r => r.tipoSerie === serie);
              const colors = seriesColors[serie as keyof typeof seriesColors];
              
              if (!resultado) return null;

              const ganadorLocal = resultado.golesLocal > resultado.golesVisitante;
              const ganadorVisitante = resultado.golesVisitante > resultado.golesLocal;
              const empate = resultado.golesLocal === resultado.golesVisitante;

              return (
                <div
                  key={serie}
                  className={`p-3 rounded-lg border ${colors.border} bg-premier-card/20 hover:bg-premier-card/30 transition-colors`}
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Nombre de la Serie */}
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <div className={`w-2 h-2 rounded-full ${colors.bg}`}></div>
                      <span className={`font-bold text-sm ${colors.text}`}>
                        {seriesNames[serie as keyof typeof seriesNames]}
                      </span>
                    </div>
                    
                    {/* Resultado */}
                    <div className="flex items-center gap-3">
                      <span className={`text-xl font-black min-w-[30px] text-right ${
                        ganadorLocal ? 'text-premier-accent' : empate ? 'text-white' : 'text-white/60'
                      }`}>
                        {resultado.golesLocal}
                      </span>
                      <span className="text-premier-muted text-xs">-</span>
                      <span className={`text-xl font-black min-w-[30px] text-left ${
                        ganadorVisitante ? 'text-premier-accent' : empate ? 'text-white' : 'text-white/60'
                      }`}>
                        {resultado.golesVisitante}
                      </span>
                    </div>
                    
                    {/* Badge de Puntos - respeta ganadorAdminId y puntosInvertidos */}
                    {(() => {
                      const pts = serie === 'PRIMERA' ? '4' : '3';
                      const ganadorAdmin = resultado.ganadorAdminId
                        ? (resultado.ganadorAdminId === partido.clubLocal?.id ? partido.clubLocal : partido.clubVisitante)
                        : null;
                      return (
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide min-w-[70px] text-center ${
                          resultado.ganadorAdminId || resultado.puntosInvertidos
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                            : empate 
                            ? 'bg-white/10 text-white border border-white/30'
                            : ganadorLocal
                            ? 'bg-premier-accent/20 text-premier-accent border border-premier-accent/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {resultado.ganadorAdminId
                            ? `${ganadorAdmin?.nombreCorto} +${pts} (Sec.)`
                            : resultado.puntosInvertidos
                            ? empate
                              ? 'Sin puntos'
                              : `${(ganadorLocal ? partido.clubVisitante : partido.clubLocal)?.nombreCorto} +${pts}`
                            : empate 
                            ? serie === 'PRIMERA' ? '+2 c/u' : '+1 c/u'
                            : ganadorLocal 
                            ? `${partido.clubLocal?.nombreCorto} +${pts}` 
                            : `${partido.clubVisitante?.nombreCorto} +${pts}`
                          }
                        </div>
                      );
                    })()}
                  </div>
                  
                  {/* Mensaje de ajuste de puntos */}
                  {resultado.mensajeAjuste && (
                    <div className="mt-2 pt-2 border-t border-premier-border/20">
                      <div className="flex items-start gap-2">
                        <span className="text-premier-accent text-xs">⚠️</span>
                        <div>
                          <p className="text-xs text-premier-accent font-semibold">Ajuste por Secretaría</p>
                          <p className="text-[11px] text-premier-muted mt-0.5 leading-relaxed">
                            {resultado.mensajeAjuste}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
