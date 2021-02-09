import { createErc20Api } from 'api'

import { web3 } from 'api'

const injectedDependencies = { web3 }

const erc20Api = createErc20Api(injectedDependencies)

export { web3, erc20Api }
