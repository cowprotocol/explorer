import React, { useState, useCallback, useEffect } from 'react'

import { Header as GenericHeader } from 'components/layout/GenericLayout/Header'
import { NetworkSelector } from 'components/NetworkSelector'
import { PREFIX_BY_NETWORK_ID, useNetworkId } from 'state/network'
import { FlexWrap } from 'apps/explorer/pages/styled'
import { useMediaBreakpoint } from 'hooks/useMediaBreakPoint'
import { MenuTree } from 'components/common/MenuDropdown/MenuTree'
import MobileMenuIcon from 'components/common/MenuDropdown/MobileMenuIcon'
import { addBodyClass, removeBodyClass } from 'utils/toggleBodyClass'

export const Header: React.FC = () => {
  const isMobile = useMediaBreakpoint(['xs', 'sm'])
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Toggle the 'noScroll' class on body, whenever the mobile menu or orders panel is open.
  // This removes the inner scrollbar on the page body, to prevent showing double scrollbars.
  useEffect(() => {
    isMobileMenuOpen ? addBodyClass('noScroll') : removeBodyClass('noScroll')
  }, [isMobileMenuOpen, isMobile])

  const handleMobileMenuOnClick = useCallback(() => {
    isMobile && setMobileMenuOpen(!isMobileMenuOpen)
  }, [isMobile, isMobileMenuOpen])

  const networkId = useNetworkId()
  if (!networkId) {
    return null
  }

  const prefixNetwork = PREFIX_BY_NETWORK_ID.get(networkId)

  return (
    <GenericHeader
      logoAlt="CoW Protocol Explorer"
      linkTo={`/${prefixNetwork || ''}`}
      onClickOptional={handleMobileMenuOnClick}
    >
      <NetworkSelector networkId={networkId} />
      <FlexWrap grow={1}>
        <MenuTree isMobileMenuOpen={isMobileMenuOpen} handleMobileMenuOnClick={handleMobileMenuOnClick} />
      </FlexWrap>
      {isMobile && <MobileMenuIcon isMobileMenuOpen={isMobileMenuOpen} onClick={handleMobileMenuOnClick} />}
    </GenericHeader>
  )
}
