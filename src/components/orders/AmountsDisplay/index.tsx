import React from 'react'
import BigNumber from 'bignumber.js'

import { formatSmart, TokenErc20 } from '@gnosis.pm/dex-js'

import { Order } from 'api/operator'

import { HIGH_PRECISION_DECIMALS, HIGH_PRECISION_SMALL_LIMIT } from 'apps/explorer/const'

import { BlockExplorerLink } from 'apps/explorer/components/common/BlockExplorerLink'

import { RowContents, RowTitle, StyledImg, /*UsdAmount,*/ Wrapper } from './styled'

type RowProps = {
  title: string
  titleSuffix?: string
  amount: BigNumber
  erc20: TokenErc20
}

function Row(props: RowProps): JSX.Element {
  const { title, titleSuffix, amount, erc20 } = props

  // TODO: calculate real usd amount
  // const usdAmount = '31231.32'

  // Decimals are optional on ERC20 spec. In that unlikely case, graceful fallback to raw amount
  const formattedAmount = erc20.decimals
    ? formatSmart({
        amount: amount.toString(10),
        precision: erc20.decimals,
        decimals: HIGH_PRECISION_DECIMALS,
        smallLimit: HIGH_PRECISION_SMALL_LIMIT,
      })
    : amount.toString(10)
  // Name and symbol are optional on ERC20 spec. Fallback to address when no name,
  // and show no symbol when that's not set
  const tokenLabel = `${erc20.name || erc20.address}${erc20.symbol ? ` (${erc20.symbol})` : ''}`

  return (
    <>
      <RowTitle>
        {title} {titleSuffix && titleSuffix}
      </RowTitle>
      <RowContents>
        <span>{formattedAmount}</span>
        {/* <UsdAmount>(~${usdAmount})</UsdAmount> */}
        {/* TODO: figure out the deal with images on networks other than Mainnet */}
        <StyledImg address={erc20.address} />
        <BlockExplorerLink identifier={erc20.address} type="token" label={tokenLabel} />
      </RowContents>
    </>
  )
}

export type Props = { order: Order }

export function AmountsDisplay(props: Props): JSX.Element | null {
  const { order } = props
  const { kind, buyAmount, buyToken, sellAmount, sellToken } = order

  if (!buyToken || !sellToken) {
    return null
  }

  const isBuyOrder = kind === 'buy'

  return (
    <Wrapper>
      <Row title="From" titleSuffix={isBuyOrder ? 'at most' : ''} amount={sellAmount} erc20={sellToken} />
      <Row title="To" titleSuffix={!isBuyOrder ? 'at least' : ''} amount={buyAmount} erc20={buyToken} />
    </Wrapper>
  )
}
