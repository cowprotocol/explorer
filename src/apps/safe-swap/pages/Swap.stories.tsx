// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta } from '@storybook/react/types-6-0'

import { Home as Swap } from './Swap'

export default {
  title: 'SafeSwap/Swap',
  component: Swap,
} as Meta

export const Primary = Swap
