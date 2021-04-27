import React from 'react'

import { Navigation } from 'components/layout/GenericLayout/Navigation'
import { Header as GenericHeader } from 'components/layout/GenericLayout/Header'
import { getNetworkFromId } from '@gnosis.pm/dex-js'
import { useNetworkId } from 'state/network'
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

const NetworkLabel = styled.span`
  border-radius: 0.6rem;
  display: flex;
  margin: 0 0.5rem;
  font-size: 1.1rem;
  text-align: center;
  padding: 0.7rem;
  text-transform: uppercase;
  font-weight: ${({ theme }): string => theme.fontBold};
  letter-spacing: 0.1rem;

  &.rinkeby {
    background: ${({ theme }): string => theme.borderPrimary};
    color: ${({ theme }): string => theme.textSecondary1};
  }

  &.xdai {
    background: ${({ theme }): string => theme.orangeOpacity};
    color: ${({ theme }): string => theme.orange};
  }
`

export const Header: React.FC = () => {
  const networkId = useNetworkId()
  if (!networkId) {
    return null
  }

  const network = networkId !== 1 ? getNetworkFromId(networkId).toLowerCase() : null

  return (
    <GenericHeader logoAlt="Gnosis Protocol" linkTo={`/${network || ''}`} label={<Logo>Gnosis Protocol</Logo>}>
      <Navigation>
        {network && <NetworkLabel className={network}>{network}</NetworkLabel>}
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
