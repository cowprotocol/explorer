import { GlobalState, GLOBAL_INITIAL_STATE, globalRootReducer } from 'reducers-actions'
import combineReducers from 'combine-reducers'

export type ExplorerAppState = GlobalState

export const INITIAL_STATE = (): ExplorerAppState => ({
  ...GLOBAL_INITIAL_STATE(),
})

export const rootReducer = combineReducers({
  ...globalRootReducer,
})
