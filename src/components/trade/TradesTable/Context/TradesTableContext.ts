import React from 'react'

export let isPriceInverted = false
export const inverPrice = (): void => {
  isPriceInverted = !isPriceInverted
}

const TradesTableContext = React.createContext({
  inverPrice: inverPrice,
  isPriceInverted: isPriceInverted,
})

export default TradesTableContext
