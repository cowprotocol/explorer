/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { Core } from 'cytoscape'

declare module 'cytoscape' {
  export interface Core {
    removeAllListeners: () => void
  }
}
