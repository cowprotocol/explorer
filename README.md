[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/cowprotocol/explorer)

[![Coverage Status](https://coveralls.io/repos/github/cowprotocol/explorer/badge.svg?branch=main)](https://coveralls.io/github/cowprotocol/explorer?branch=main)

Develop:
[![Coverage Status](https://coveralls.io/repos/github/cowprotocol/explorer/badge.svg?branch=develop)](https://coveralls.io/github/cowprotocol/explorer?branch=develop)

# Gnosis Protocol UI

`Gnosis Protocol UI` contains some reusable components for [Gnosis Protocol](https://docs.gnosis.io/protocol) (`๐จ WARNING: the doc may still refer to v1 of the protocol`).

Gnosis Protocol is a fully permissionless DEX that enables ring trades to maximize liquidity.

`Gnosis Protocol UI` contains:

- **Explorer**: Gnosis Protocol explorer. Allows you to explore the protocol orders and trades. For now Explorer is a WIP ๐ทโโ๏ธ.
- **Trade**: Classical trading interface. For now it is just a WIP ๐ทโโ๏ธ. 
- **Legacy GP v1 UI**: Trading interface for Gnosis Protocol v1. It's the only app that is not generated automatically, but it can be run/built by following the instructions in this readme.
- **Story Book**: Showcases some of the components used in these apps.


## ๐งช Install dependencies 
```bash
# Install dependencies (we use Yarn but NPM should work too)
yarn
```

## ๐โโ๏ธ Run it locally
> Make sure you installed the dependencies first


| App         |      Description                                   |  Run                              |  Notes                                 |
|-------------|:----------------------------------------------:|--------------------------------------:|----------------------------------------|
| Explorer    | Gnosis Protocol Explorer. It's the default app | `yarn start` or `yarn start:explorer` |                                        |
| Safe Swap   | Gnosis Safe's Swap UI                          | `yarn start:safe-swap`                | ๐ง `WIP: Under construction`           |
| Trade UI    | Classical trading UI                           | `yarn start:trade`                    | ๐ง `WIP: Just a not working prototype` |
| GP v1 Swap   |  Swap UI for Gnosis Protocol v1               | `yarn start:gp-v1`                    |                                        |
    

Open http://localhost:8080 in your browser.


## ๐ทโโ๏ธ Build app

```bash
yarn build
```

Static files will be generated inside the `./dist` dir.

## ๐งช Run tests

```bash
yarn test
```
