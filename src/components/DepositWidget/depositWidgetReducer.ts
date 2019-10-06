import { TokenBalanceDetails } from 'types'

export interface State {
  balances: TokenBalanceDetails[]
  error: boolean
}

export interface Action {
  type: 'update-balances' | 'set-error' | 'claim'
  balances?: TokenBalanceDetails[]
}

export function depositWidgetReducer(state: State, action: Action): State {
  console.log('[depositWidgetReducer]', action)
  switch (action.type) {
    case 'update-balances':
      return {
        ...state,
        balances: action.balances,
      }

    case 'set-error':
      return {
        ...state,
        error: true,
      }

    case 'claim':
      return state

    default:
      throw new Error('Unknown action: ' + action.type)
  }
}
