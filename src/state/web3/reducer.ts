import Web3 from 'web3'
import { SetWeb3Type } from './actions'

export type ReducerActionType = SetWeb3Type

export function reducer(state: Web3 | null, action: ReducerActionType): Web3 | null {
  switch (action.type) {
    case 'SET_WEB3': {
      const { web3 } = action.payload

      return web3
    }
    default: {
      return state
    }
  }
}
