import React, { useCallback, useEffect, useRef, useState } from 'react'
import Cytoscape, { EdgeDataDefinition, ElementDefinition, NodeDataDefinition, Stylesheet } from 'cytoscape'
import { CustomLayoutOptions, layouts } from 'apps/explorer/components/TransanctionBatchGraph/layouts'
import useWindowSizes from 'hooks/useWindowSizes'
import { HEIGHT_HEADER_FOOTER } from 'apps/explorer/const'
import {
  bindPopper,
  getNodes,
  PopperInstance,
  removePopper,
  updateLayout,
} from 'apps/explorer/components/TransanctionBatchGraph/utils'
import { GetTxBatchTradesResult as TxBatchData } from 'hooks/useTxBatchTrades'
import { Network } from 'types'
import { getNodesAlternative } from 'apps/explorer/components/TransanctionBatchGraph/alternativeView'
import { getImageUrl } from 'utils'
import UnknownToken from 'assets/img/question1.svg'

export type UseCytoscapeParams = {
  txBatchData: TxBatchData
  networkId: Network | undefined
}

export type UseCytoscapeReturn = {
  elements: ElementDefinition[]
  failedToLoadGraph: boolean
  heightSize: number | undefined
  resetZoom: boolean | null
  setResetZoom: (resetZoom: boolean | null) => void
  setCytoscape: (ref: Cytoscape.Core | null) => void
  layout: CustomLayoutOptions
  setLayout: (layout: CustomLayoutOptions) => void
  cyPopperRef: React.MutableRefObject<PopperInstance | null>
  tokensStylesheets: Cytoscape.Stylesheet[]
}

export function useCytoscape(params: UseCytoscapeParams): UseCytoscapeReturn {
  const {
    txBatchData: { error, isLoading, txSettlement },
    networkId,
  } = params

  const [elements, setElements] = useState<ElementDefinition[]>([])
  const cytoscapeRef = useRef<Cytoscape.Core | null>(null)
  const cyPopperRef = useRef<PopperInstance | null>(null)
  const [resetZoom, setResetZoom] = useState<boolean | null>(null)
  const [layout, setLayout] = useState(layouts.grid)
  const { innerHeight } = useWindowSizes()
  const heightSize = innerHeight && innerHeight - HEIGHT_HEADER_FOOTER
  const [failedToLoadGraph, setFailedToLoadGraph] = useState(false)
  const [tokensStylesheets, setTokensStylesheets] = useState<Cytoscape.Stylesheet[]>([])

  const setCytoscape = useCallback(
    (ref: Cytoscape.Core) => {
      cytoscapeRef.current = ref
      ref.removeListener('resize')
      ref.on('resize', () => {
        updateLayout(ref, layout.name, true)
      })
    },
    [layout.name],
  )

  const stableTxSettlement = JSON.stringify(txSettlement)

  useEffect(() => {
    try {
      setFailedToLoadGraph(false)
      const cy = cytoscapeRef.current
      setElements([])
      if (error || isLoading || !networkId || !heightSize || !cy) return

      // TODO: use the new method when it doesn't have accounts
      const getNodesFn = txSettlement.contractTrades ? getNodesAlternative : getNodes
      const nodes = getNodesFn(txSettlement, networkId, heightSize, layout.name)

      setTokensStylesheets(getStylesheets(nodes))
      setElements(nodes)
      if (resetZoom) {
        updateLayout(cy, layout.name)
      }
      removePopper(cyPopperRef)
      setResetZoom(null)
    } catch (e) {
      console.error(`Failed to build graph`, e)
      setFailedToLoadGraph(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, isLoading, stableTxSettlement, networkId, heightSize, resetZoom, layout.name])

  useEffect(() => {
    const cy = cytoscapeRef.current
    if (!cy || !elements.length) return

    cy.on('mouseover touchstart', 'edge', (event): void => {
      const target = event.target
      const targetData: NodeDataDefinition | EdgeDataDefinition = target.data()

      bindPopper(event, targetData, cyPopperRef)
    })
    cy.on('mouseover', 'edge', (event): void => {
      event.target.addClass('hover')
      document.getElementById('tx-graph')?.classList.add('hover')
    })
    cy.on('mouseout', 'edge', (event): void => {
      event.target.removeClass('hover')
      document.getElementById('tx-graph')?.classList.remove('hover')
    })
    cy.on('mouseover', 'node', (event): void => {
      if (event.target.data('href')) {
        event.target.addClass('hover')
        document.getElementById('tx-graph')?.classList.add('hover')
      }
    })
    cy.on('mouseout', 'node', (event): void => {
      event.target.removeClass('hover')
      document.getElementById('tx-graph')?.classList.remove('hover')
    })
    cy.on('tap', 'node', (event): void => {
      const href = event.target.data('href')
      href && window.open(href, '_blank')
    })
    cy.nodes().noOverlap({ padding: 5 })

    return (): void => {
      cy.removeAllListeners()
      document.getElementById('tx-graph')?.classList.remove('hover')
      removePopper(cyPopperRef)
    }
  }, [cytoscapeRef, elements.length])

  return {
    failedToLoadGraph,
    heightSize,
    resetZoom,
    setResetZoom,
    setCytoscape,
    layout,
    setLayout,
    cyPopperRef,
    elements,
    tokensStylesheets,
  }
}

function getStylesheets(
  nodes: ElementDefinition[],
  // networkId: SupportedChainId,
): Stylesheet[] {
  const stylesheets: Stylesheet[] = []

  nodes.forEach((node) => {
    if (node.data.type === 'token') {
      // Right now unknown token image will only be used when the address is undefined
      // which is not likely
      // A way to deal with this would be to first fetch the image and when it fails set the fallback image
      const image = getImageUrl(node.data.address) || UnknownToken

      stylesheets.push({
        selector: `node[id="${node.data.id}"]`,
        style: {
          // It's in theory possible to pass multiple images as a fallback, but when that's done,
          // the image sizes are broken, going over the image bounds
          'background-image': `url("${image}")`,
          'background-color': 'white',
          'background-fit': 'contain',
          // These settings are not respected as far as I tried
          // 'background-width': 20,
          // 'background-height': 20,
        },
      })
    }
  })

  return stylesheets
}
