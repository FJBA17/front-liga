import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import { GET_GOLES_ENCAJADOS_POR_SERIE } from '../../graphql/queries/standings';
import { getClubLogo } from '../../utils/clubImages';
import { seriesColors, seriesNames } from '../../utils/seriesColors';
import { GolesEncajadosPorSerie, TipoSerie } from '../../types';

export default function TopVallasGrid() {
  const { data, loading } = useQuery<{ golesEncajadosPorSerie: GolesEncajadosPorSerie[] }>(
    GET_GOLES_ENCAJADOS_POR_SERIE,
    { fetchPolicy: 'cache-first' }
  );

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="h-32 bg-premier-border/20 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const todos = data?.golesEncajadosPorSerie || [];
  const series = [TipoSerie.TERCERA, TipoSerie.SEGUNDA, TipoSerie.SENIOR, TipoSerie.PRIMERA];

  const topBySerie = Object.fromEntries(
    series.map(serie => [
      serie,
      (todos.find(d => d.serie === serie)?.clubes ?? []).slice(0, 3),
    ])
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {series.map((serie, index) => {
        const colors = seriesColors[serie];
        const name = seriesNames[serie];
        const clubes = topBySerie[serie] ?? [];
        const lider = clubes[0];

        return (
          <motion.div
            key={serie}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-3 lg:p-6 relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${colors.gradient} blur-2xl opacity-50`} />

            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-3 lg:mb-4">
                <h3 className="text-sm lg:text-xl font-black text-white mb-1 lg:mb-2">
                  VALLA MENOS BATIDA
                </h3>
                <span className={`inline-block px-2 lg:px-4 py-1 rounded-full text-white text-xs lg:text-sm font-bold ${colors.bg}`}>
                  {name}
                </span>
              </div>

              {lider ? (
                <>
                  {/* Escudo del líder */}
                  <div className="flex justify-center mb-3 lg:mb-6">
                    <div className="relative">
                      <img
                        src={getClubLogo(lider.club.nombre)}
                        alt={lider.club.nombreCorto}
                        loading="lazy"
                        decoding="async"
                        className="w-16 h-16 lg:w-24 lg:h-24 object-contain"
                      />
                      <div className="absolute -bottom-1 -right-1 lg:-bottom-2 lg:-right-2 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-premier-accent flex items-center justify-center border-2 lg:border-4 border-premier-card">
                        <span className="text-white font-black text-sm lg:text-lg">{lider.golesEncajados}</span>
                      </div>
                    </div>
                  </div>

                  {/* Nombre del líder */}
                  <div className="text-center mb-3 lg:mb-6">
                    <p className="text-white font-black text-xs lg:text-lg leading-tight">
                      {lider.club.nombre}
                    </p>
                    <p className="text-premier-muted text-xs lg:text-sm">
                      {lider.club.nombreCorto}
                    </p>
                  </div>

                  {/* Top 3 */}
                  <div className="space-y-1.5 lg:space-y-3">
                    {clubes.map((item, idx) => (
                      <div
                        key={item.club.id}
                        className="flex items-center gap-1.5 lg:gap-3 p-1.5 lg:p-2 rounded-lg bg-premier-card/40 hover:bg-premier-accent/10 transition-colors"
                      >
                        <span className="text-premier-muted font-bold text-xs lg:text-sm w-4 lg:w-6">
                          {idx + 1}
                        </span>
                        <img
                          src={getClubLogo(item.club.nombre)}
                          alt={item.club.nombreCorto}
                          loading="lazy"
                          decoding="async"
                          className="w-5 h-5 lg:w-8 lg:h-8 object-contain"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs lg:text-sm font-bold truncate">
                            {item.club.nombreCorto}
                          </p>
                        </div>
                        <span className={`font-black text-xs lg:text-sm ${colors.text}`}>
                          {item.golesEncajados}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 lg:py-12 text-premier-muted">
                  <p className="text-xs lg:text-base">Sin datos aún</p>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
