import React, { useState } from 'react'
import { AuctionPrices, BigUint } from '@cowprotocol/cow-sdk'
import { useNetworkId } from 'state/network'
import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import { PricesCard } from 'components/transaction/SolverCompetition/styled'
import { calculatePrice, formatSmart, safeTokenName, TokenErc20 } from '@gnosis.pm/dex-js'
import { Network } from 'types'
import TokenImg from 'components/common/TokenImg'
import { MIDDLE_PRECISION_DECIMALS } from 'apps/explorer/const'
import { getImageAddress } from 'utils'
import { invertPrice } from '@gnosis.pm/dex-js/build-esm/utils/price'
import Icon from 'components/Icon'
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons'
import { CircularProgress } from '@material-ui/core'
import { useMultipleErc20 } from 'hooks/useErc20'

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
  const [invertedPrice, setInvertedPrice] = useState<boolean>(false)

  const calculatedPrice = calculatePrice({
    denominator: { amount: '1', decimals: 1 },
    numerator: { amount: amount, decimals: erc20.decimals },
  })

  const formattedPrice = formatSmart({
    amount: (invertedPrice ? invertPrice(calculatedPrice) : calculatedPrice).toString(10),
    precision: MIDDLE_PRECISION_DECIMALS,
    smallLimit: '0.00001',
    decimals: MIDDLE_PRECISION_DECIMALS,
    isLocaleAware: false,
  })
  const imageAddress = getImageAddress(erc20.address, network)
  const symbol = safeTokenName(erc20)
  const tokenNames = invertedPrice ? ['ETH', symbol] : [symbol, 'ETH']

  return (
    <div>
      <TokenImg address={imageAddress} />
      {`1 ${tokenNames[0]}`} = {`${formattedPrice} ${tokenNames[1]}`}
      {<Icon icon={faExchangeAlt} onClick={(): void => setInvertedPrice(!invertedPrice)} />}
    </div>
  )
}

const ClearingPrices: React.FC<Props> = (props) => {
  const { prices } = props
  const networkId = useNetworkId() ?? undefined
  const { isLoading, error, value: tokens } = useMultipleErc20({ addresses: Object.keys(prices), networkId })

  if (isLoading && Object.keys(tokens).length == 0) {
    return <CircularProgress />
  }
  if ((error && Object.keys(error).length && !tokens) || !networkId) {
    return <EmptyItemWrapper>{'Can&apos;t load details'}</EmptyItemWrapper>
  }
  console.log('tokens', tokens)
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
