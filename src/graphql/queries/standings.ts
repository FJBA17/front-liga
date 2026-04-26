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

export const GET_GOLES_ENCAJADOS_POR_SERIE = gql`
  query GetGolesEncajadosPorSerie {
    golesEncajadosPorSerie {
      serie
      clubes {
        club {
          id
          nombre
          nombreCorto
        }
        golesEncajados
      }
    }
  }
`;
