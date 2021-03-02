import { useEffect } from 'react'
import { viewPage } from 'api/analytics'
import { RouteComponentProps } from 'react-router-dom'

export default function RouteAnalytics({ location: { pathname, search } }: RouteComponentProps): null {
  useEffect(() => {
    viewPage(`${pathname}${search}`)
  }, [pathname, search])
  return null
}
