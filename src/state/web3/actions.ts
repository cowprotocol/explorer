import { Actions } from 'state'
import Web3 from 'web3'

export type ActionTypes = 'SET_WEB3'

export type SetWeb3Type = Actions<ActionTypes, { web3: Web3 | null }>

export const setWeb3 = (web3: Web3 | null): SetWeb3Type => ({
  type: 'SET_WEB3',
  payload: { web3 },
})
