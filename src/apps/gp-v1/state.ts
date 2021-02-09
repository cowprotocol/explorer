import { GlobalState, GLOBAL_INITIAL_STATE, globalRootReducer, addSideEffect } from 'reducers-actions'
import { reducer as TokenRowReducer, TokenLocalState, TokenRowInitialState as tokens } from 'reducers-actions/tokenRow'
import {
  reducer as PendingOrderReducer,
  PendingOrdersState,
  PendingOrdersInitialState as pendingOrders,
  sideEffect as PendingOrdersSideEffect,
} from 'reducers-actions/pendingOrders'
import {
  reducer as OrdersReducer,
  OrdersState,
  INITIAL_ORDERS_STATE as orders,
  sideEffect as OrdersSideEffect,
} from 'reducers-actions/orders'
import { reducer as TradeReducer, TradeState, INITIAL_TRADE_STATE as trade } from 'reducers-actions/trade'
import {
  reducer as TradesReducer,
  TradesState,
  initialState as trades,
  sideEffect as TradesSideEffect,
} from 'reducers-actions/trades'
import {
  reducer as LocalTokensReducer,
  LocalTokensState,
  INITIAL_LOCAL_TOKENS_STATE as localTokens,
  sideEffect as LocalTokensSideEffect,
} from 'reducers-actions/localTokens'
import combineReducers from 'combine-reducers'

export interface GpV1AppState extends GlobalState {
  tokens: TokenLocalState
  pendingOrders: PendingOrdersState
  orders: OrdersState
  trade: TradeState
  trades: TradesState
  localTokens: LocalTokensState
}

export const INITIAL_STATE = (): GpV1AppState => ({
  ...GLOBAL_INITIAL_STATE(),
  tokens,
  pendingOrders,
  orders,
  trade,
  trades,
  localTokens,
})

export const rootReducer = combineReducers({
  ...globalRootReducer,
  tokens: TokenRowReducer,
  pendingOrders: addSideEffect(PendingOrderReducer, PendingOrdersSideEffect),
  orders: addSideEffect(OrdersReducer, OrdersSideEffect),
  trade: TradeReducer,
  trades: addSideEffect(TradesReducer, TradesSideEffect),
  localTokens: addSideEffect(LocalTokensReducer, LocalTokensSideEffect),
})
