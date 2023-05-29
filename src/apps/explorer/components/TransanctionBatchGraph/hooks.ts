import React, { useCallback, useEffect, useRef, useState } from 'react'
import Cytoscape, { EdgeDataDefinition, ElementDefinition, NodeDataDefinition } from 'cytoscape'
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

  useEffect(() => {
    try {
      setFailedToLoadGraph(false)
      const cy = cytoscapeRef.current
      setElements([])
      if (error || isLoading || !networkId || !heightSize || !cy) return

      setElements(getNodes(txSettlement, networkId, heightSize, layout.name))
      if (resetZoom) {
        updateLayout(cy, layout.name)
      }
      removePopper(cyPopperRef)
      setResetZoom(null)
    } catch (e) {
      console.error(`Failed to build graph`, e)
      setFailedToLoadGraph(true)
    }
  }, [error, isLoading, txSettlement, networkId, heightSize, resetZoom, layout.name])

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
    })
    cy.on('mouseout', 'edge', (event): void => {
      event.target.removeClass('hover')
    })
    cy.nodes().noOverlap({ padding: 5 })

    return (): void => {
      cy.removeAllListeners()
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
  }
}
