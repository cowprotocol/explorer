import React from 'react'

export let isPriceInverted = false
export const invertPrice = (): void => {
  isPriceInverted = !isPriceInverted
}

const TradesTableContext = React.createContext({
  invertPrice,
  isPriceInverted,
})

export default TradesTableContext
