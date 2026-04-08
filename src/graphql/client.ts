import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URI || 'http://localhost:3000/graphql',
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          tablaPosiciones: {
            merge(existing, incoming) {
              return incoming;
            },
          },
          tablaGoleadores: {
            merge(existing, incoming) {
              return incoming;
            },
          },
          // Siempre reemplazar la lista completa (no merge/append)
          resultadosPorPartido: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    },
  },
});
