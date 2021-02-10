import { TokenErc20 } from '@gnosis.pm/dex-js'

import { Actions } from 'state'

import { Network } from 'types'

export type ActionTypes = 'SAVE_MULTIPLE_ERC20'

export type Erc20State = Map<string, TokenErc20>

type SaveMultipleErc20ActionType = Actions<ActionTypes, { erc20s: TokenErc20[]; networkId: Network }>
type ReducerActionType = SaveMultipleErc20ActionType

export const saveMultipleErc20 = (erc20s: TokenErc20[], networkId: Network): SaveMultipleErc20ActionType => ({
  type: 'SAVE_MULTIPLE_ERC20',
  payload: { erc20s, networkId },
})

// Syntactic sugar
export const saveSingleErc20 = (erc20: TokenErc20, networkId: Network): SaveMultipleErc20ActionType =>
  saveMultipleErc20([erc20], networkId)

// TODO: load initial state from local storage
export const INITIAL_ERC20_STATE: Erc20State = new Map<string, TokenErc20>()

export function buildErc20Key(networkId: Network, address: string): string {
  return `${networkId}|${address}`
}

export function reducer(state: Erc20State, action: ReducerActionType): Erc20State {
  switch (action.type) {
    case 'SAVE_MULTIPLE_ERC20': {
      // Clone current state
      const map = new Map(state)

      const { erc20s, networkId } = action.payload

      erc20s.forEach((erc20) => {
        const key = buildErc20Key(networkId, erc20.address)
        const existing = map.get(key) || {}
        // merge existing erc20 info, if any
        map.set(key, { ...existing, ...erc20 })
      })

      return map
    }
    default:
      return state
  }
}
