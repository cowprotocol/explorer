import React from 'react'
import BigNumber from 'bignumber.js'
import { TokenErc20 } from '@gnosis.pm/dex-js'
import { FormatAmountPrecision, formatSmartMaxPrecision, formattingAmountPrecision } from 'utils'

// TODO: unify with TokenAmount in @cowprotocol/cowswap
export function TokenAmount({ amount, token, symbol }: { amount: BigNumber, symbol?: string, token?: TokenErc20 | null }) {
    const fullAmount = formatSmartMaxPrecision(amount, token || null)
    const displayedAmount = formattingAmountPrecision(amount, token || null, FormatAmountPrecision.highPrecision)
    const displayedSymbol = symbol || token?.symbol

    return <span title={fullAmount + ' ' + displayedSymbol}>{displayedAmount} {displayedSymbol}</span>
}