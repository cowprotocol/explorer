import React, { useEffect } from 'react'
import styled from 'styled-components'
import { media } from 'theme/styles/media'

import { Order } from 'api/operator'

import { capitalize } from 'utils'

import { HelpTooltip } from 'components/Tooltip'
import { Notification } from 'components/Notification'

import { SimpleTable } from 'components/common/SimpleTable'
import Spinner from 'components/common/Spinner'

import { AmountsDisplay } from 'components/orders/AmountsDisplay'
import { DateDisplay } from 'components/common/DateDisplay'
import { OrderPriceDisplay } from 'components/orders/OrderPriceDisplay'
import { FilledProgress } from 'components/orders/FilledProgress'
import { OrderSurplusDisplay } from 'components/orders/OrderSurplusDisplay'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { StatusLabel } from 'components/orders/StatusLabel'
import { GasFeeDisplay } from 'components/orders/GasFeeDisplay'
import { triggerEvent } from 'api/analytics'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faProjectDiagram } from '@fortawesome/free-solid-svg-icons'
import { getCidHashFromAppData, getDecodedAppData } from 'hooks/useAppData'
import useSafeState from 'hooks/useSafeState'
import { useNetworkId } from 'state/network'
import { AppDataDoc } from '@cowprotocol/cow-sdk'
import { DEFAULT_IPFS_READ_URI, IPFS_INVALID_APP_IDS } from 'const'

const Table = styled(SimpleTable)`
  border: 0.1rem solid ${({ theme }): string => theme.borderPrimary};
  border-radius: 0.4rem;

  > tbody > tr {
    grid-template-columns: 27rem auto;
    padding: 1.4rem 0 1.4rem 1.1rem;

    ${media.mediumDown} {
      grid-template-columns: 17rem auto;
      padding: 1.4rem 0;
    }

    > td {
      justify-content: flex-start;

      &:first-of-type {
        text-transform: capitalize;
        ${media.mediumUp} {
          font-weight: ${({ theme }): string => theme.fontLighter};
        }

        /* Question mark */
        > svg {
          margin: 0 1rem 0 0;
        }

        /* Column after text on first column */
        ::after {
          content: ':';
        }
      }

      &:last-of-type {
        color: ${({ theme }): string => theme.textPrimary1};
      }

      a.showMoreAnchor {
        font-size: 1.2rem;
        margin-top: 0.5rem;
      }
    }
  }
`

const tooltip = {
  orderID: 'A unique identifier ID for this order.',
  from: 'The account address which signed the order.',
  to: 'The account address which will/did receive the bought amount.',
  hash: 'The onchain settlement transaction for this order. Can be viewed on Etherscan.',
  appData:
    'The app data hash for this order. It can denote encoded metadata with info on the app, environment and more, although not all interfaces follow the same pattern. Show more will try to decode that information.',
  status: 'The order status is either Open, Filled, Expired or Canceled.',
  submission:
    'The date and time at which the order was submitted. The timezone is based on the browser locale settings.',
  expiration:
    'The date and time at which an order will expire and effectively be cancelled. Depending on the type of order, it may have partial fills upon expiration.',
  type: 'An order can be either a Buy or Sell order. In addition, an order may be of type "Fill or Kill" (no partial fills) or a regular order (partial fills allowed).',
  amount: 'The total sell and buy amount for this order.',
  priceLimit:
    'The limit price is the price at which this order shall be (partially) filled, in combination with the specified slippage.',
  priceExecution: 'The actual price at which this order has been matched and executed.',
  surplus:
    'The (averaged) surplus for this order. This is the positive difference between the initial limit price and the actual (average) execution price.',
  filled: 'Indicates what percentage amount this order has been filled and the amount sold/bought.',
  fees: 'The amount of fees paid for this order. This will show a progressive number for orders with partial fills.',
}

export const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  ${media.mobile} {
    flex-direction: column;
  }
`

const AppDataWrapper = styled.div`
  display: flex;
  flex-direction: column;
  .json-formatter {
    word-break: break-all;
    overflow: auto;
    border: 1px solid ${({ theme }): string => theme.tableRowBorder};
    padding: 0.75rem;
    background: ${({ theme }): string => theme.tableRowBorder};
    border-radius: 0.5rem;

    ::-webkit-scrollbar {
      width: 8px !important;
      height: 8px !important;
    }
    ::-webkit-scrollbar-thumb {
      background: hsla(0, 0%, 100%, 0.1);
      border-radius: 4px;
    }
    ::-webkit-scrollbar-track {
      background-color: rgba(0, 0, 0, 0.2);
    }
  }
  .data-container {
    margin-right: 0.75rem;
    word-break: break-all;
    display: flex;
    flex-direction: column;
    .app-data {
      color: ${({ theme }): string => theme.orange1};
    }
  }
  .hidden-content {
    margin-top: 10px;

    span div {
      ${media.mediumUp} {
        width: 95%;
      }
      ${media.mobile} {
        width: 75vw;
      }
      ${media.tinyDown} {
        width: 70vw;
      }
    }
  }
