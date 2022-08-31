import React, { useState, createRef } from 'react'

import { Header as GenericHeader } from 'components/layout/GenericLayout/Header'
import { itemContent } from 'components/common/MenuDropdown/mainMenu'
import { NetworkSelector } from 'components/NetworkSelector'
import { PREFIX_BY_NETWORK_ID, useNetworkId } from 'state/network'
import { FlexWrap } from 'apps/explorer/pages/styled'
// import { ExternalLink } from 'components/analytics/ExternalLink'
// import { useHistory } from 'react-router'
import useOnClickOutside from 'hooks/useOnClickOutside'
// import { APP_NAME } from 'const'
import MenuDropdown from 'components/common/MenuDropdown'

export const Header: React.FC = () => {
  //const history = useHistory()
  const [isBarActive, setBarActive] = useState(false)
  const flexWrapDivRef = createRef<HTMLDivElement>()

  useOnClickOutside(flexWrapDivRef, () => isBarActive && setBarActive(false))

  const networkId = useNetworkId()
  if (!networkId) {
    return null
  }

  const prefixNetwork = PREFIX_BY_NETWORK_ID.get(networkId)

  return (
    <GenericHeader logoAlt="CoW Protocol Explorer" linkTo={`/${prefixNetwork || ''}`}>
      <NetworkSelector networkId={networkId} />
      <FlexWrap ref={flexWrapDivRef} grow={1}>
        <MenuDropdown itemContent={itemContent} />
      </FlexWrap>
    </GenericHeader>
  )
}
