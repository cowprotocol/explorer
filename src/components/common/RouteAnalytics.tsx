import { useEffect } from 'react'
import { pageview } from 'api/analytics'
import { RouteComponentProps } from 'react-router-dom'

export default function RouteAnalytics({ location: { pathname, search } }: RouteComponentProps): null {
  useEffect(() => {
    pageview(`${pathname}${search}`)
  }, [pathname, search])
  return null
}
