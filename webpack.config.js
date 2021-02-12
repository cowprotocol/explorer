const dotenv = require('dotenv')

// Setup env vars
dotenv.config()

const getWebpackConfig = require('./getWebpackConfig')
const loadConfig = require('./src/loadConfig')
const overrideEnvConfig = require('./src/overrideEnvConfig')

const config = overrideEnvConfig(loadConfig())
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
module.exports = getWebpackConfig({ apps, config })
