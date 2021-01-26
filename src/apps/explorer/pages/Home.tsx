import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { getFeeQuote, getTrades } from 'api/operator'
import { Network } from 'types'

const Wrapper = styled.div`
  display: flex;
  overflow: hidden;
  flex: 1 1 auto;
  width: 100%;
  height: calc(100vh - var(--height-bar-default));
  position: fixed;
  top: var(--height-bar-default);
`

export const Home: React.FC = () => {
  const [fee, setFee] = useState('')
  const [trades, setTrades] = useState<string[]>([])

  useEffect(() => {
    getFeeQuote(Network.Mainnet, '0x6810e776880c02933d47db1b9fc05908e5386b96')
      .then((quote) => quote.minimalFee.toString())
      .catch(() => 'N/A')
      .then(setFee)
    getTrades().then(setTrades)
  }, [])

  return (
    <Wrapper>
      <h1>Gnosis Protocol Explorer</h1>
      <p>Welcome :)</p>

      <div>
        Fee: {fee} <br />
        <br />
        Trades:{trades.join(', ')} <br />
      </div>
    </Wrapper>
  )
}

export default Home
