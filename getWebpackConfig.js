const assert = require('assert').strict
const path = require('path')
const { version } = require('./package.json')

const webpack = require('webpack')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const PreloadWebpackPlugin = require('preload-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const SentryWebpackPlugin = require('@sentry/webpack-plugin')
const markdownIt = require('markdown-it')
const linkAttributes = require('markdown-it-link-attributes')

function _getHtmlPlugin({ app, templatePath, isProduction }) {
  const { name, title, filename } = app

  assert(name, '"name" missing in app config')
  assert(title, '"title" missing in app config')
  assert(filename, '"filename" missing in app config')

  return new HtmlWebPackPlugin({
    template: templatePath,
    chunks: [name],
    title: title,
    filename,
    ipfsHack: isProduction,
    minify: isProduction && {
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeStyleLinkTypeAttributes: true,
      keepClosingSlash: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true,
    },
  })
}

function _getPlugins({ apps, config, envVars, stats, defineVars, publicPaths, isProduction }) {
  const { name: appTitle } = config

  // Html Plugin: Generate one entry point HTML page per app
  const htmlPlugins = apps.map((app) =>
    _getHtmlPlugin({
      app,
      templatePath: config.templatePath,
      isProduction,
    }),
  )
  const plugins = htmlPlugins

  // Favicons plugin: Genrates the favicon from a PNG
  plugins.push(
    new FaviconsWebpackPlugin({
      logo: config.logoPath,
      mode: 'webapp', // optional can be 'webapp' or 'light' - 'webapp' by default
      devMode: 'webapp', // optional can be 'webapp' or 'light' - 'light' by default
      favicons: {
        appName: appTitle,
        appDescription: appTitle,
        developerName: appTitle,
        developerURL: null, // prevent retrieving from the nearest package.json
        background: '#dfe6ef',
        themeColor: '#476481',
        icons: {
          coast: false,
          yandex: false,
        },
      },
    }),
  )

  // Preload plugin: Lazy loading help, uses <link rel='preload'> with the chunks
  plugins.push(
    new PreloadWebpackPlugin({
      rel: 'prefetch',
      include: 'allAssets',
      fileBlacklist: [/\.map/, /runtime~.+\.js$/],
    }),
  )

  // Fork ts checker plugin: Speed up TS and lint checks
  plugins.push(new ForkTsCheckerWebpackPlugin({ silent: stats }))

  // Define Plugin: Create global constants
  plugins.push(
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require('./package.json').version),
      ...defineVars,
    }),
  )

  // Environment plugin: Like e DefinePlugin but on process.env
  plugins.push(
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development', // defaults to `development` when not set
      // Load app's env vars, if any
      ...apps.reduce((acc, app) => {
        if (app && app.envVars) {
          acc = { ...acc, ...app.envVars }
        }
        return acc
      }, {}),
      // Finally load global env vars
      ...envVars,
    }),
  )

  // Production only plugins
  if (isProduction) {
    // Sentry source-maps plugin
    const SENTRY_RELEASE = 'gp-explorer@v' + version
    const SENTRY_AUTH_TOKEN = process.env.REACT_APP_SENTRY_AUTH_TOKEN

    if (SENTRY_AUTH_TOKEN) {
      plugins.push(
        new SentryWebpackPlugin({
          // sentry-cli configuration - can also be done directly through sentry-cli
          // see https://docs.sentry.io/product/cli/configuration/ for details
          authToken: SENTRY_AUTH_TOKEN,
          org: 'gnosis-protocol',
          project: 'gp-explorer',
          release: SENTRY_RELEASE,
          // other SentryWebpackPlugin configuration
          include: './dist',
          ignore: ['node_modules', 'webpack.config.js'],
        }),
      )
    }

    // Inline chunk html plugin: Inlines script chunks into index.html
    plugins.push(new InlineChunkHtmlPlugin(HtmlWebPackPlugin, [/runtime/]))

    // Copy plugin
    if (publicPaths.length > 0) {
      plugins.push(
        new CopyPlugin({
          patterns: publicPaths.map((publicPath) => ({ from: publicPath })),
        }),
      )
    }
  }

  return plugins
}

