import { gql } from '@apollo/client';

export const GET_JORNADAS = gql`
  query GetJornadas {
    jornadas {
      id
      numero
      fecha
      hora
      estado
      esSegundaVuelta
    }
  }
`;

export const GET_PARTIDOS_BY_JORNADA = gql`
  query GetPartidosByJornada($jornadaId: ID!) {
    partidosPorJornada(jornadaId: $jornadaId) {
      id
      clubLocal {
        id
        nombre
        nombreCorto
        ubicacionEstadio
      }
      clubVisitante {
        id
        nombre
        nombreCorto
        ubicacionEstadio
      }
      estadio
      estado
      jornada {
        numero
        fecha
        hora
      }
    }
  }
`;

export const GET_PARTIDOS_BY_CLUB = gql`
  query GetPartidosByClub($clubId: ID!) {
    partidosPorClub(clubId: $clubId) {
      id
      clubLocal {
        id
        nombre
        nombreCorto
      }
      clubVisitante {
        id
        nombre
        nombreCorto
      }
      estadio
      estado
      jornada {
        id
        numero
        fecha
        hora
        estado
      }
    }
  }
`;

export const GET_RESULTADOS_BY_PARTIDO = gql`
  query GetResultadosByPartido($partidoId: ID!) {
    resultadosPorPartido(partidoId: $partidoId) {
      id
      tipoSerie
      golesLocal
      golesVisitante
      puntosInvertidos
      ganadorAdminId
      mensajeAjuste
    }
  }
`;
