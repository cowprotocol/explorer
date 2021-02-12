const dotenv = require('dotenv')

// Setup env vars
dotenv.config()

const getWebpackConfig = require('./getWebpackConfig')
const loadConfig = require('./src/loadConfig')
const overrideEnvConfig = require('./src/overrideEnvConfig')

module.exports = getWebpackConfig({
  apps: [
    {
      name: 'gp-v1',
      title: 'Gnosis Protocol v1 Web',
      filename: 'index.html',
    },
  ],
  config: overrideEnvConfig(loadConfig()),
})
