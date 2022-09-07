import React, { useState, createRef, useCallback, useEffect } from 'react'

import { Header as GenericHeader } from 'components/layout/GenericLayout/Header'
import { NetworkSelector } from 'components/NetworkSelector'
import { PREFIX_BY_NETWORK_ID, useNetworkId } from 'state/network'
import { FlexWrap } from 'apps/explorer/pages/styled'
// import { ExternalLink } from 'components/analytics/ExternalLink'
// import { useHistory } from 'react-router'
import useOnClickOutside from 'hooks/useOnClickOutside'
import { useMediaBreakpoint } from 'hooks/useMediaBreakPoint'
// import { APP_NAME } from 'const'
import { MenuTree } from 'components/common/MenuDropdown/MenuTree'
import MobileMenuIcon from 'components/common/MenuDropdown/MobileMenuIcon'
import { addBodyClass, removeBodyClass } from 'utils/toggleBodyClass'

export const Header: React.FC = () => {
  //const history = useHistory()
  const isUpToLarge = useMediaBreakpoint(['xs', 'sm'])
  const [isBarMenuOpen, setIsBarMenuOpen] = useState(false)
  const flexWrapDivRef = createRef<HTMLDivElement>()

  useOnClickOutside(flexWrapDivRef, () => isBarMenuOpen && setIsBarMenuOpen(false))

  // Toggle the 'noScroll' class on body, whenever the mobile menu or orders panel is open.
  // This removes the inner scrollbar on the page body, to prevent showing double scrollbars.
  useEffect(() => {
    isBarMenuOpen ? addBodyClass('noScroll') : removeBodyClass('noScroll')
  }, [isBarMenuOpen, isUpToLarge])

  const handleBarMenuOnClick = useCallback(() => {
    isUpToLarge && setIsBarMenuOpen(!isBarMenuOpen)
  }, [isUpToLarge, isBarMenuOpen])

  const networkId = useNetworkId()
  if (!networkId) {
    return null
  }

  const prefixNetwork = PREFIX_BY_NETWORK_ID.get(networkId)

  return (
    <GenericHeader logoAlt="CoW Protocol Explorer" linkTo={`/${prefixNetwork || ''}`}>
      <NetworkSelector networkId={networkId} />
      <FlexWrap ref={flexWrapDivRef} grow={1}>
        {/* < menuContent={MAIN_MENU} /> */}
        <MenuTree isMobileMenuOpen={isBarMenuOpen} handleMobileMenuOnClick={handleBarMenuOnClick} />
      </FlexWrap>
      {isUpToLarge && <MobileMenuIcon isMobileMenuOpen={isBarMenuOpen} onClick={handleBarMenuOnClick} />}
    </GenericHeader>
  )
}
