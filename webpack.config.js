const dotenv = require('dotenv')
const fs = require('fs')
const safeManifest = require('./src/apps/safe-swap/manifest.json')

// Setup env vars
dotenv.config()

const getWebpackConfig = require('./getWebpackConfig')
const loadConfig = require('./src/loadConfig')
const overrideEnvConfig = require('./src/overrideEnvConfig')

const isProduction = process.env.NODE_ENV == 'production'
const baseUrl = isProduction ? '' : '/'
const APP_NAME = process.env.APP

// FIXME: The apps right now depend on config they don't, se below attempt to check what was required. One example of something that is required but we don't need is --> for some reason "createTheGraphApi" it's being executed
const CONFIG = loadConfig()

const config = overrideEnvConfig(CONFIG)
const TRADE_APP = { name: 'trade', title: 'Gnosis Protocol Exchange', filename: 'trade.html' }
const EXPLORER_APP = { name: 'explorer', title: 'Gnosis Protocol Explorer', filename: 'index.html' }
const SAFE_SWAP_APP = { name: 'safe-swap', title: 'Gnosis Safe Swap', filename: 'safe.html', publicPath: 'public' }
const ALL_APPS = [TRADE_APP, EXPLORER_APP, SAFE_SWAP_APP]

function writeGnosisSafeSwapManifest() {
  console.log('Write: ', 'dist/output.json')
  const { short_name, name } = safeManifest

  const namePrefix = isProduction ? '' : '[dev] '

  const overridedManifest = {
    ...safeManifest,
    short_name: short_name + short_name,
    name: namePrefix + name,
  }
  fs.writeFileSync('dist/output.json', JSON.stringify(overridedManifest, null, 2))
}

function getSelectedApps() {
  if (APP_NAME) {
    const app = ALL_APPS.find((app) => APP_NAME === app.name)
    if (!app) {
      const validApps = ALL_APPS.map((app) => `"${app.name}"`).join(', ')
      throw new Error(`Unknown App ${app}. Valid Apps are ${validApps}`)
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

// Safe App: Write manifest
const containsSafeSwapApp = apps.find((app) => app.name == SAFE_SWAP_APP.name)
if (containsSafeSwapApp) {
  writeGnosisSafeSwapManifest()
}

module.exports = getWebpackConfig({
  apps,
  config,
  baseUrl,
  envVars: {
    BASE_URL: baseUrl,
  },
  defineVars: {
    CONFIG: JSON.stringify(config),
    CONTRACT_VERSION: JSON.stringify(require('@gnosis.pm/gp-v2-contracts/package.json').version),
    DEX_JS_VERSION: JSON.stringify(require('@gnosis.pm/dex-js/package.json').version),
  },
})
