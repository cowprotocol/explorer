import React from 'react'

import { Navigation } from 'components/layout/GenericLayout/Navigation'
import { Header as GenericHeader } from 'components/layout/GenericLayout/Header'
import { NetworkSelector } from 'components/NetworkSelector'
import { PREFIX_BY_NETWORK_ID, useNetworkId } from 'state/network'
import styled from 'styled-components'

const Logo = styled.span`
  display: flex;
  align-items: center;
  margin: 0 0.5rem 0 0;
  font-size: 1.8rem;
  line-height: 1;
  font-weight: ${({ theme }): string => theme.fontBlack};
  white-space: nowrap;
  position: relative;

  &::after {
    content: 'EXPLORER';
    font-size: 0.9rem;
    letter-spacing: 0.36rem;
    opacity: 0.5;
    display: block;
    position: absolute;
    bottom: -0.9rem;
    right: 0;
    font-weight: 500;
  }
`

export const Header: React.FC = () => {
  const networkId = useNetworkId()
  if (!networkId) {
    return null
  }

  const prefixNetwork = PREFIX_BY_NETWORK_ID.get(networkId)

  return (
    <GenericHeader logoAlt="Gnosis Protocol" linkTo={`/${prefixNetwork || ''}`} label={<Logo>Gnosis Protocol</Logo>}>
      <Navigation>
        <NetworkSelector networkId={networkId} />
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
