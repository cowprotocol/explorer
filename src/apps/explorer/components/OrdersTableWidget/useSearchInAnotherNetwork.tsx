import React, { useCallback, useState, useEffect } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import { Network } from 'types'
import { NETWORK_ID_SEARCH_LIST } from 'apps/explorer/const'
import { BlockchainNetwork } from './context/OrdersTableContext'
import { Order, getAccountOrders } from 'api/operator'
import Spinner from 'components/common/Spinner'

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  height: 100%;

  > p {
    font-weight: 550;
  }

  > section {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    p {
      margin-top: 0;
    }
  }

  ul {
    padding: 0 0.8rem 0 0;
    margin: 0;
    > li {
      list-style: none;
      padding-bottom: 1.5rem;
      :last-child {
        padding-bottom: 0;
      }
    }
  }
`
interface OrdersInNetwork {
  network: string
}

interface ResultSeachInAnotherNetwork {
  isLoading: boolean
  ordersInNetworks: OrdersInNetwork[]
  setLoadingState: (value: boolean) => void
}

type EmptyMessageProps = ResultSeachInAnotherNetwork & {
  networkId: BlockchainNetwork
  ownerAddress: string
}

export const EmptyOrdersMessage = ({
  isLoading,
  networkId,
  ordersInNetworks,
  ownerAddress,
  setLoadingState,
}: EmptyMessageProps): JSX.Element => {
  const areOtherNetworks = ordersInNetworks.length > 0

  if (!networkId || isLoading) {
    return <Spinner size="2x" />
  }

  return (
    <Wrapper>
      {!areOtherNetworks ? (
        <p>No orders found.</p>
      ) : (
        <>
          <p>
            No orders found on <strong>{Network[networkId]}</strong>.
          </p>
          <section>
            {' '}
            <p>However, found orders on:</p>
            {
              <ul>
                {ordersInNetworks.map((e) => (
                  <li key={e.network}>
                    <Link
                      to={`/${e.network.toLowerCase()}/address/${ownerAddress}`}
                      onClick={(): void => setLoadingState(true)}
                    >
                      {e.network}
                    </Link>
                  </li>
                ))}
              </ul>
            }
          </section>
        </>
      )}
    </Wrapper>
  )
}

export const useSearchInAnotherNetwork = (
  networkId: BlockchainNetwork,
  ownerAddress: string,
  orders: Order[] | undefined,
): ResultSeachInAnotherNetwork => {
  const [ordersInNetworks, setOrdersInNetworks] = useState<OrdersInNetwork[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const isOrdersLengthZero = !orders || orders.length === 0

  useEffect(() => {
    setIsLoading(false)
    setOrdersInNetworks([])
  }, [isOrdersLengthZero])

  const fetchAnotherNetworks = useCallback(
    async (_networkId: Network) => {
      const promises = NETWORK_ID_SEARCH_LIST.filter((net) => net !== _networkId).map((network) =>
        getAccountOrders({ networkId: network, owner: ownerAddress, offset: 0, limit: 1 })
          .then((response) => {
            if (!response.length) return

            return { network: Network[network] }
          })
          .catch((e) => {
            console.error(`Failed to fetch order in ${Network[network]}`, e)
          }),
      )

      const networksHaveOrders = (await Promise.allSettled(promises)).filter(
        (e) => e.status === 'fulfilled' && e.value?.network,
      )
      setOrdersInNetworks(networksHaveOrders.map((e: PromiseFulfilledResult<OrdersInNetwork>) => e.value))
    },
    [ownerAddress],
  )

  useEffect(() => {
    if (!networkId || !isOrdersLengthZero) return

    fetchAnotherNetworks(networkId)
  }, [fetchAnotherNetworks, isOrdersLengthZero, networkId])

  return { isLoading, ordersInNetworks, setLoadingState: setIsLoading }
}
