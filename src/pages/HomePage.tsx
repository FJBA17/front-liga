import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_CLUBES } from '../graphql/queries/clubs';
import { GET_TABLA_POSICIONES } from '../graphql/queries/standings';
import { GET_GOLEADORES_POR_SERIE } from '../graphql/queries/scorers';
import { getClubLogo } from '../utils/clubImages';
import { Club, TablaPosicion, GoleadorPorSerie } from '../types';
import { FaTrophy, FaFutbol } from 'react-icons/fa';
import NoticiasCarousel from '../components/NoticiasCarousel';
import LoadingScreen from '../components/LoadingScreen';
import LazyImage from '../components/LazyImage';
import TopVallasGrid from '../components/home/TopVallasGrid';

export default function HomePage() {
  const { data: clubesData, loading: loadingClubes } = useQuery<{ clubes: Club[] }>(GET_CLUBES);
  const { data: tablaData, loading: loadingTabla } = useQuery<{ tablaPosiciones: TablaPosicion[] }>(GET_TABLA_POSICIONES);
  const { data: goleadoresData } = useQuery<{ goleadoresPorSerie: GoleadorPorSerie[] }>(GET_GOLEADORES_POR_SERIE);

  if (loadingClubes || loadingTabla) return <LoadingScreen />;

  const clubes = clubesData?.clubes || [];
  const tabla = (tablaData?.tablaPosiciones || []).slice(0, 9);
  const goleadoresPorSerie = goleadoresData?.goleadoresPorSerie || [];
  const series = ['TERCERA', 'SEGUNDA', 'SENIOR', 'PRIMERA'];
  const seriesLabels = {
    PRIMERA: 'Primera',
    SEGUNDA: 'Segunda',
    TERCERA: 'Tercera',
    SENIOR: 'Senior'
  };
  const seriesColors = {
    PRIMERA: 'bg-purple-500',
    SEGUNDA: 'bg-purple-700',
    TERCERA: 'bg-red-500',
    SENIOR: 'bg-purple-500'
  };

  return (
    <div className="min-h-screen">
      
      {/* Tabla de Posiciones */}
      <section className="container-custom py-8">
        <div className="max-w-7xl mx-auto">
          <div className="card p-4 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <FaTrophy className="text-premier-accent text-2xl" />
              <h2 className="text-2xl md:text-3xl font-black text-white">Tabla de Posiciones</h2>
            </div>
            
            {/* Tabla Desktop - Vista Completa */}
            <div className="hidden md:block overflow-x-auto">
              {/* Header */}
              <div className="grid grid-cols-[60px_60px_1fr_80px_80px_80px_80px_100px] gap-4 px-4 py-2 bg-premier-card/30 rounded-t-lg border-b-2 border-premier-accent/20">
                <div className="text-premier-muted text-xs font-bold text-center">POS</div>
                <div className="text-premier-muted text-xs font-bold"></div>
                <div className="text-premier-muted text-xs font-bold">EQUIPO</div>
                <div className="text-premier-muted text-xs font-bold text-center">PJ</div>
                <div className="text-premier-muted text-xs font-bold text-center">GF</div>
                <div className="text-premier-muted text-xs font-bold text-center">GC</div>
                <div className="text-premier-muted text-xs font-bold text-center">DIF</div>
                <div className="text-premier-muted text-xs font-bold text-center">PTS</div>
              </div>
              
              {/* Filas */}
              <div>
                {tabla.map((item, idx) => (
                  <div
                    key={item.club.id}
                    className="grid grid-cols-[60px_60px_1fr_80px_80px_80px_80px_100px] gap-4 items-center px-4 py-2.5 border-b border-premier-border/20 hover:bg-premier-accent/5"
                  >
                    {/* Posición */}
                    <div className="flex justify-center">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${
                        idx === 0 
                          ? 'bg-premier-accent/20 text-premier-accent border border-premier-accent/30' 
                          : idx === 1
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : idx === 2
                          ? 'bg-purple-700/20 text-purple-400 border border-purple-700/30'
                          : 'text-premier-muted border border-premier-border/30'
                      }`}>
                        {item.posicion}
                      </span>
                    </div>
                    
                    {/* Logo */}
                    <div className="flex justify-center">
                      <LazyImage
                        src={getClubLogo(item.club.nombre)}
                        alt={item.club.nombreCorto}
                        className="w-9 h-9 object-contain"
                      />
                    </div>
                    
                    {/* Nombre del equipo */}
                    <span className="text-base text-premier-text font-bold">
                      {item.club.nombreCorto}
                    </span>
                    
                    {/* PJ */}
                    <span className="text-center text-premier-text text-sm font-medium">
                      {item.partidosJugados}
                    </span>
                    
                    {/* GF */}
                    <span className="text-center text-premier-accent text-sm font-bold">
                      {item.golesAFavor}
                    </span>
                    
                    {/* GC */}
                    <span className="text-center text-red-400 text-sm font-bold">
                      {item.golesEnContra}
                    </span>
                    
                    {/* Diferencia */}
                    <span className={`text-center text-sm font-bold ${
                      item.diferenciaGoles > 0 ? 'text-premier-accent' : item.diferenciaGoles < 0 ? 'text-red-400' : 'text-premier-muted'
                    }`}>
                      {item.diferenciaGoles > 0 ? '+' : ''}{item.diferenciaGoles}
                    </span>
                    
                    {/* Puntos */}
                    <span className="text-center font-black text-xl text-white">
                      {item.puntos}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Tabla Mobile - Vista con Scroll */}
            <div className="md:hidden flex gap-0 overflow-hidden">
              {/* PARTE FIJA - Posición y Logo solamente */}
              <div className="flex-shrink-0">
                {/* Header fijo */}
                <div className="grid grid-cols-[50px_50px] gap-2 px-2 py-2 bg-premier-card/30 rounded-tl-lg border-b-2 border-r-2 border-premier-accent/20">
                  <div className="text-premier-muted text-xs font-bold text-center">POS</div>
                  <div className="text-premier-muted text-xs font-bold text-center">CLUB</div>
                </div>
                
                {/* Filas fijas */}
                <div>
                  {tabla.map((item, idx) => (
                    <div
                      key={`fixed-${item.club.id}`}
                      className="grid grid-cols-[50px_50px] gap-2 items-center px-2 h-[52px] border-b border-r-2 border-premier-border/20 hover:bg-premier-accent/5"
                    >
                      {/* Posición */}
                      <div className="flex justify-center">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${
                          idx === 0 
                          ? 'bg-premier-accent/20 text-premier-accent border border-premier-accent/30' 
                          : idx === 1
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : idx === 2
                          ? 'bg-purple-700/20 text-purple-400 border border-purple-700/30'
                            : 'text-premier-muted border border-premier-border/30'
                        }`}>
                          {item.posicion}
                        </span>
                      </div>
                      
                      {/* Logo */}
                      <div className="flex justify-center items-center">
                        <LazyImage
                          src={getClubLogo(item.club.nombre)}
                          alt={item.club.nombreCorto}
                          className="w-9 h-9 object-contain"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* PARTE SCROLLEABLE - Estadísticas */}
              <div className="flex-1 overflow-x-auto custom-scrollbar">
                {/* Header scrolleable */}
                <div className="min-w-[320px] grid grid-cols-[60px_60px_60px_60px_80px] gap-2 px-2 py-2 bg-premier-card/30 rounded-tr-lg border-b-2 border-premier-accent/20">
                  <div className="text-premier-muted text-xs font-bold text-center">PJ</div>
                  <div className="text-premier-muted text-xs font-bold text-center">GF</div>
                  <div className="text-premier-muted text-xs font-bold text-center">GC</div>
                  <div className="text-premier-muted text-xs font-bold text-center">DIF</div>
                  <div className="text-premier-muted text-xs font-bold text-center">PTS</div>
                </div>
                
                {/* Filas scrolleables */}
                <div className="min-w-[320px]">
                  {tabla.map((item, idx) => (
                    <div
                      key={`scroll-${item.club.id}`}
                      className="grid grid-cols-[60px_60px_60px_60px_80px] gap-2 items-center px-2 h-[52px] border-b border-premier-border/20 hover:bg-premier-accent/5"
                    >
                      {/* PJ */}
                      <span className="text-center text-premier-text text-sm font-medium">
                        {item.partidosJugados}
                      </span>
                      
                      {/* GF */}
                      <span className="text-center text-premier-accent text-sm font-bold">
                        {item.golesAFavor}
                      </span>
                      
                      {/* GC */}
                      <span className="text-center text-red-400 text-sm font-bold">
                        {item.golesEnContra}
                      </span>
                      
                      {/* Diferencia */}
                      <span className={`text-center text-sm font-bold ${
                        item.diferenciaGoles > 0 ? 'text-premier-accent' : item.diferenciaGoles < 0 ? 'text-red-400' : 'text-premier-muted'
                      }`}>
                        {item.diferenciaGoles > 0 ? '+' : ''}{item.diferenciaGoles}
                      </span>
                      
                      {/* Puntos */}
                      <span className="text-center font-black text-lg text-white">
                        {item.puntos}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Noticias y Avisos */}
      <NoticiasCarousel />

      {/* Sección Goleadores por Serie */}
      <section className="container-custom py-8">
        <div>
          <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
            <FaFutbol className="text-premier-accent" />
            <span>Goleadores por Serie</span>
          </h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {series.map((serie, idx) => {
              const goleadoresSerie = goleadoresPorSerie
                .filter(g => g.serie === serie)
                .slice(0, 3);
              
              const lider = goleadoresSerie[0];
              
              return (
                <div
                  key={serie}
                  className="card p-3 lg:p-6"
                >
                  {/* Título de la serie */}
                  <div className="text-center mb-3 lg:mb-4">
                    <h3 className="text-sm lg:text-xl font-black text-white mb-1 lg:mb-2">
                      MÁXIMO GOLEADOR
                    </h3>
                    <span className={`inline-block px-2 lg:px-4 py-1 rounded-full text-white text-xs lg:text-sm font-bold ${seriesColors[serie as keyof typeof seriesColors]}`}>
                      {seriesLabels[serie as keyof typeof seriesLabels]}
                    </span>
                  </div>
                  
                  {lider ? (
                    <>
                      {/* Imagen/escudo grande del líder */}
                      <div className="flex justify-center mb-3 lg:mb-6">
                        <div className="relative">
                          <img
                            src={getClubLogo(lider.jugador.club.nombre)}
                            alt={lider.jugador.club.nombreCorto}
                            loading="lazy"
                            decoding="async"
                            className="w-16 h-16 lg:w-24 lg:h-24 object-contain"
                          />
                          <div className="absolute -bottom-1 -right-1 lg:-bottom-2 lg:-right-2 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-premier-accent flex items-center justify-center border-2 lg:border-4 border-premier-card">
                            <span className="text-white font-black text-sm lg:text-lg">{lider.goles}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Nombre del líder */}
                      <div className="text-center mb-3 lg:mb-6">
                        <p className="text-white font-black text-xs lg:text-lg leading-tight">
                          {lider.jugador.nombre1} {lider.jugador.apellido1}
                        </p>
                        <p className="text-premier-muted text-xs lg:text-sm">
                          {lider.jugador.club.nombreCorto}
                        </p>
                      </div>
                      
                      {/* Top 3 lista */}
                      <div className="space-y-1.5 lg:space-y-3">
                        {goleadoresSerie.map((goleador, index) => (
                          <div 
                            key={goleador.jugador.id}
                            className="flex items-center gap-1.5 lg:gap-3 p-1.5 lg:p-2 rounded-lg bg-premier-card/40 hover:bg-premier-accent/10 transition-colors"
                          >
                            <span className="text-premier-muted font-bold text-xs lg:text-sm w-4 lg:w-6">
                              {index + 1}
                            </span>
                            <img
                              src={getClubLogo(goleador.jugador.club.nombre)}
                              alt={goleador.jugador.club.nombreCorto}
                              loading="lazy"
                              decoding="async"
                              className="w-5 h-5 lg:w-8 lg:h-8 object-contain"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-xs lg:text-sm font-bold truncate">
                                {goleador.jugador.nombre1} {goleador.jugador.apellido1}
                              </p>
                            </div>
                            <span className="text-premier-accent font-black text-xs lg:text-sm">
                              {goleador.goles}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 lg:py-12 text-premier-muted">
                      <FaFutbol className="mx-auto text-2xl lg:text-4xl mb-2 lg:mb-3 opacity-20" />
                      <p className="text-xs lg:text-base">Sin goleadores aún</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sección Vallas menos batidas */}
      <section className="container-custom py-8">
        <div>
          <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
            <span className="text-premier-accent">🧤</span>
            <span>Vallas Menos Batidas</span>
          </h2>
          <TopVallasGrid />
        </div>
      </section>

      {/* Sección Clubes - Grid inferior */}
      <section className="container-custom pb-12">
        <div>
          <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
            <span>Clubes Participantes</span>
            <span className="text-premier-accent text-xl">({clubes.length})</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {clubes.map((club) => (
              <Link key={club.id} to={`/clubes/${club.id}`}>
                <div
                  className="card aspect-square p-5 flex flex-col items-center justify-center gap-3 cursor-pointer group hover:-translate-y-1 transition-transform duration-200"
                >
                  <img
                    src={getClubLogo(club.nombre)}
                    alt={club.nombre}
                    loading="lazy"
                    decoding="async"
                    className="w-20 h-20 object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                  <h3 className="text-sm font-bold text-center text-premier-text group-hover:text-white transition-colors">
                    {club.nombreCorto}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
