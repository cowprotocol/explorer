import { TokenErc20 } from '@gnosis.pm/dex-js'
import { NATIVE_TOKEN_ADDRESS } from 'const'
import { Token } from 'api/operator/types'

const DAI: TokenErc20 = {
  name: 'Dai Stablecoin',
  symbol: 'DAI',
  decimals: 18,
  address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
}

const WRAPPED_ETHER: TokenErc20 = {
  name: 'Wrapped Ether',
  symbol: 'ETH',
  decimals: 18,
  address: NATIVE_TOKEN_ADDRESS,
}

const TOKENS = [
  {
    id: 1,
    ...WRAPPED_ETHER,
    priceEth: '0.0002454779306444603682922218067078563',
    priceUsd: '2574.325',
    last24hours: -3.32,
    sevenDays: -3.32,
    lastDayVolume: '$323.34M',
    last7Days: {
      currentVolume: 100,
      changedVolume: 200,
      values: [
        { time: '2019-02-11', value: 80.01 },
        { time: '2019-07-12', value: 90.63 },
        { time: '2019-08-13', value: 76.64 },
        { time: '2019-10-14', value: 98.89 },
      ],
    },
  },
  {
    id: 2,
    ...DAI,
    priceEth: '0.0002454779306444603682922218067078563',
    priceUsd: '1',
    last24hours: 3.32,
    sevenDays: 3.32,
    lastDayVolume: '$323.34M',
    last7Days: {
      currentVolume: 200,
      changedVolume: 100,
      values: [
        { time: '2019-02-11', value: 80.01 },
        { time: '2019-07-12', value: 90.63 },
        { time: '2019-08-13', value: 76.64 },
        { time: '2019-10-14', value: 98.89 },
      ],
    },
  },
  {
    id: 3,
    ...WRAPPED_ETHER,
    priceEth: '0.0002454779306444603682922218067078563',
    priceUsd: '2574.325',
    last24hours: -3.32,
    sevenDays: -3.32,
    lastDayVolume: '$323.34M',
    last7Days: {
      currentVolume: 100,
      changedVolume: 200,
      values: [
        { time: '2019-02-11', value: 80.01 },
        { time: '2019-07-12', value: 90.63 },
        { time: '2019-08-13', value: 76.64 },
        { time: '2019-10-14', value: 98.89 },
      ],
    },
  },
  {
    id: 4,
    ...WRAPPED_ETHER,
    priceEth: '0.0002454779306444603682922218067078563',
    priceUsd: '2574.325',
    last24hours: -3.32,
    sevenDays: -3.32,
    lastDayVolume: '$323.34M',
    last7Days: {
      currentVolume: 100,
      changedVolume: 200,
      values: [
        { time: '2019-02-11', value: 80.01 },
        { time: '2019-07-12', value: 90.63 },
        { time: '2019-08-13', value: 76.64 },
        { time: '2019-10-14', value: 98.89 },
      ],
    },
  },
  {
    id: 5,
    ...WRAPPED_ETHER,
    priceEth: '0.0002454779306444603682922218067078563',
    priceUsd: '2574.325',
    last24hours: -3.32,
    sevenDays: -3.32,
    lastDayVolume: '$323.34M',
    last7Days: {
      currentVolume: 100,
      changedVolume: 200,
      values: [
        { time: '2019-02-11', value: 80.01 },
        { time: '2019-07-12', value: 90.63 },
        { time: '2019-08-13', value: 76.64 },
        { time: '2019-10-14', value: 98.89 },
      ],
    },
  },
  {
    id: 6,
    ...WRAPPED_ETHER,
    priceEth: '0.0002454779306444603682922218067078563',
    priceUsd: '2574.325',
    last24hours: -3.32,
    sevenDays: -3.32,
    lastDayVolume: '$323.34M',
    last7Days: {
      currentVolume: 100,
      changedVolume: 200,
      values: [
        { time: '2019-02-11', value: 80.01 },
        { time: '2019-07-12', value: 90.63 },
        { time: '2019-08-13', value: 76.64 },
        { time: '2019-10-14', value: 98.89 },
      ],
    },
  },
  {
    id: 7,
    ...WRAPPED_ETHER,
    priceEth: '0.0002454779306444603682922218067078563',
    priceUsd: '2574.325',
    last24hours: -3.32,
    sevenDays: -3.32,
    lastDayVolume: '$323.34M',
    last7Days: {
      currentVolume: 100,
      changedVolume: 200,
      values: [
        { time: '2019-02-11', value: 80.01 },
        { time: '2019-07-12', value: 90.63 },
        { time: '2019-08-13', value: 76.64 },
        { time: '2019-10-14', value: 98.89 },
      ],
    },
  },
  {
    id: 8,
    ...WRAPPED_ETHER,
    priceEth: '0.0002454779306444603682922218067078563',
    priceUsd: '2574.325',
    last24hours: -3.32,
    sevenDays: -3.32,
    lastDayVolume: '$323.34M',
    last7Days: {
      currentVolume: 100,
      changedVolume: 200,
      values: [
        { time: '2019-02-11', value: 80.01 },
        { time: '2019-07-12', value: 90.63 },
        { time: '2019-08-13', value: 76.64 },
        { time: '2019-10-14', value: 98.89 },
      ],
    },
  },
  {
    id: 9,
    ...WRAPPED_ETHER,
    priceEth: '0.0002454779306444603682922218067078563',
    priceUsd: '2574.325',
    last24hours: -3.32,
    sevenDays: -3.32,
    lastDayVolume: '$323.34M',
    last7Days: {
      currentVolume: 100,
      changedVolume: 200,
      values: [
        { time: '2019-02-11', value: 80.01 },
        { time: '2019-07-12', value: 90.63 },
        { time: '2019-08-13', value: 76.64 },
        { time: '2019-10-14', value: 98.89 },
      ],
    },
  },
  {
    id: 10,
    ...WRAPPED_ETHER,
    priceEth: '0.0002454779306444603682922218067078563',
    priceUsd: '2574.325',
    last24hours: -3.32,
    sevenDays: -3.32,
    lastDayVolume: '$323.34M',
    last7Days: {
      currentVolume: 100,
      changedVolume: 200,
      values: [
        { time: '2019-02-11', value: 80.01 },
        { time: '2019-07-12', value: 90.63 },
        { time: '2019-08-13', value: 76.64 },
        { time: '2019-10-14', value: 98.89 },
      ],
    },
  },
  {
    id: 11,
    ...WRAPPED_ETHER,
    priceEth: '0.0002454779306444603682922218067078563',
    priceUsd: '2574.325',
    last24hours: -3.32,
    sevenDays: -3.32,
    lastDayVolume: '$323.34M',
    last7Days: {
      currentVolume: 100,
      changedVolume: 200,
      values: [
        { time: '2019-02-11', value: 80.01 },
        { time: '2019-07-12', value: 90.63 },
        { time: '2019-08-13', value: 76.64 },
        { time: '2019-10-14', value: 98.89 },
      ],
    },
  },
] as Token[]

export default TOKENS
