/* eslint-disable no-underscore-dangle */
import {
  InMemoryCache, NormalizedCacheObject,
  ApolloClient, HttpLink,
} from '@apollo/client';
import config from 'config';
import { IncomingMessage, ServerResponse } from 'http';
import { useMemo } from 'react';
import { getGraphqlHeaders } from 'service/api-method';

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

export type ResolverContext = {
  req?: IncomingMessage
  res?: ServerResponse
}

const createIsomorphLink = () => new HttpLink({
  uri: config.GRAPHQL_ENDPOINT,
  credentials: 'same-origin',
  headers: getGraphqlHeaders(true),
});

const createApolloClient = (context?: ResolverContext) => new ApolloClient({
  ssrMode: typeof window === 'undefined',
  link: createIsomorphLink(),
  cache: new InMemoryCache({ resultCaching: false }),
});

export const initializeApollo = (
  initialState: any = null,
  // Pages with Next.js data fetching methods, like `getStaticProps`, can send
  // a custom context which will be used by `SchemaLink` to server render pages
  context?: ResolverContext,
): any => {
  const _apolloClient = apolloClient ?? createApolloClient(context);

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // get hydrated here
  if (initialState) {
    _apolloClient.cache.restore(initialState);
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
};

export const useApollo = (initialState: unknown): any => {
  const store = useMemo(() => initializeApollo(initialState), [initialState]);
  return store;
};
