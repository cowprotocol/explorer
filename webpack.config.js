const dotenv = require('dotenv')

// Setup env vars
dotenv.config()

const getWebpackConfig = require('./getWebpackConfig')
const loadConfig = require('./src/loadConfig')
const overrideEnvConfig = require('./src/overrideEnvConfig')

const isProduction = process.env.NODE_ENV == 'production'
const baseUrl = isProduction ? '' : '/'

// FIXME: The apps right now depend on config they don't, se below attempt to check what was required. One example of something that is required but we don't need is --> for some reason "createTheGraphApi" it's being executed
const CONFIG = loadConfig()

// // TODO: now is a plain JSON for demostration porpouses, and to show the minimal config right now. But probably we should reiterate on this!
// const CONFIG = {
//   name: 'Gnosis Protocol',
//   templatePath: './src/html/index.html',
//   logoPath: './src/assets/img/logo.svg',
//   defaultProviderConfig: {
//     type: 'infura', // Choices: infura | url
//     config: {
//       infuraId: '607a7dfcb1ad4a0b83152e30ce20cfc5',
//       infuraEndpoint: 'wss://mainnet.infura.io/ws/v3/',
//     },
//   },
//   walletConnect: {
//     bridge: 'wss://safe-walletconnect.gnosis.io/',
//   },
//   disabledTokens: {},
//   exchangeContractConfig: {
//     type: 'contractBlock', // choices: contractBlock
//     config: [
//       { networkId: 1, blockNumber: 9340147 },
//       { networkId: 4, blockNumber: 5844678 },
//       { networkId: 100, blockNumber: 11948310 },
//     ],
//   },
//   initialTokenList: [],
// }
const config = overrideEnvConfig(CONFIG)
const TRADE_APP = { name: 'trade', title: 'Gnosis Protocol Exchange', filename: 'trade.html' }
const EXPLORER_APP = { name: 'explorer', title: 'Gnosis Protocol Explorer', filename: 'index.html' }
const ALL_APPS = [TRADE_APP, EXPLORER_APP]

function getSelectedApps() {
  const appName = process.env.APP
  if (appName) {
    const app = ALL_APPS.find((app) => appName === app.name)
    if (!app) {
      throw new Error(`Unknown App ${app}`)
    }

    return [
      {
        ...app,
        filename: 'index.html', // If we return only one app, the html web is "index.html"
      },
    ]
  } else {
    return ALL_APPS.filter((app) => !app.disabled)
  }
}

// Get selected apps: all apps by default
const apps = getSelectedApps()

module.exports = getWebpackConfig({
  apps,
  config,
  baseUrl,
  envVars: {
    BASE_URL: baseUrl,
    // // MOCK: Use mock or real API implementation
    // MOCK: 'false',
    // MOCK_WALLET: process.env.MOCK || 'false',
    // MOCK_TOKEN_LIST: process.env.MOCK || 'false',
    // MOCK_ERC20: process.env.MOCK || 'false',
    // MOCK_WETH: process.env.MOCK || 'false',
    // MOCK_DEPOSIT: process.env.MOCK || 'false',
    // MOCK_EXCHANGE: process.env.MOCK || 'false',
    // MOCK_WEB3: process.env.MOCK || 'false',
    // MOCK_OPERATOR: process.env.MOCK || 'false',
    // // AUTOCONNECT: only applies for mock implementation
    // AUTOCONNECT: 'true',
    // PRICE_ESTIMATOR_URL: process.env.PRICE_ESTIMATOR_URL || (isProduction && 'production') || 'develop',
    // APP: null,
    // APP_ID: null,
    // INFURA_ID: null,
    // WALLET_CONNECT_BRIDGE: null,
    // ETH_NODE_URL: null,
    // LIQUIDITY_TOKEN_LIST: null,
  },
  defineVars: {
    CONFIG: JSON.stringify(config),
    CONTRACT_VERSION: JSON.stringify(require('@gnosis.pm/gp-v2-contracts/package.json').version),
    CONTRACT_GITHUB_REPO: 'gnosis/gp-v2-contracts',
    DEX_JS_VERSION: JSON.stringify(require('@gnosis.pm/dex-js/package.json').version),
  },
})
