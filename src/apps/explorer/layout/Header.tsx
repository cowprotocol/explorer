import React from 'react'

import { Navigation } from 'components/layout/GenericLayout/Navigation'
import { Header as GenericHeader } from 'components/layout/GenericLayout/Header'
import { getNetworkFromId } from '@gnosis.pm/dex-js'
import { useNetworkId } from 'state/network-in-url'
import styled from 'styled-components'

const Logo = styled.span`
  display: block;
  margin: 0 0.5rem;
  font-size: 2rem;
`

const NetworkLabel = styled.span`
  display: block;
  margin: 0 0.5rem;
  font-size: 1.1rem;
  text-align: center;
  padding: 0.3rem 0.8rem;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.1rem;

  &.rinkeby {
    background-color: #f6c343;
    color: #6d3e00;
  }

  &.xdai {
    background-color: #48a9a6;
    color: #153a39;
  }
`

export const Header: React.FC = () => {
  const networkId = useNetworkId()
  if (!networkId) {
    return null
  }

  const network = networkId !== 1 ? getNetworkFromId(networkId) : null

  return (
    <GenericHeader>
      <Navigation>
        <Logo>GP Explorer</Logo>
        {network && <NetworkLabel className={network.toLowerCase()}>{network}</NetworkLabel>}
        {/*      
        <li>
          <Link to="/">Batches</Link>
        </li>
        <li>
          <Link to="/trades">Trades</Link>
        </li>
        <li>
          <Link to="/markets">Markets</Link>
        </li>
        */}
      </Navigation>
    </GenericHeader>
  )
}
