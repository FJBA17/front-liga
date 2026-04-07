import { gql } from '@apollo/client';

export const GET_CLUBES = gql`
  query GetClubes {
    clubes {
      id
      nombre
      nombreCorto
      estadio
      instagramUrl
      ubicacionEstadio
    }
  }
`;

export const GET_CLUB_BY_ID = gql`
  query GetClub($id: ID!) {
    club(id: $id) {
      id
      nombre
      nombreCorto
      estadio
      instagramUrl
      ubicacionEstadio
    }
  }
`;
