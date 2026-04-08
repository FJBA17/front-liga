import { useQuery } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { FaBullhorn, FaCloudSun, FaUsers, FaFutbol, FaBook } from 'react-icons/fa';
import { GET_AVISOS_ACTIVOS } from '../graphql/queries/avisos';

type TipoAviso = 'CLIMA' | 'REUNION' | 'PARTIDO' | 'REGLAMENTO' | 'OTRO';

interface Aviso {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: TipoAviso;
  createdAt: string;
}

const TIPOS: Record<TipoAviso, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  CLIMA:      { label: 'Clima',      icon: <FaCloudSun />,  color: '#f59e0b', bg: 'from-amber-900/60 via-[#2a0a3e] to-[#1a0a2e]' },
  REUNION:    { label: 'Reunión',    icon: <FaUsers />,     color: '#3b82f6', bg: 'from-blue-900/60 via-[#2a0a3e] to-[#1a0a2e]' },
  PARTIDO:    { label: 'Partido',    icon: <FaFutbol />,    color: '#10b981', bg: 'from-emerald-900/60 via-[#2a0a3e] to-[#1a0a2e]' },
  REGLAMENTO: { label: 'Reglamento', icon: <FaBook />,      color: '#8b5cf6', bg: 'from-violet-900/60 via-[#2a0a3e] to-[#1a0a2e]' },
  OTRO:       { label: 'Aviso',      icon: <FaBullhorn />,  color: '#ec4899', bg: 'from-[#3a0a2e] via-[#2a0a3e] to-[#1a0a2e]' },
};

export default function NoticiasCarousel() {
  const { data } = useQuery<{ avisosActivos: Aviso[] }>(GET_AVISOS_ACTIVOS);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const avisos = data?.avisosActivos || [];

  const next = useCallback(() => {
    if (avisos.length <= 1) return;
    setDirection(1);
    setCurrent(prev => (prev + 1) % avisos.length);
  }, [avisos.length]);

  const prev = () => {
    if (avisos.length <= 1) return;
    setDirection(-1);
    setCurrent(prev => (prev - 1 + avisos.length) % avisos.length);
  };

  useEffect(() => {
    if (avisos.length <= 1) return;
    const timer = setInterval(next, 10000);
    return () => clearInterval(timer);
  }, [avisos.length, next]);

  if (avisos.length === 0) return null;

  const aviso = avisos[current];
  const tipo = TIPOS[aviso.tipo ?? 'OTRO'];
  const fecha = new Date(aviso.createdAt).toLocaleDateString('es-CL', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const variants = {
    enter:  (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <section className="container-custom pb-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <FaBullhorn className="text-premier-accent text-2xl" />
          <h2 className="text-2xl md:text-3xl font-black text-white">Noticias y Avisos</h2>
          {avisos.length > 1 && (
            <span className="ml-auto text-premier-muted text-sm">
              {current + 1} / {avisos.length}
            </span>
          )}
        </div>

        {/* Card */}
        <div className="relative overflow-hidden rounded-2xl min-h-[200px]">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={aviso.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="relative bg-[#100820] rounded-2xl p-8 md:p-10 overflow-hidden"
              style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 8px 40px rgba(0,0,0,0.5)` }}
            >
              {/* Radial glow from tipo color — bottom-right */}
              <div
                className="absolute -bottom-12 -right-12 w-[320px] h-[320px] rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${tipo.color}30 0%, transparent 70%)` }}
              />

              {/* Big decorative icon — faded background */}
              <div
                className="absolute -bottom-6 -right-6 text-[180px] md:text-[220px] opacity-[0.10] pointer-events-none select-none leading-none"
                style={{ color: tipo.color }}
              >
                {tipo.icon}
              </div>

              {/* Content */}
              <div className="relative z-10 max-w-3xl">
                {/* Tipo badge pill */}
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-bold uppercase tracking-widest"
                  style={{ backgroundColor: `${tipo.color}20`, color: tipo.color, border: `1px solid ${tipo.color}30` }}
                >
                  {tipo.icon}
                  {tipo.label}
                  <span className="opacity-40 mx-0.5">·</span>
                  <span className="font-normal normal-case tracking-normal opacity-70">{fecha}</span>
                </div>

                <h3 className="text-white font-black text-2xl md:text-3xl leading-tight mb-4">
                  {aviso.titulo}
                </h3>
                <p className="text-white/60 text-base md:text-lg leading-relaxed whitespace-pre-line">
                  {aviso.mensaje}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Arrow buttons removed — navigation via dots only */}
        </div>

        {/* Dot indicators */}
        {avisos.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {avisos.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                className={`transition-all duration-300 rounded-full ${
                  i === current
                    ? 'w-6 h-2'
                    : 'bg-premier-muted/40 hover:bg-premier-muted w-2 h-2'
                }`}
                style={i === current ? { backgroundColor: tipo.color } : {}}
                aria-label={`Ir a aviso ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
