import React, { useEffect, useRef, useState } from 'react'

import { MenuBarToggle, Navigation } from 'components/layout/GenericLayout/Navigation'
import { Header as GenericHeader } from 'components/layout/GenericLayout/Header'
import { NetworkSelector } from 'components/NetworkSelector'
import { PREFIX_BY_NETWORK_ID, useNetworkId } from 'state/network'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisH, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FlexWrap } from 'apps/explorer/pages/styled'
import { ExternalLink } from 'components/analytics/ExternalLink'
import { useHistory } from 'react-router'

export const Header: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null)
  const history = useHistory()
  const [isBarActive, setBarActive] = useState(false)

  useEffect(() => {
    const isClickedOutside = (e: any): void => {
      isBarActive && ref.current && !ref.current.contains(e.target) && setBarActive(false)
    }
    document.addEventListener('mousedown', isClickedOutside)
    return (): void => {
      document.removeEventListener('mousedown', isClickedOutside)
    }
  }, [isBarActive])
  const networkId = useNetworkId()
  if (!networkId) {
    return null
  }

  const prefixNetwork = PREFIX_BY_NETWORK_ID.get(networkId)

  const handleNavigate = (e: any): void => {
    e.preventDefault()
    setBarActive(false)
    history.push('/')
  }

  return (
    <GenericHeader logoAlt="CoW Protocol Explorer" linkTo={`/${prefixNetwork || ''}`}>
      <NetworkSelector networkId={networkId} />
      <FlexWrap ref={ref} grow={1}>
        <MenuBarToggle isActive={isBarActive} onClick={(): void => setBarActive(!isBarActive)}>
          <FontAwesomeIcon icon={isBarActive ? faTimes : faEllipsisH} />
        </MenuBarToggle>
        <Navigation isActive={isBarActive}>
          <li>
            <a onClick={(e): void => handleNavigate(e)}>Home</a>
          </li>
          <li>
            <ExternalLink target={'_blank'} href={'https://cow.fi'}>
              CoW Protocol
            </ExternalLink>
          </li>
          <li>
            <ExternalLink target={'_blank'} href={'https://docs.cow.fi'}>
              Documentation
            </ExternalLink>
          </li>
          <li>
            <ExternalLink target={'_blank'} href={'https://chat.cowswap.exchange'}>
              Community
            </ExternalLink>
          </li>
        </Navigation>
      </FlexWrap>
    </GenericHeader>
  )
}
