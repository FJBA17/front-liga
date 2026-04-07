import { useQuery } from '@apollo/client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GET_CLUBES } from '../../graphql/queries/clubs';
import { getClubLogo } from '../../utils/clubImages';
import { Club } from '../../types';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

export default function ClubsCarousel() {
  const { data, loading, error } = useQuery<{ clubes: Club[] }>(GET_CLUBES);
  
  // Debug logs
  if (error) {
    console.error('❌ ERROR al cargar clubes:', error);
    console.error('GraphQL Errors:', error.graphQLErrors);
    console.error('Network Error:', error.networkError);
  }
  if (data) {
    console.log('✅ Clubes cargados:', data.clubes.length, 'clubes');
  }
  const navigate = useNavigate();
  
  if (error) {
    return (
      <div className="card p-8 bg-red-900/20 border-red-500">
        <h3 className="text-lg font-bold text-red-400 mb-2">❌ Error al cargar clubes</h3>
        <pre className="text-xs text-red-300 overflow-auto">{JSON.stringify(error.message, null, 2)}</pre>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-premier-accent"></div>
      </div>
    );
  }
  
  const clubes = data?.clubes || [];
  
  return (
    <div className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Nuestros Clubes
        </h2>
        <p className="text-premier-muted">
          9 equipos compitiendo por la gloria
        </p>
      </motion.div>
      
      <Swiper
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={'auto'}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }}
        pagination={{
          clickable: true,
        }}
        modules={[EffectCoverflow, Autoplay, Pagination]}
        className="!pb-12"
      >
        {clubes.map((club) => (
          <SwiperSlide
            key={club.id}
            className="!w-64 md:!w-80"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate(`/clubes/${club.id}`)}
              className="card p-8 cursor-pointer card-hover"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-premier-accent/20 to-transparent blur-2xl" />
                <img
                  src={getClubLogo(club.nombre)}
                  alt={club.nombre}
                  className="w-full h-48 object-contain relative z-10 drop-shadow-2xl"
                />
              </div>
              <h3 className="text-xl font-bold text-center mt-6 mb-2">
                {club.nombreCorto}
              </h3>
              <p className="text-premier-muted text-sm text-center">
                {club.estadio}
              </p>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
