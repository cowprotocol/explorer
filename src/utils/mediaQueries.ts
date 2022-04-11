import { Command } from 'types'

export enum TypeMediaQueries {
  XL = 'xl',
  LG = 'lg',
  MD = 'md',
  SM = 'sm',
  XS = 'xs',
}

export const MediumDownQueries = [TypeMediaQueries.MD, TypeMediaQueries.SM, TypeMediaQueries.XS]

export const MEDIA_QUERY_MATCHES = [
  // must be in descending order for .find to match from largest to smallest
  // as sm will also match for xl and lg, for example
  {
    name: TypeMediaQueries.XL,
    query: '(min-width:1200px)',
  },
  {
    name: TypeMediaQueries.LG,
    query: '(min-width:992px)',
  },
  {
    name: TypeMediaQueries.MD,
    query: '(min-width:768px)',
  },
  {
    name: TypeMediaQueries.SM,
    query: '(min-width:576px)',
  },
  // anything smaller -- xs
]

const DEFAULT_QUERY_NAME = TypeMediaQueries.XS

export const getMatchingScreenSize = (): TypeMediaQueries =>
  MEDIA_QUERY_MATCHES.find(({ query }) => window.matchMedia(query).matches)?.name || DEFAULT_QUERY_NAME

export const MEDIA_QUERIES = MEDIA_QUERY_MATCHES.map(({ query }) => query)
export const MEDIA_QUERY_NAMES = MEDIA_QUERY_MATCHES.map(({ name }) => name).concat(DEFAULT_QUERY_NAME)

export const subscribeToScreenSizeChange = (callback: (event: MediaQueryListEvent) => void): Command => {
  const mediaQueryLists = MEDIA_QUERIES.map((query) => window.matchMedia(query))

  mediaQueryLists.forEach((mql) => mql.addListener(callback))

  return (): void => mediaQueryLists.forEach((mql) => mql.removeListener(callback))
}
