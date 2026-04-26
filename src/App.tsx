import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoadingScreen from './components/LoadingScreen';

const ClubsPage = lazy(() => import('./pages/ClubsPage'));
const ClubDetailPage = lazy(() => import('./pages/ClubDetailPage'));
const FixturePage = lazy(() => import('./pages/FixturePage'));
const ScorersPage = lazy(() => import('./pages/ScorersPage'));
const VallasPage = lazy(() => import('./pages/VallasPage'));

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/clubes" element={<ClubsPage />} />
                <Route path="/clubes/:id" element={<ClubDetailPage />} />
                <Route path="/fixture" element={<FixturePage />} />
                <Route path="/goleadores" element={<ScorersPage />} />
                <Route path="/vallas" element={<VallasPage />} />
              </Routes>
            </Suspense>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
