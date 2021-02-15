import { ExplorerAppState } from 'apps/explorer/state'
import useGlobalState from 'hooks/useGlobalState'
import Web3 from 'web3'

export function useWeb3(): Web3 | null {
  const [{ web3 }] = useGlobalState<ExplorerAppState>()

  return web3
}
