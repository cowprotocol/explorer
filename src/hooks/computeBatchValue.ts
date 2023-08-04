import { Batch, BatchValue } from './useGetBatches'

/**
 * Helper function to compute total value of a batch.
 * This is done by summing buy amounts for each trade in the batch and converting it into USD.
 * If USD price for buyToken is not available, USD price for sellToken is used, and sellAmount is considered.
 *
 * @param {Batch} batch - The batch for which the total value needs to be computed
 * @returns {BatchValue} - An object containing the batch ID and the total batch value in USD
 */
export const computeBatchValue = (batch: Batch): BatchValue => {
  let totalValue = 0
  batch.trades.forEach((trade) => {
    let amount = trade.buyAmount / 10 ** trade.buyToken.decimals
    let tokenPriceInUsd = trade.buyToken.priceUsd

    if (tokenPriceInUsd == 0) {
      // If USD price for buyToken is not available, use USD price for sellToken
      // and consider sellAmount instead of buyAmount
      tokenPriceInUsd = trade.sellToken.priceUsd
      amount = trade.sellAmount / 10 ** trade.sellToken.decimals
    }

    const tradeValueInUsd = amount * tokenPriceInUsd
    totalValue += tradeValueInUsd
  })

  return {
    batchId: batch.id,
    totalValue,
  }
}
