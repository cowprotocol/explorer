[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/gnosis/gp-ui)

[![Coverage Status](https://coveralls.io/repos/github/gnosis/gp-ui/badge.svg?branch=master)](https://coveralls.io/github/gnosis/gp-ui?branch=master)

Develop:
[![Coverage Status](https://coveralls.io/repos/github/gnosis/gp-ui/badge.svg?branch=develop)](https://coveralls.io/github/gnosis/gp-ui?branch=develop)

# Gnosis Protocol UI

`Gnosis Protocol UI` contains some reusable components for [Gnosis Protocol](https://docs.gnosis.io/protocol) (`🚨 WARNING: the doc may still refer to v1 of the protocol`).

Gnosis Protocol is a fully permissionless DEX that enables ring trades to maximize liquidity.

`Gnosis Protocol UI` contains:

- **Explorer**: Gnosis Protocol explorer. Allows you to explore the protocol orders and trades. For now Explorer is a WIP 👷‍♀️.
- **Trade**: Classical trading interface. For now it is just a WIP 👷‍♀️. 
- **Legacy GP v1 UI**: Trading interface for Gnosis Protocol v1. It's the only app that is not generated automatically, but it can be run/built by following the instructions in this readme.
- **Story Book**: Showcases some of the components used in these apps.


## 🏃‍♀️ Run it locally

The default app is the **Explorer**.

```bash
# Install dependencies (we use Yarn but NPM should work too)
yarn

# Run explorer UI
#   Start dev server in http://localhost:8080
yarn start

# Run Trade UI
yarn start:trade

# Run Legacy GP v1 UI
yarn start:gp-v1
```

Open http://localhost:8080 in your browser.


## 👷‍♀️Build app

```bash
yarn build
```

Static files will be generated inside the `./dist` dir.

## 🧪 Run tests

```bash
yarn test
```
