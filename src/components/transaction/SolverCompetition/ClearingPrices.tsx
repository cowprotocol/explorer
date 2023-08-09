import React, { useState } from 'react'
import { AuctionPrices, BigUint } from '@cowprotocol/cow-sdk'
import { useMultipleErc20 } from 'hooks/useErc20'
import { useNetworkId } from 'state/network'
import CowLoading from 'components/common/CowLoading'
import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import { PricesCard } from 'components/transaction/SolverCompetition/styled'
import { calculatePrice, formatSmart, safeTokenName, TokenErc20 } from '@gnosis.pm/dex-js'
import { Network } from 'types'
import TokenImg from 'components/common/TokenImg'
import { HIGH_PRECISION_SMALL_LIMIT, MIDDLE_PRECISION_DECIMALS } from 'apps/explorer/const'
import { getImageAddress } from 'utils'
import { invertPrice } from '@gnosis.pm/dex-js/build-esm/utils/price'
import BigNumber from 'bignumber.js'
import Icon from 'components/Icon'
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons'

type Props = {
  prices: AuctionPrices
}

type ItemProps = {
  amount: BigUint
  erc20: TokenErc20
  network: Network
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const Item: React.FC<ItemProps> = (props) => {
  const { amount, erc20, network } = props
  const calculatedPrice = calculatePrice({
    denominator: { amount: '1', decimals: 1 },
    numerator: { amount, decimals: erc20.decimals },
  })
  const [invertedPrice, setInvertedPrice] = useState<boolean>(BigNumber.max(calculatedPrice, '1') == calculatedPrice)

  const formattedPrice = formatSmart({
    amount: (invertedPrice ? invertPrice(calculatedPrice) : calculatedPrice).toString(10),
    precision: MIDDLE_PRECISION_DECIMALS,
    smallLimit: HIGH_PRECISION_SMALL_LIMIT,
    decimals: MIDDLE_PRECISION_DECIMALS,
    isLocaleAware: false,
  })
  const imageAddress = getImageAddress(erc20.address, network)
  const symbol = safeTokenName(erc20)
  const tokenNames = invertedPrice ? [symbol, 'ETH'] : ['ETH', symbol]

  return (
    <span>
      <TokenImg address={imageAddress} />
      {`1 ${tokenNames[0]}`} = {`${formattedPrice} ${tokenNames[1]}`}
      {<Icon icon={faExchangeAlt} onClick={(): void => setInvertedPrice(!invertedPrice)} />}
    </span>
  )
}

const ClearingPrices: React.FC<Props> = (props) => {
  const { prices } = props
  const networkId = useNetworkId() ?? undefined
  const { isLoading, error, value: tokens } = useMultipleErc20({ addresses: Object.keys(prices), networkId })

  if (isLoading) {
    return <CowLoading />
  }
  if ((error && Object.keys(error).length) || !tokens || !networkId) {
    return <EmptyItemWrapper>{JSON.stringify(error) ?? 'Can&apos;t load details'}</EmptyItemWrapper>
  }

  return (
    <PricesCard>
      {Object.values(tokens)
        .filter((token) => token)
        .map((token) => (
          <>{token && <Item erc20={token} network={networkId} amount={prices[token.address]} />}</>
        ))}
    </PricesCard>
  )
}
export default ClearingPrices
