import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import { GET_TABLA_POSICIONES } from '../../graphql/queries/standings';
import { getClubLogo } from '../../utils/clubImages';
import { TablaPosicion } from '../../types';
import { FaTrophy } from 'react-icons/fa';

export default function StandingsTable() {
  const { data, loading, error } = useQuery<{ tablaPosiciones: TablaPosicion[] }>(
    GET_TABLA_POSICIONES
  );
  
  // Debug logs
  if (error) {
    console.error('❌ ERROR al cargar tabla de posiciones:', error);
    console.error('GraphQL Errors:', error.graphQLErrors);
    console.error('Network Error:', error.networkError);
  }
  if (data) {
    console.log('✅ Tabla de posiciones cargada:', data.tablaPosiciones.length, 'equipos');
  }
  
  if (error) {
    return (
      <div className="card p-8 bg-red-900/20 border-red-500">
        <h3 className="text-lg font-bold text-red-400 mb-2">❌ Error al cargar tabla</h3>
        <pre className="text-xs text-red-300 overflow-auto">{JSON.stringify(error.message, null, 2)}</pre>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="card p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-12 bg-premier-border/20 rounded"></div>
          ))}
        </div>
      </div>
    );
  }
  
  const tabla = data?.tablaPosiciones || [];
  
  return (
    <div className="card p-8">
      <div className="flex items-center gap-3 mb-8">
        <FaTrophy className="text-white text-3xl" />
        <h3 className="text-3xl font-bold text-white">Tabla de Posiciones</h3>
      </div>
      
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-premier-muted border-b border-premier-border">
              <th className="text-left py-3 px-2">#</th>
              <th className="text-left py-3 px-2">Equipo</th>
              <th className="text-center py-3 px-2 hidden sm:table-cell">PJ</th>
              <th className="text-center py-3 px-2 hidden md:table-cell">G</th>
              <th className="text-center py-3 px-2 hidden md:table-cell">E</th>
              <th className="text-center py-3 px-2 hidden md:table-cell">P</th>
              <th className="text-center py-3 px-2">GF</th>
              <th className="text-center py-3 px-2">GC</th>
              <th className="text-center py-3 px-2 hidden sm:table-cell">DG</th>
              <th className="text-center py-3 px-2 font-bold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {tabla.map((item, index) => (
              <motion.tr
                key={item.club.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border-b border-premier-border/50 hover:bg-premier-accent/10 transition-colors ${
                  index === 0 ? 'bg-premier-accent/10' : ''
                }`}
              >
                <td className="py-4 px-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0
                        ? 'bg-premier-accent text-white shadow-lg shadow-premier-accent/50'
                        : index === 1
                        ? 'bg-gray-400 text-premier-bg'
                        : index === 2
                        ? 'bg-purple-600 text-white'
                        : 'text-premier-muted'
                    }`}
                  >
                    {item.posicion}
                  </div>
                </td>
                <td className="py-4 px-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={getClubLogo(item.club.nombre)}
                      alt={item.club.nombreCorto}
                      className="w-8 h-8 object-contain"
                    />
                    <span className="font-medium">{item.club.nombreCorto}</span>
                  </div>
                </td>
                <td className="text-center py-4 px-2 hidden sm:table-cell text-premier-muted">
                  {item.partidosJugados}
                </td>
                <td className="text-center py-4 px-2 hidden md:table-cell text-premier-success">
                  {item.partidosGanados}
                </td>
                <td className="text-center py-4 px-2 hidden md:table-cell text-premier-muted">
                  {item.partidosEmpatados}
                </td>
                <td className="text-center py-4 px-2 hidden md:table-cell text-red-400">
                  {item.partidosPerdidos}
                </td>
                <td className="text-center py-4 px-2">{item.golesAFavor}</td>
                <td className="text-center py-4 px-2">{item.golesEnContra}</td>
                <td className={`text-center py-4 px-2 hidden sm:table-cell font-medium ${
                  item.diferenciaGoles > 0
                    ? 'text-premier-success'
                    : item.diferenciaGoles < 0
                    ? 'text-red-400'
                    : 'text-premier-muted'
                }`}>
                  {item.diferenciaGoles > 0 ? '+' : ''}{item.diferenciaGoles}
                </td>
                <td className="text-center py-4 px-2 font-bold text-premier-accent text-xl">
                  {item.puntos}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 pt-4 border-t border-premier-border">
        <div className="flex flex-wrap gap-4 text-xs text-premier-muted">
          <span><strong>PJ:</strong> Partidos Jugados</span>
          <span className="hidden md:inline"><strong>G:</strong> Ganados</span>
          <span className="hidden md:inline"><strong>E:</strong> Empatados</span>
          <span className="hidden md:inline"><strong>P:</strong> Perdidos</span>
          <span><strong>GF:</strong> Goles a Favor</span>
          <span><strong>GC:</strong> Goles en Contra</span>
          <span className="hidden sm:inline"><strong>DG:</strong> Diferencia de Goles</span>
          <span><strong>Pts:</strong> Puntos</span>
        </div>
      </div>
    </div>
  );
}
