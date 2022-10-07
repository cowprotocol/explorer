import { Network, Command } from 'types'
import BN from 'bn.js'
import assert from 'assert'
import { toWei } from '@gnosis.pm/dex-js'

import { logDebug, wait } from 'utils'
import { USER_1 } from '../../../test/data'
import { WalletApi, WalletInfo, ProviderInfo } from './WalletApi'

type OnChangeWalletInfo = (walletInfo: WalletInfo) => void

/**
 * Basic implementation of Wallet API
 */
export class WalletApiMock implements WalletApi {
  private _connected: boolean
  private _user: string
  private _networkId: number
  private _balance: BN
  private _listeners: ((walletInfo: WalletInfo) => void)[]

  public blockchainState = {
    account: USER_1,
    chainId: 1,
    blockHeader: null,
  }
  public userPrintAsync = Promise.resolve({ userPrint: '', gas: 0 })

  public constructor() {
    this._connected = process.env.AUTOCONNECT === 'true'
    this._user = USER_1
    this._networkId = Network.GOERLI
    this._balance = toWei(new BN(2.75), 'ether')
    this._listeners = []
  }

  public async isConnected(): Promise<boolean> {
    return this._connected
  }

  public async connect(): Promise<boolean> {
    await wait(1000)
    this._connected = true
    logDebug('[WalletApiMock] Connected')
    await this._notifyListeners()

    return true
  }

  public async disconnect(): Promise<void> {
    await wait(1000)
    this._connected = false
    logDebug('[WalletApiMock] Disconnected')
    await this._notifyListeners()
  }

  public async reconnectWC(): Promise<boolean> {
    await this.disconnect()
    return this.connect()
  }

  public async getGasPrice(): Promise<null> {
    return null
  }

  public async getAddress(): Promise<string> {
    assert(this._connected, 'The wallet is not connected')

    return this._user
  }

  public async getBalance(): Promise<BN> {
    assert(this._connected, 'The wallet is not connected')

    return this._balance
  }

  public async getNetworkId(): Promise<number> {
    assert(this._connected, 'The wallet is not connected')

    return this._networkId
  }

  public addOnChangeWalletInfo(callback: OnChangeWalletInfo): Command {
    this._listeners.push(callback)
    this.getWalletInfo().then((walletInfo) => callback(walletInfo))

    return (): void => this.removeOnChangeWalletInfo(callback)
  }

  public removeOnChangeWalletInfo(callback: OnChangeWalletInfo): void {
    this._listeners = this._listeners.filter((c) => c !== callback)
  }

  public getProviderInfo(): ProviderInfo {
    return {
      id: '',
      name: 'MockProvider',
      walletName: 'MockWallet',
      walletIcon: '',
      type: 'mock',
      logo: '',
      check: '',
    }
  }

  /* ****************      Test functions      **************** */
  // Functions created just for simulate some cases

  public async getWalletInfo(): Promise<WalletInfo> {
    return {
      isConnected: this._connected,
      userAddress: this._connected ? this._user : undefined,
      networkId: this._connected ? this._networkId : undefined,
    }
  }

  /* ****************      Private Functions      **************** */

  private async _notifyListeners(): Promise<void> {
    const walletInfo: WalletInfo = await this.getWalletInfo()
    this._listeners.forEach((listener) => listener(walletInfo))
  }
}

export default WalletApiMock
