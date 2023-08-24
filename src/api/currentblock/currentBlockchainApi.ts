import BigNumber from 'bignumber.js'

const ETH_BLOCKCHAIN_URL = 'https://api.blockcypher.com/v1/eth/main'
const XDAI_BLOCKCHAIN_URL = 'https://gnosis.blockscout.com/api/v2/stats'

type ETHCurrentBlock = {
  name: string
  height: number
  hash: string
  time: Date
  latest_url: string
  previous_hash: string
  previous_url: string
  peer_count: number
  unconfirmed_count: number
  high_gas_price: BigNumber
  medium_gas_price: BigNumber
  low_gas_price: BigNumber
  high_priority_fee: BigNumber
  medium_priority_fee: BigNumber
  low_priority_fee: BigNumber
  base_fee: BigNumber
  last_fork_height: BigNumber
  last_fork_hash: string
}

export interface XDAICurrentBlock {
  average_block_time: number
  coin_price: string
  gas_prices: GasPrices
  gas_used_today: BigNumber
  market_cap: string
  network_utilization_percentage: number
  static_gas_price: BigNumber
  total_addresses: BigNumber
  total_blocks: number
  total_gas_used: BigNumber
  total_transactions: BigNumber
  transactions_today: BigNumber
}

export interface GasPrices {
  average: number
  fast: number
  slow: number
}
export interface CurrentBlockAPI {
  getETHCurrentBlock(): Promise<ETHCurrentBlock>
  getXDaiCurrentBlock(): Promise<XDAICurrentBlock>
}

export class CurrentBlockApiImpl {
  public async getETHCurrentBlock(): Promise<ETHCurrentBlock> {
    const response = await fetch(ETH_BLOCKCHAIN_URL, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.json()
  }

  public async getXDaiCurrentBlock(): Promise<XDAICurrentBlock> {
    const response = await fetch(XDAI_BLOCKCHAIN_URL, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.json()
  }
}
