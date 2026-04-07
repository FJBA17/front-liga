import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCalendar, FaClock, FaTrophy, FaFutbol } from 'react-icons/fa';
import { GET_JORNADAS } from '../graphql/queries/matches';
import { GET_PARTIDOS_BY_JORNADA, GET_RESULTADOS_BY_PARTIDO } from '../graphql/queries/matches';
import { Jornada, Partido, ResultadoSerie } from '../types';
import { getClubLogo } from '../utils/clubImages';

interface PartidoConResultados extends Partido {
  resultados?: ResultadoSerie[];
}

export default function JornadaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: jornadasData } = useQuery<{ jornadas: Jornada[] }>(GET_JORNADAS);
  const { data: partidosData } = useQuery<{ partidosPorJornada: Partido[] }>(
    GET_PARTIDOS_BY_JORNADA,
    {
      variables: { jornadaId: id },
      skip: !id,
    }
  );

  const jornada = jornadasData?.jornadas.find(j => j.id === id);
  const partidos = partidosData?.partidosPorJornada || [];

  // Calcular puntos por club en esta jornada
  const calcularPuntos = (resultados: ResultadoSerie[], esLocal: boolean): number => {
    if (!resultados || resultados.length === 0) return 0;
    
    let puntos = 0;
    resultados.forEach(resultado => {
      const golesClub = esLocal ? resultado.golesLocal : resultado.golesVisitante;
      const golesRival = esLocal ? resultado.golesVisitante : resultado.golesLocal;
      const puntosVictoria = resultado.tipoSerie === 'PRIMERA' ? 4 : 3;
      const puntosEmpate = resultado.tipoSerie === 'PRIMERA' ? 2 : 1;
      
      if (golesClub > golesRival) {
        // Gané la serie
        if (!resultado.puntosInvertidos) {
          puntos += puntosVictoria;
        }
      } else if (golesClub < golesRival) {
        // Perdí la serie
        if (resultado.puntosInvertidos) {
          puntos += puntosVictoria;
        }
      } else {
        // Empate
        if (!resultado.puntosInvertidos) {
          puntos += puntosEmpate;
        }
      }
    });
    
    return puntos;
  };

  const seriesColors = {
    PRIMERA: 'bg-purple-500',
    SEGUNDA: 'bg-purple-700',
    TERCERA: 'bg-red-500',
    SENIOR: 'bg-purple-500',
  };

  const seriesLabels = {
    PRIMERA: 'Primera',
    SEGUNDA: 'Segunda',
    TERCERA: 'Tercera',
    SENIOR: 'Senior',
  };

  if (!jornada) {
    return (
      <div className="container-custom py-12 text-center">
        <p className="text-premier-muted">Jornada no encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/fixture')}
            className="flex items-center gap-2 text-premier-accent hover:text-premier-accent/80 mb-4 transition-colors"
          >
            <FaArrowLeft />
            <span>Volver al Fixture</span>
          </button>

          <div className="card p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                  Jornada {jornada.numero}
                  {jornada.esSegundaVuelta && <span className="text-premier-accent ml-2">(2da Vuelta)</span>}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-premier-muted">
                  <div className="flex items-center gap-2">
                    <FaCalendar className="text-premier-accent" />
                    <span>{new Date(jornada.fecha).toLocaleDateString('es-AR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaClock className="text-premier-accent" />
                    <span>{jornada.hora}</span>
                  </div>
                </div>
              </div>
              <div>
                <span className={`px-4 py-2 rounded-full text-white font-bold ${
                  jornada.estado === 'FINALIZADA' 
                    ? 'bg-premier-accent' 
                    : jornada.estado === 'ACTIVA'
                    ? 'bg-premier-accent/20'
                    : 'bg-gray-500'
                }`}>
                  {jornada.estado}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Partidos */}
        <div className="space-y-6">
          {partidos.map((partido, idx) => (
            <PartidoCard 
              key={partido.id} 
              partido={partido} 
              index={idx}
              calcularPuntos={calcularPuntos}
              seriesColors={seriesColors}
              seriesLabels={seriesLabels}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface PartidoCardProps {
  partido: Partido;
  index: number;
  calcularPuntos: (resultados: ResultadoSerie[], esLocal: boolean) => number;
  seriesColors: Record<string, string>;
  seriesLabels: Record<string, string>;
}

function PartidoCard({ partido, index, calcularPuntos, seriesColors, seriesLabels }: PartidoCardProps) {
  const { data: resultadosData } = useQuery<{ resultadosPorPartido: ResultadoSerie[] }>(
    GET_RESULTADOS_BY_PARTIDO,
    {
      variables: { partidoId: partido.id },
    }
  );

  const resultados = resultadosData?.resultadosPorPartido || [];
  const puntosLocal = calcularPuntos(resultados, true);
  const puntosVisitante = calcularPuntos(resultados, false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card p-4 md:p-6"
    >
      {/* Enfrentamiento principal */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 md:gap-8 items-center mb-6">
        {/* Club Local */}
        <div className="flex flex-col items-center text-center">
          <img
            src={getClubLogo(partido.clubLocal?.nombre || '')}
            alt={partido.clubLocal?.nombreCorto}
            className="w-16 h-16 md:w-20 md:h-20 object-contain mb-3"
          />
          <h3 className="text-lg md:text-xl font-black text-white mb-1">
            {partido.clubLocal?.nombreCorto}
          </h3>
          {partido.estado === 'FINALIZADO' && resultados.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <FaTrophy className="text-white text-sm" />
              <span className="text-2xl font-black text-premier-accent">
                {puntosLocal}
              </span>
              <span className="text-xs text-premier-muted">pts</span>
            </div>
          )}
        </div>

        {/* VS */}
        <div className="flex flex-col items-center">
          <span className="text-2xl md:text-4xl font-black text-premier-muted">VS</span>
          <span className="text-xs text-premier-muted mt-1">{partido.estadio}</span>
        </div>

        {/* Club Visitante */}
        <div className="flex flex-col items-center text-center">
          <img
            src={getClubLogo(partido.clubVisitante?.nombre || '')}
            alt={partido.clubVisitante?.nombreCorto}
            className="w-16 h-16 md:w-20 md:h-20 object-contain mb-3"
          />
          <h3 className="text-lg md:text-xl font-black text-white mb-1">
            {partido.clubVisitante?.nombreCorto}
          </h3>
          {partido.estado === 'FINALIZADO' && resultados.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <FaTrophy className="text-white text-sm" />
              <span className="text-2xl font-black text-premier-accent">
                {puntosVisitante}
              </span>
              <span className="text-xs text-premier-muted">pts</span>
            </div>
          )}
        </div>
      </div>

      {/* Resultados por Serie */}
      {resultados.length > 0 && (
        <div className="border-t border-premier-border/20 pt-4">
          <h4 className="text-sm font-bold text-premier-muted mb-3 flex items-center gap-2">
            <FaFutbol className="text-premier-accent" />
            Resultados por Serie
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {resultados.map((resultado) => (
              <div
                key={resultado.id}
                className="bg-premier-card/40 rounded-lg p-3 text-center"
              >
                <span className={`inline-block px-2 py-1 rounded-full text-white text-xs font-bold mb-2 ${
                  seriesColors[resultado.tipoSerie as keyof typeof seriesColors]
                }`}>
                  {seriesLabels[resultado.tipoSerie as keyof typeof seriesLabels]}
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-xl font-black ${
                    resultado.golesLocal > resultado.golesVisitante 
                      ? 'text-premier-accent' 
                      : resultado.golesLocal < resultado.golesVisitante
                      ? 'text-premier-muted'
                      : 'text-white'
                  }`}>
                    {resultado.golesLocal}
                  </span>
                  <span className="text-premier-muted">-</span>
                  <span className={`text-xl font-black ${
                    resultado.golesVisitante > resultado.golesLocal 
                      ? 'text-premier-accent' 
                      : resultado.golesVisitante < resultado.golesLocal
                      ? 'text-premier-muted'
                      : 'text-white'
                  }`}>
                    {resultado.golesVisitante}
                  </span>
                </div>
                
                {/* Mensaje de ajuste de puntos */}
                {resultado.mensajeAjuste && (
                  <div className="mt-2 pt-2 border-t border-premier-border/20">
                    <p className="text-xs text-premier-accent font-semibold">⚠️ Ajuste</p>
                    <p className="text-[10px] text-premier-muted mt-0.5 leading-tight">
                      {resultado.mensajeAjuste}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {partido.estado !== 'FINALIZADO' && (
        <div className="text-center text-premier-muted text-sm mt-4">
          Partido pendiente
        </div>
      )}
    </motion.div>
  );
}
