import React from 'react'
import { BrowserRouter, HashRouter, Redirect, Route, Switch, useLocation, useRouteMatch } from 'react-router-dom'
import { hot } from 'react-hot-loader/root'

import { withGlobalContext } from 'hooks/useGlobalState'
import useNetworkCheck from 'hooks/useNetworkCheck'
import Console from 'Console'
import { rootReducer, INITIAL_STATE } from './state'

import { GenericLayout } from 'components/layout'
import { Header } from './layout/Header'

import { NetworkUpdater } from 'state/network'
import { initAnalytics } from 'api/analytics'
import RouteAnalytics from 'components/analytics/RouteAnalytics'
import NetworkAnalytics from 'components/analytics/NetworkAnalytics'
import { DIMENSION_NAMES } from './const'

// Init analytics
const GOOGLE_ANALYTICS_ID: string | undefined = process.env.GOOGLE_ANALYTICS_ID
initAnalytics({
  trackingCode: GOOGLE_ANALYTICS_ID,
  dimensionNames: DIMENSION_NAMES,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Router: typeof BrowserRouter & typeof HashRouter = (window as any).IS_IPFS ? HashRouter : BrowserRouter

const NotFound = React.lazy(
  () =>
    import(
      /* webpackChunkName: "Extra_routes_chunk"*/
      './pages/NotFound'
    ),
)

const Home = React.lazy(
  () =>
    import(
      /* webpackChunkName: "Trade_chunk"*/
      './pages/Swap'
    ),
)

/**
 * Update the global state
 */
function StateUpdaters(): JSX.Element {
  return <NetworkUpdater />
}

const Analytics = (): JSX.Element => (
  <>
    <Route component={RouteAnalytics} />
    <Route component={NetworkAnalytics} />
  </>
)

/** App content */
const AppContent = (): JSX.Element => {
  const { path } = useRouteMatch()

  const pathPrefix = path == '/' ? '' : path

  return (
    <GenericLayout header={<Header />}>
      <React.Suspense fallback={null}>
        <Analytics />

        <Switch>
          <Route path={pathPrefix + '/'} exact component={Home} />
          <Route component={NotFound} />
        </Switch>
      </React.Suspense>
    </GenericLayout>
  )
}

/** Redirects to the canonnical URL for mainnet */
const RedirectMainnet = (): JSX.Element => {
  const { pathname } = useLocation()

  const pathMatchArray = pathname.match('/mainnet(.*)')
  const newPath = pathMatchArray && pathMatchArray.length > 0 ? pathMatchArray[1] : '/'

  return <Redirect push={false} to={newPath} />
}

/**
 * Render Safe-Swap App
 */
export const SafeSwapApp: React.FC = () => {
  // Deal with incorrect network
  useNetworkCheck()

  return (
    <>
      <Router basename={process.env.BASE_URL}>
        <StateUpdaters />
        <Switch>
          <Route path="/mainnet" component={RedirectMainnet} />
          <Route path={['/xdai', '/rinkeby', '/']} component={AppContent} />
        </Switch>
      </Router>
      {process.env.NODE_ENV === 'development' && <Console />}
    </>
  )
}

export default hot(
  withGlobalContext(
    SafeSwapApp,
    // Initial State
    INITIAL_STATE,
    rootReducer,
  ),
)