`

const LinkButton = styled(LinkWithPrefixNetwork)`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: ${({ theme }): string => theme.fontBold};
  font-size: 1.3rem;
  color: ${({ theme }): string => theme.orange1};
  border: 1px solid ${({ theme }): string => theme.orange1};
  background-color: ${({ theme }): string => theme.orangeOpacity};
  border-radius: 0.4rem;
  padding: 0.8rem 1.5rem;
  margin: 0 0 0 2rem;
  transition-duration: 0.2s;
  transition-timing-function: ease-in-out;

  ${media.mobile} {
    margin: 1rem 0 0 0;
  }

  ${media.mediumDown} {
    min-width: 18rem;
  }

  :hover {
    opacity: 0.8;
    color: ${({ theme }): string => theme.white};
    text-decoration: none;
  }

  svg {
    margin-right: 0.5rem;
  }
`

export type Props = {
  order: Order
  areTradesLoading: boolean
}

export function DetailsTable(props: Props): JSX.Element | null {
  const { order, areTradesLoading } = props
  const {
    uid,
    shortId,
    owner,
    receiver,
    txHash,
    kind,
    partiallyFillable,
    creationDate,
    expirationDate,
    buyAmount,
    sellAmount,
    executedBuyAmount,
    executedSellAmount,
    status,
    partiallyFilled,
    filledAmount,
    surplusAmount,
    buyToken,
    sellToken,
    appData,
  } = order
  const [appDataLoading, setAppDataLoading] = useSafeState(false)
  const [appDataError, setAppDataError] = useSafeState(false)
  const [decodedAppData, setDecodedAppData] = useSafeState<AppDataDoc | void | undefined>(undefined)
  const [ipfsUri, setIpfsUri] = useSafeState<string>('')

  const [showDecodedAppData, setShowDecodedAppData] = useSafeState<boolean>(false)
  const network = useNetworkId()

  useEffect(() => {
    const fetchIPFS = async (): Promise<void> => {
      try {
        const decodedAppDataHex = await getCidHashFromAppData(appData.toString(), network || undefined)
        setIpfsUri(`${DEFAULT_IPFS_READ_URI}/${decodedAppDataHex}`)
      } catch {
        setAppDataError(true)
      }
    }

    fetchIPFS()
  }, [appData, network, setAppDataError, setIpfsUri])

  if (!buyToken || !sellToken) {
    return null
  }

  const handleDecodedAppData = async (): Promise<void> => {
    setShowDecodedAppData(!showDecodedAppData)
    if (decodedAppData) return
    if (IPFS_INVALID_APP_IDS.includes(appData.toString())) {
      setAppDataError(true)
      return
    }
    setAppDataLoading(true)
    try {
      const decodedAppData = await getDecodedAppData(appData.toString(), network || undefined)
      setDecodedAppData(decodedAppData)
    } catch (e) {
      setDecodedAppData(undefined)
      setAppDataError(true)
    } finally {
      setAppDataLoading(false)
    }
  }

  const renderAppData = (): JSX.Element | null => {
    if (appDataLoading) return <Spinner />
    if (showDecodedAppData) {
      if (appDataError)
        return (
          <Notification
            type="error"
            message="Error when getting metadata info."
            closable={false}
            appendMessage={false}
          />
        )
      return (
        <RowWithCopyButton
          textToCopy={JSON.stringify(decodedAppData, null, 2)}
          onCopy={(): void => onCopy('appDataDecoded')}
          contentsToDisplay={<pre className="json-formatter">{JSON.stringify(decodedAppData, null, 2)}</pre>}
        />
      )
    }
    return null
  }

  const onCopy = (label: string): void =>
    triggerEvent({
      category: 'Order details',
      action: 'Copy',
      label,
    })

  return (
    <Table
      body={
        <>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.orderID} /> Order Id
            </td>
            <td>
              <RowWithCopyButton textToCopy={uid} contentsToDisplay={shortId} onCopy={(): void => onCopy('orderId')} />
            </td>
          </tr>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.from} /> From
            </td>
            <td>
              <RowWithCopyButton
                textToCopy={owner}
                onCopy={(): void => onCopy('ownerAddress')}
                contentsToDisplay={<LinkWithPrefixNetwork to={`/address/${owner}`}>{owner}</LinkWithPrefixNetwork>}
              />
            </td>
          </tr>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.to} /> To
            </td>
            <td>
              <RowWithCopyButton
                textToCopy={receiver}
                onCopy={(): void => onCopy('receiverAddress')}
                contentsToDisplay={
                  <LinkWithPrefixNetwork to={`/address/${receiver}`}>{receiver}</LinkWithPrefixNetwork>
                }
              />
            </td>
          </tr>
          {!partiallyFillable && (
            <tr>
              <td>
                <HelpTooltip tooltip={tooltip.hash} /> Transaction hash
              </td>
              <td>
                {areTradesLoading ? (
                  <Spinner />
                ) : txHash ? (
                  <Wrapper>
                    <RowWithCopyButton
                      textToCopy={txHash}
                      onCopy={(): void => onCopy('settlementTx')}
                      contentsToDisplay={<LinkWithPrefixNetwork to={`/tx/${txHash}`}>{txHash}</LinkWithPrefixNetwork>}
                    />
                    <LinkButton to={`/tx/${txHash}/?tab=graph`}>
                      <FontAwesomeIcon icon={faProjectDiagram} />
                      View batch graph
                    </LinkButton>
                  </Wrapper>
                ) : (
                  '-'
                )}
              </td>
            </tr>
          )}
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.status} /> Status
            </td>
            <td>
              <StatusLabel status={status} partiallyFilled={partiallyFilled} />
            </td>
          </tr>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.submission} /> Submission Time
            </td>
            <td>
              <DateDisplay date={creationDate} showIcon={true} />
            </td>
          </tr>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.expiration} /> Expiration Time
            </td>
            <td>
              <DateDisplay date={expirationDate} showIcon={true} />
            </td>
          </tr>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.type} /> Type
            </td>
            <td>
              {capitalize(kind)} order {!partiallyFillable && '(Fill or Kill)'}
            </td>
          </tr>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.amount} />
              Amount
            </td>
            <td>
              <AmountsDisplay order={order} />
            </td>
          </tr>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.priceLimit} /> Limit Price
            </td>
            <td>
              <OrderPriceDisplay
                buyAmount={buyAmount}
                buyToken={buyToken}
                sellAmount={sellAmount}
                sellToken={sellToken}
                showInvertButton
              />
            </td>
          </tr>
          {/*TODO: uncomment when fills tab is implemented */}
          {/*{!partiallyFillable && (*/}
          <>
            <tr>
              <td>
                <HelpTooltip tooltip={tooltip.priceExecution} /> Execution price
              </td>
              <td>
                {!filledAmount.isZero() ? (
                  <OrderPriceDisplay
                    buyAmount={executedBuyAmount}
                    buyToken={buyToken}
                    sellAmount={executedSellAmount}
                    sellToken={sellToken}
                    showInvertButton
                  />
                ) : (
                  '-'
                )}
              </td>
            </tr>
            <tr>
              <td>
                <HelpTooltip tooltip={tooltip.filled} /> Filled
              </td>
              <td>
                <FilledProgress order={order} />
              </td>
            </tr>
            <tr>
              <td>
                <HelpTooltip tooltip={tooltip.surplus} /> Order surplus
              </td>
              <td>{!surplusAmount.isZero() ? <OrderSurplusDisplay order={order} /> : '-'}</td>
            </tr>
          </>
          {/*TODO: uncomment when fills tab is implemented */}
          {/*)}*/}
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.fees} /> Fees
            </td>
            <td>
              <GasFeeDisplay order={order} />
            </td>
          </tr>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.appData} /> AppData
            </td>
            <td>
              <AppDataWrapper>
                <div className="data-container">
                  {appDataError ? (
                    <span className="app-data">{appData}</span>
                  ) : (
                    <RowWithCopyButton
                      textToCopy={ipfsUri}
                      onCopy={(): void => onCopy('IpfsAppDataUri')}
                      contentsToDisplay={
                        <a href={ipfsUri} target="_blank" rel="noopener noreferrer">
                          {appData}
                        </a>
                      }
                    />
                  )}
                  <a className="showMoreAnchor" onClick={handleDecodedAppData}>
                    {showDecodedAppData ? '[-] Show less' : '[+] Show more'}
                  </a>
                </div>
                <div className="hidden-content">{renderAppData()}</div>
              </AppDataWrapper>
            </td>
          </tr>
        </>
      }
    />
  )
}
