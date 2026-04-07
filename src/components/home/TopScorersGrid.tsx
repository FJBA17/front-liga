import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import { GET_GOLEADORES_POR_SERIE } from '../../graphql/queries/scorers';
import { getClubLogo } from '../../utils/clubImages';
import { seriesColors, seriesNames, seriesIcons } from '../../utils/seriesColors';
import { GoleadorPorSerie, TipoSerie } from '../../types';
import { FaFutbol } from 'react-icons/fa';

export default function TopScorersGrid() {
  const { data, loading, error } = useQuery<{ goleadoresPorSerie: GoleadorPorSerie[] }>(
    GET_GOLEADORES_POR_SERIE
  );
  
  // Debug logs
  if (error) {
    console.error('❌ ERROR al cargar tabla de goleadores:', error);
    console.error('GraphQL Errors:', error.graphQLErrors);
    console.error('Network Error:', error.networkError);
  }
  if (data) {
    console.log('✅ Goleadores por serie cargados:', data.goleadoresPorSerie.length, 'registros');
  }
  
  if (error) {
    return (
      <div className="card p-8 bg-red-900/20 border-red-500">
        <h3 className="text-lg font-bold text-red-400 mb-2">❌ Error al cargar goleadores</h3>
        <pre className="text-xs text-red-300 overflow-auto">{JSON.stringify(error.message, null, 2)}</pre>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="h-32 bg-premier-border/20 rounded"></div>
          </div>
        ))}
      </div>
    );
  }
  
  const goleadores = data?.goleadoresPorSerie || [];
  
  // Agrupar por serie
  const topBySerie = {
    [TipoSerie.TERCERA]: goleadores.filter(g => g.serie === TipoSerie.TERCERA).slice(0, 3),
    [TipoSerie.SEGUNDA]: goleadores.filter(g => g.serie === TipoSerie.SEGUNDA).slice(0, 3),
    [TipoSerie.SENIOR]: goleadores.filter(g => g.serie === TipoSerie.SENIOR).slice(0, 3),
    [TipoSerie.PRIMERA]: goleadores.filter(g => g.serie === TipoSerie.PRIMERA).slice(0, 3),
  };
  
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <FaFutbol className="text-white text-3xl" />
        <h3 className="text-3xl font-bold text-white">Máximos Goleadores por Serie</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(topBySerie).map(([serie, scorers], index) => {
          const colors = seriesColors[serie as TipoSerie];
          const name =  seriesNames[serie as TipoSerie];
          const icon = seriesIcons[serie as TipoSerie];
          
          return (
            <motion.div
              key={serie}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6 relative overflow-hidden"
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${colors.gradient} blur-2xl opacity-50`}
              />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{icon}</span>
                  <h4 className={`text-xl font-bold ${colors.text}`}>
                    {name}
                  </h4>
                </div>
                
                <div className="space-y-3">
                  {scorers.length === 0 ? (
                    <div className="text-center py-6 text-premier-muted">
                      <p className="text-sm">Sin goleadores registrados</p>
                    </div>
                  ) : (
                    scorers.map((scorer, idx) => (
                      <div
                        key={scorer.jugador.id}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          idx === 0 ? 'bg-premier-accent/10 border border-premier-accent/30' : 'bg-premier-bg/50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          idx === 0
                            ? 'bg-premier-accent text-white'
                            : 'bg-premier-border text-premier-muted'
                        }`}>
                          {idx + 1}
                        </div>
                        
                        <img
                          src={getClubLogo(scorer.jugador.club.nombre)}
                          alt={scorer.jugador.club.nombreCorto}
                          className="w-6 h-6 object-contain"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">
                            {scorer.jugador.nombre1} {scorer.jugador.apellido1}
                          </p>
                          <p className="text-xs text-premier-muted truncate">
                            {scorer.jugador.club.nombreCorto}
                          </p>
                        </div>
                        
                        <div className={`font-bold ${colors.text}`}>
                          {scorer.goles}
                          <span className="text-xs ml-1 text-premier-muted">goles</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
