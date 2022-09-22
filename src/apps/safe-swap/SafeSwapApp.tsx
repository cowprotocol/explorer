import React from 'react'
import SafeProvider from '@gnosis.pm/safe-apps-react-sdk'
import { BrowserRouter, HashRouter, Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'
import { hot } from 'react-hot-loader/root'
import { withGlobalContext } from 'hooks/useGlobalState'

import useNetworkCheck from 'hooks/useNetworkCheck'
import Console from 'Console'
import { rootReducer, INITIAL_STATE } from './state'

import { GenericLayout } from 'components/layout'
import { Header } from './layout/Header'

import { NetworkUpdater, RedirectMainnet } from 'state/network'

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

/** App content */
const AppContent = (): JSX.Element => {
  const { path } = useRouteMatch()

  const pathPrefix = path == '/' ? '' : path

  return (
    <GenericLayout header={<Header />}>
      <React.Suspense fallback={null}>
        <Switch>
          <Route path={pathPrefix + '/'} exact component={Home} />
          <Route component={NotFound} />
        </Switch>
      </React.Suspense>
    </GenericLayout>
  )
}

/**
 * Render Safe-Swap App
 */
export const SafeSwapApp: React.FC = () => {
  // Deal with incorrect network
  useNetworkCheck()

  return (
    // <SafeProvider loader={<>Waiting for Safe...</>}>
    <SafeProvider>
      <Router basename={process.env.BASE_URL}>
        <StateUpdaters />
        <Switch>
          <Redirect from="/safe.html" exact to="/" push={false} />
          <Route path="/mainnet" component={RedirectMainnet} />
          <Route path={['/xdai', '/rinkeby', '/']} component={AppContent} />
        </Switch>
      </Router>
      {process.env.NODE_ENV === 'development' && <Console />}
    </SafeProvider>
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
