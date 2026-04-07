import { gql } from '@apollo/client';

export const AJUSTAR_PUNTOS_SERIE = gql`
  mutation AjustarPuntosSerie($input: AjustarPuntosSerieInput!) {
    ajustarPuntosSerie(input: $input) {
      id
      tipoSerie
      golesLocal
      golesVisitante
      puntosInvertidos
      mensajeAjuste
    }
  }
`;
