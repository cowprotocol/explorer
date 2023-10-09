import path from 'path'
import Web3EthAccounts, { Accounts as AccountsType } from 'web3-eth-accounts'

import { context } from './test_setup'
import { compileInjects, fileExists } from './build_injects'
import { INFURA_ID } from 'const'

// get connection data from CONFIG
const { config } = CONFIG.defaultProviderConfig
const providerURL = 'ethNodeUrl' in config ? config.ethNodeUrl : 'https://rinkeby.infura.io/v3/' + INFURA_ID

declare global {
  interface Window {
    injectProvider: (params: { pk: string; url: string }) => void
  }
}
// workaround for wrong types
const accountCreator = new (Web3EthAccounts as unknown as typeof AccountsType)()
// random account
export const account = accountCreator.create()

beforeAll(async () => {
  // only rebuild when no file found
  // or when passed PWREBUILD=1 env var
  if (process.env.PWREBUILD || !(await fileExists(path.resolve(__dirname, '../build/inject_provider.js')))) {
    await compileInjects()
  }

  await context.addInitScript({
    path: path.resolve(__dirname, '../build/inject_provider.js'),
  })

  await context.addInitScript(
    (providerParams: { pk: string; url: string }) => {
      window.injectProvider(providerParams)
    },
    { pk: account.privateKey, url: providerURL },
  )
})
