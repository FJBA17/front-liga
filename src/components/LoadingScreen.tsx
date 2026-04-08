import { motion } from 'framer-motion';
import logoSmall from '../assets/LogoLigaSmall.png';

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #37003c 0%, #4a0638 50%, #37003c 100%)' }}
    >
      {/* Fondo animado */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 300 + i * 80,
              height: 300 + i * 80,
              border: '1px solid rgba(199,21,133,0.08)',
              top: '50%',
              left: '50%',
              translateX: '-50%',
              translateY: '-50%',
            }}
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          />
        ))}
      </div>

      {/* Logo container */}
      <div className="relative flex items-center justify-center">
        {/* Anillo giratorio exterior */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 120,
            height: 120,
            border: '3px solid transparent',
            borderTopColor: '#c71585',
            borderRightColor: '#c71585',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />

        {/* Anillo giratorio interior */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 90,
            height: 90,
            border: '2px solid transparent',
            borderBottomColor: '#d8bfd8',
            borderLeftColor: '#d8bfd8',
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
        />

        {/* Logo pulsando */}
        <motion.div
          className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(4px)' }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img src={logoSmall} alt="Liga Rural" className="w-12 h-12 object-contain" />
        </motion.div>
      </div>

      {/* Texto */}
      <motion.div
        className="mt-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <span className="text-white font-black text-lg tracking-widest uppercase">Cargando</span>
        {/* Puntos animados */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-premier-accent"
              animate={{ opacity: [0.2, 1, 0.2], y: [0, -4, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
