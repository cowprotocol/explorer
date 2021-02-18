import { GlobalState, GLOBAL_INITIAL_STATE, globalRootReducer, addSideEffect } from 'state'
import { reducer as TokenRowReducer, TokenLocalState, TokenRowInitialState as tokens } from 'state/tokenRow'
import {
  reducer as PendingOrderReducer,
  PendingOrdersState,
  PendingOrdersInitialState as pendingOrders,
  sideEffect as PendingOrdersSideEffect,
} from 'state/pendingOrders'
import {
  reducer as OrdersReducer,
  OrdersState,
  INITIAL_ORDERS_STATE as orders,
  sideEffect as OrdersSideEffect,
} from 'state/orders'
import { reducer as TradeReducer, TradeState, INITIAL_TRADE_STATE as trade } from 'state/trade'
import {
  reducer as TradesReducer,
  TradesState,
  initialState as trades,
  sideEffect as TradesSideEffect,
} from 'state/trades'
import {
  reducer as LocalTokensReducer,
  LocalTokensState,
  INITIAL_LOCAL_TOKENS_STATE as localTokens,
  sideEffect as LocalTokensSideEffect,
} from 'state/localTokens'
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
