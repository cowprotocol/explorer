import React from 'react'
import { useParams } from 'react-router'
import styled from 'styled-components'

import { media } from 'theme/styles/media'
import OrdersTableWidget from '../components/OrdersTableWidget'
import { useNetworkId } from 'state/network'
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import RedirectToSearch from 'components/RedirectToSearch'
import { useResolveEns } from 'hooks/useResolveEns'
import Spinner from 'components/common/Spinner'

const Wrapper = styled.div`
  padding: 1.6rem;
  margin: 0 auto;
  width: 100%;

  ${media.mediumDown} {
    max-width: 94rem;
  }

  ${media.mobile} {
    max-width: 100%;
  }
  > h1 {
    display: flex;
    padding: 2.4rem 0 2.35rem;
    align-items: center;
    font-weight: ${({ theme }): string => theme.fontBold};
  }
`
const TitleAddress = styled(RowWithCopyButton)`
  font-size: ${({ theme }): string => theme.fontSizeDefault};
  font-weight: ${({ theme }): string => theme.fontNormal};
  margin: 0 0 0 1.5rem;
  display: flex;
  align-items: center;
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
