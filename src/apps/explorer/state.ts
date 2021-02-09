import { GlobalState, GLOBAL_INITIAL_STATE, globalRootReducer } from 'reducers-actions'
import { Erc20State, INITIAL_ERC20_STATE, reducer as erc20sReducer } from 'reducers-actions/erc20'
import combineReducers from 'combine-reducers'

export type ExplorerAppState = GlobalState & {
  erc20s: Erc20State
}

export const INITIAL_STATE = (): ExplorerAppState => ({
  ...GLOBAL_INITIAL_STATE(),
  erc20s: INITIAL_ERC20_STATE,
})

export const rootReducer = combineReducers({
  ...globalRootReducer,
  erc20s: erc20sReducer,
})
