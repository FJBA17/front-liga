import { gql } from '@apollo/client';

export const GET_TABLA_POSICIONES = gql`
  query GetTablaPosiciones {
    tablaPosiciones {
      club {
        id
        nombre
        nombreCorto
      }
      posicion
      puntos
      partidosJugados
      partidosGanados
      partidosEmpatados
      partidosPerdidos
      golesAFavor
      golesEnContra
      diferenciaGoles
    }
  }
`;
