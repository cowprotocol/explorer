import React, { useState } from 'react'
import { useNetworkId } from 'state/network'
import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import { PricesCard } from 'components/transaction/SolverCompetition/styled'
import { formatSmart, safeTokenName, TokenErc20 } from '@gnosis.pm/dex-js'
import { Network } from 'types'
import TokenImg from 'components/common/TokenImg'
import { HIGH_PRECISION_SMALL_LIMIT, NO_ADJUSTMENT_NEEDED_PRECISION } from 'apps/explorer/const'
import { getImageAddress } from 'utils'
import { invertPrice } from '@gnosis.pm/dex-js/build-esm/utils/price'
import Icon from 'components/Icon'
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons'
import BigNumber from 'bignumber.js'
import { NATIVE_TOKEN_PER_NETWORK, TEN_BIG_NUMBER } from 'const'
import { Order } from 'api/operator'
import { AuctionPrices } from '@cowprotocol/cow-sdk'

type Props = {
  orders: Order[]
  prices: AuctionPrices
}

type ItemProps = {
  token: TokenErc20
  amount: BigNumber
  network: Network
}
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const Item: React.FC<ItemProps> = (props) => {
  const { token, network, amount } = props

  const [invertedPrice, setInvertedPrice] = useState<boolean>(false)
  console.log(token, amount.toNumber())
  const calculatedPrice = amount.div(TEN_BIG_NUMBER.exponentiatedBy(36 - token.decimals.valueOf()))
  const displayPrice = (invertedPrice ? invertPrice(calculatedPrice) : calculatedPrice).toString(10)
  const formattedPrice = formatSmart({
    amount: displayPrice,
    precision: NO_ADJUSTMENT_NEEDED_PRECISION,
    smallLimit: HIGH_PRECISION_SMALL_LIMIT,
    decimals: 6,
    isLocaleAware: false,
  })

  const tokenImage = getImageAddress(token?.address ?? '', network)
  const tokenSymbol = token && safeTokenName(token)

  const tokenNames = !invertedPrice
    ? [tokenSymbol, NATIVE_TOKEN_PER_NETWORK[network].symbol]
    : [NATIVE_TOKEN_PER_NETWORK[network].symbol, tokenSymbol]
  return (
    <div key={token?.address}>
      <TokenImg address={tokenImage} />
      {`1 ${tokenNames[0]}`} = {formattedPrice} {`${tokenNames[1]}`}
      {<Icon icon={faExchangeAlt} onClick={(): void => setInvertedPrice(!invertedPrice)} />}
    </div>
  )
}

const ClearingPrices: React.FC<Props> = (props) => {
  const { orders, prices } = props
  const networkId = useNetworkId() ?? undefined
  const tokens: { [p: string]: TokenErc20 | null | undefined } = Object.assign(
    {},
    ...orders.map((o): { [p: string]: TokenErc20 | null | undefined } => ({
      [o.buyTokenAddress]: o.buyToken,
      [o.sellTokenAddress]: o.sellToken,
    })),
  )
  console.log(tokens)
  if (!networkId) {
    return <EmptyItemWrapper>{'Can&apos;t load details'}</EmptyItemWrapper>
  }
  return (
    <PricesCard>
      {Object.values(tokens).map((token, key) => {
        return (
          <>{token && <Item key={key} token={token} amount={BigNumber(prices[token.address])} network={networkId} />}</>
        )
      })}
    </PricesCard>
  )
}
export default ClearingPrices
