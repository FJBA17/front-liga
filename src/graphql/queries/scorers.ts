import { gql } from '@apollo/client';

export const GET_TABLA_GOLEADORES = gql`
  query GetTablaGoleadores {
    tablaGoleadores {
      jugador {
        id
        nombre1
        nombre2
        apellido1
        apellido2
        club {
          id
          nombre
          nombreCorto
        }
      }
      goles
    }
  }
`;

export const GET_GOLEADORES_POR_SERIE = gql`
  query GetGoleadoresPorSerie {
    goleadoresPorSerie {
      jugador {
        id
        nombre1
        nombre2
        apellido1
        apellido2
        club {
          id
          nombre
          nombreCorto
        }
      }
      serie
      goles
    }
  }
`;

export const GET_GOLEADORES_BY_CLUB = gql`
  query GetGoleadoresByClub($clubId: ID!) {
    golesPorClub(clubId: $clubId) {
      id
      jugador {
        id
        nombre1
        nombre2
        apellido1
        apellido2
      }
      club {
        id
        nombre
        nombreCorto
      }
      resultadoSerie {
        tipoSerie
      }
    }
  }
`;
