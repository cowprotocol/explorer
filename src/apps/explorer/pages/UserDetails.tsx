import React from 'react'
import { useParams } from 'react-router'
import styled from 'styled-components'

import OrdersTableWidget from '../components/OrdersTableWidget'
import { useNetworkId } from 'state/network'
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import RedirectToSearch from 'components/RedirectToSearch'
import { useResolveEns } from 'hooks/useResolveEns'
import Spinner from 'components/common/Spinner'
import { TitleAddress, Wrapper as WrapperMod } from 'apps/explorer/pages/styled'

const Wrapper = styled(WrapperMod)`
  > h1 {
    padding: 2.4rem 0 0.75rem;
  }
`

const UserDetails: React.FC = () => {
  const { address } = useParams<{ address: string }>()
  const networkId = useNetworkId() || undefined
  const addressAccount = useResolveEns(address)

  if (addressAccount?.address === null) {
    return <RedirectToSearch from="address" />
  }

  return (
    <Wrapper>
      {addressAccount ? (
        <>
          <h1>
            User details
            <TitleAddress
              textToCopy={addressAccount.address}
              contentsToDisplay={
                <BlockExplorerLink
                  showLogo
                  type="address"
                  networkId={networkId}
                  identifier={address}
                  label={addressAccount.ens}
                />
              }
            />
          </h1>
          <OrdersTableWidget ownerAddress={addressAccount.address} networkId={networkId} />
        </>
      ) : (
        <Spinner size="3x" />
      )}
    </Wrapper>
  )
}

export default UserDetails
