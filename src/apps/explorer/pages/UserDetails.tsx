import React from 'react'
import { useParams } from 'react-router'

import OrdersTableWidget from '../components/OrdersTableWidget'
import { useNetworkId } from 'state/network'
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import RedirectToSearch from 'components/RedirectToSearch'
import { TitleAddress, Wrapper } from 'apps/explorer/pages/styled'
import { useResolveEns } from 'hooks/useResolveEns'
import Spinner from 'components/common/Spinner'

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
