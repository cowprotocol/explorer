const dotenv = require('dotenv')

// Setup env vars
dotenv.config()

const getWebpackConfig = require('./getWebpackConfig')
const loadConfig = require('./src/loadConfig')
const overrideEnvConfig = require('./src/overrideEnvConfig')

const isProduction = process.env.NODE_ENV == 'production'
const baseUrl = isProduction ? '' : '/'

const config = overrideEnvConfig(loadConfig())

module.exports = getWebpackConfig({
  apps: [
    {
      name: 'gp-v1',
      title: 'Gnosis Protocol v1 Web',
      filename: 'index.html',
    },
  ],
  config,
  baseUrl,
  envVars: {
    BASE_URL: baseUrl,
    // MOCK: Use mock or real API implementation
    MOCK: 'false',
    MOCK_WALLET: process.env.MOCK || 'false',
    MOCK_TOKEN_LIST: process.env.MOCK || 'false',
    MOCK_ERC20: process.env.MOCK || 'false',
    MOCK_WETH: process.env.MOCK || 'false',
    MOCK_DEPOSIT: process.env.MOCK || 'false',
    MOCK_EXCHANGE: process.env.MOCK || 'false',
    MOCK_WEB3: process.env.MOCK || 'false',
    MOCK_OPERATOR: process.env.MOCK || 'false',
    // AUTOCONNECT: only applies for mock implementation
    AUTOCONNECT: 'true',
    PRICE_ESTIMATOR_URL: process.env.PRICE_ESTIMATOR_URL || (isProduction && 'production') || 'develop',
    APP: null,
    APP_ID: null,
    INFURA_ID: null,
    WALLET_CONNECT_BRIDGE: null,
    ETH_NODE_URL: null,
    LIQUIDITY_TOKEN_LIST: null,
  },
  defineVars: {
    DEX_JS_VERSION: JSON.stringify(require('@gnosis.pm/dex-js/package.json').version),
    CONTRACT_VERSION: JSON.stringify(require('@gnosis.pm/dex-contracts/package.json').version),
    CONFIG: JSON.stringify(config),
  },
})
