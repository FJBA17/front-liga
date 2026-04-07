import { useQuery } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInfoCircle, FaTimes } from 'react-icons/fa';
import { GET_AVISOS_ACTIVOS } from '../graphql/queries/avisos';
import { useState } from 'react';

interface Aviso {
  id: string;
  titulo: string;
  mensaje: string;
  createdAt: string;
}

export default function AvisosActivos() {
  const { data } = useQuery<{ avisosActivos: Aviso[] }>(GET_AVISOS_ACTIVOS);
  const [avisosOcultos, setAvisosOcultos] = useState<string[]>([]);

  const avisos = data?.avisosActivos || [];
  const avisosVisibles = avisos.filter(aviso => !avisosOcultos.includes(aviso.id));

  const ocultarAviso = (id: string) => {
    setAvisosOcultos(prev => [...prev, id]);
  };

  if (avisosVisibles.length === 0) return null;

  return (
    <div className="container-custom py-4">
      <div className="max-w-7xl mx-auto space-y-3">
        <AnimatePresence>
          {avisosVisibles.map((aviso, index) => (
            <motion.div
              key={aviso.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-gradient-to-r from-premier-accent/20 to-purple-600/20 border-l-4 border-premier-accent rounded-lg p-4 backdrop-blur-sm"
            >
              <button
                onClick={() => ocultarAviso(aviso.id)}
                className="absolute top-3 right-3 text-premier-muted hover:text-white transition-colors"
                aria-label="Cerrar aviso"
              >
                <FaTimes size={16} />
              </button>
              
              <div className="flex items-start gap-3 pr-8">
                <FaInfoCircle className="text-premier-accent text-xl mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">{aviso.titulo}</h3>
                  <p className="text-premier-muted text-sm leading-relaxed">{aviso.mensaje}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
