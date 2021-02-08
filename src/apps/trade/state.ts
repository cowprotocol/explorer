import { GlobalState, GLOBAL_INITIAL_STATE, globalRootReducer } from 'reducers-actions'
import combineReducers from 'combine-reducers'

export type TradeAppState = GlobalState

export const INITIAL_STATE = (): TradeAppState => ({
  ...GLOBAL_INITIAL_STATE(),
})

export const rootReducer = combineReducers({
  ...globalRootReducer,
})
