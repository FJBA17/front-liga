import { gql } from '@apollo/client';

export const GET_AVISOS_ACTIVOS = gql`
  query GetAvisosActivos {
    avisosActivos {
      id
      titulo
      mensaje
      tipo
      createdAt
    }
  }
`;

export const GET_AVISOS = gql`
  query GetAvisos {
    avisos {
      id
      titulo
      mensaje
      activo
      createdAt
      updatedAt
    }
  }
`;

export const CREAR_AVISO = gql`
  mutation CrearAviso($input: CreateAvisoInput!) {
    crearAviso(input: $input) {
      id
      titulo
      mensaje
      activo
      createdAt
    }
  }
`;

export const ACTUALIZAR_AVISO = gql`
  mutation ActualizarAviso($input: UpdateAvisoInput!) {
    actualizarAviso(input: $input) {
      id
      titulo
      mensaje
      activo
      updatedAt
    }
  }
`;

export const ELIMINAR_AVISO = gql`
  mutation EliminarAviso($id: ID!) {
    eliminarAviso(id: $id)
  }
`;
