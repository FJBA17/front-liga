import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import logoLiga from '../../assets/LogoLiga.png';

export default function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Fixture', path: '/fixture' },
    { name: 'Clubes', path: '/clubes' },
    { name: 'Goleadores', path: '/goleadores' },
  ];
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-premier-bg/80">
      <div className="container-custom">
        <div className="flex items-center h-[90px] gap-12 px-4 lg:px-10">
          
          {/* Logo */}
          <Link to="/" className="flex items-center group flex-shrink-0">
            <motion.img
              src={logoLiga}
              alt="Liga Rural"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="h-16 w-auto object-contain my-[25px]"
            />
          </Link>
          
          {/* Navegación - Todo a la izquierda */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative font-black text-base transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {item.name}
                <span className={`absolute -bottom-1 left-0 h-[2px] bg-white transition-all duration-200 ${
                  isActive(item.path) 
                    ? 'w-full' 
                    : 'w-0 group-hover:w-full'
                }`} />
              </Link>
            ))}
          </nav>
          
          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden ml-auto p-2 rounded-lg bg-premier-card/50 border border-premier-border/30 text-white hover:text-premier-accent hover:border-premier-accent/40 transition-all"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-premier-border/20"
            >
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-bold transition-all ${
                      isActive(item.path)
                        ? 'bg-premier-accent/10 text-white border-l-4 border-premier-accent'
                        : 'text-white/70 hover:bg-premier-accent/5 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