function getWebpackConfig({ apps = [], config = {}, envVars = {}, defineVars = {}, baseUrl = '/' } = {}) {
  const { name: appTitle, templatePath, logoPath } = config
  const isProduction = process.env.NODE_ENV === 'production'

  assert(apps.length > 0, 'At least one app is required')
  assert(appTitle, '"name" missing in config')
  assert(templatePath, '"templatePath" missing in config')
  assert(logoPath, '"logoPath" missing in config')

  // Log the apps
  console.log('apps', apps)

  // Generate one entry point per app
  const entryPoints = apps.reduce((acc, app) => {
    const { name } = app
    acc[name] = `./src/apps/${name}/index.tsx`
    return acc
  }, {})

  // Public paths
  const publicPaths = apps.reduce((acc, app) => {
    const { publicPath, name } = app
    if (publicPath) {
      acc.push(`src/apps/${name}/${publicPath}`)
    }
    return acc
  }, [])
  console.log(`Public paths: ${publicPaths.join('.')}`)
  return ({ stats = false } = {}) => ({
    entry: entryPoints, // One entry points per app
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    output: {
      path: __dirname + '/dist',
      chunkFilename: isProduction ? '[name].[contenthash].js' : '[name].js',
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      publicPath: baseUrl || '/',
    },
    module: {
      rules: [
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: [
            'file-loader',
            {
              loader: 'image-webpack-loader',
              options: {
                bypassOnDebug: true,
                disable: !isProduction,
              },
            },
          ],
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: { cacheDirectory: true },
          },
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: { cacheDirectory: true },
            },
            {
              loader: 'ts-loader',
              options: {
                // disable type checker - we will use it in fork plugin
                transpileOnly: true,
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(ttf|otf|eot|woff2?)(\?[a-z0-9]+)?$/,
          use: {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
            },
          },
        },
        {
          test: /\.md$/,
          use: {
            loader: 'frontmatter-markdown-loader',
            options: {
              mode: ['react-component'],
              markdownIt: markdownIt({
                html: true,
                linkify: true,
                breaks: true,
                xhtmlOut: true,
              }).use(linkAttributes, {
                attrs: {
                  target: '_blank',
                  rel: 'noopener noreferrer',
                },
              }),
            },
          },
        },
      ],
    },
    devServer: {
      historyApiFallback: true,
      https: process.env.HTTPS === 'true',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
      contentBase:
        publicPaths.length > 0 ? publicPaths.map((publicPath) => path.join(__dirname, publicPath)) : undefined,
    },
    resolve: {
      alias: {
        'react-dom': '@hot-loader/react-dom',
        'bn.js': path.resolve(__dirname, 'node_modules/bn.js'),
        'react-inspector': path.resolve(__dirname, 'node_modules/react-inspector'),
      },
      modules: [path.resolve(__dirname, 'custom'), path.resolve(__dirname, 'src'), 'node_modules'],
      extensions: ['.ts', '.tsx', '.js'],
    },
    // drop unused deps
    // https://www.amcharts.com/docs/v4/getting-started/integrations/using-webpack/#Large_file_sizes
    externals: function (context, request, callback) {
      if (/xlsx|canvg|pdfmake/.test(request)) {
        return callback(null, 'commonjs ' + request)
      }
      callback()
    },
    plugins: _getPlugins({ apps, config, envVars, stats, defineVars, publicPaths, isProduction }),
    optimization: {
      moduleIds: 'hashed',
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxAsyncRequests: 10,
        maxSize: 1000000,
      },
      runtimeChunk: true,
    },
  })
}

module.exports = getWebpackConfig
