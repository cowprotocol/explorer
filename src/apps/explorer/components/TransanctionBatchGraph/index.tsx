import Cytoscape from 'cytoscape'
import popper from 'cytoscape-popper'
import noOverlap from 'cytoscape-no-overlap'
import fcose from 'cytoscape-fcose'
import klay from 'cytoscape-klay'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import CytoscapeComponent from 'react-cytoscapejs'
import styled, { useTheme } from 'styled-components'
import {
  faDiceFive,
  faDiceFour,
  faDiceOne,
  faDiceThree,
  faDiceTwo,
  faRedo,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { buildContractBasedSettlement, BuildSettlementParams, buildTokenBasedSettlement } from './settlementBuilder'
import { Network } from 'types'
import { DropdownWrapper, FloatingWrapper, LayoutButton, ResetButton, STYLESHEET } from './styled'
import CowLoading from 'components/common/CowLoading'
import { media } from 'theme/styles/media'
import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import { LAYOUTS } from './layouts'
import { DropdownOption, DropdownPosition } from 'apps/explorer/components/common/Dropdown'
import { removePopper } from 'apps/explorer/components/TransanctionBatchGraph/utils'
import { useCytoscape } from 'apps/explorer/components/TransanctionBatchGraph/hooks'
import { useTransactionData } from 'hooks/useTransactionData'
import { Order } from 'api/operator'
import { useQuery } from 'hooks/useQuery'
import { useHistory } from 'react-router-dom'
import { usePrevious } from 'hooks/usePrevious'
import { GetTxBatchTradesResult, LayoutNames, ViewType } from 'apps/explorer/components/TransanctionBatchGraph/types'

Cytoscape.use(popper)
Cytoscape.use(noOverlap)
Cytoscape.use(fcose)
Cytoscape.use(klay)

const WrapperCytoscape = styled(CytoscapeComponent)`
  background-color: ${({ theme }): string => theme.bg1};
  font-weight: ${({ theme }): string => theme.fontMedium};
  border-radius: 0.6rem;
  ${media.mediumDown} {
    border: 0.1rem solid ${({ theme }): string => theme.borderPrimary};
    margin: 1.6rem 0;
  }
`
const iconDice = [faDiceOne, faDiceTwo, faDiceThree, faDiceFour, faDiceFive]

interface GraphBatchTxParams {
  orders: Order[] | undefined
  txHash: string
  networkId: Network | undefined
}

function DropdownButtonContent({
  label,
  icon,
  open,
}: {
  label: string
  icon: IconDefinition
  open?: boolean
}): JSX.Element {
  return (
    <>
      <FontAwesomeIcon icon={icon} />
      <span>{label}</span>
      <span className={`arrow ${open && 'open'}`} />
    </>
  )
}

const ViewTypeNames: Record<ViewType, string> = {
  [ViewType.CONTRACT]: 'Contract',
  [ViewType.TOKEN]: 'Token',
}

const DEFAULT_VIEW_TYPE = ViewType.CONTRACT
const DEFAULT_VIEW_NAME = ViewType[DEFAULT_VIEW_TYPE]

const VISUALIZATION_PARAM_NAME = 'vis'

function useQueryViewParams(): { visualization: string } {
  const query = useQuery()
  return { visualization: query.get(VISUALIZATION_PARAM_NAME)?.toUpperCase() || DEFAULT_VIEW_NAME }
}

function useUpdateVisQuery(): (vis: string) => void {
  const query = useQuery()
  const history = useHistory()

  // TODO: this is causing one extra re-render as the query is being updated when history is updated
  // TODO: make it not depend on query
  return useCallback(
    (vis: string) => {
      query.set(VISUALIZATION_PARAM_NAME, vis)
      history.replace({ search: query.toString() })
    },
    [history, query],
  )
}

function useTxBatchData(
  networkId: Network | undefined,
  orders: Order[] | undefined,
  txHash: string,
  visualization: ViewType,
): GetTxBatchTradesResult {
  const txData = useTransactionData(networkId, txHash)

  const tokens = useMemo(
    () =>
      orders?.reduce((acc, order) => {
        if (order.sellToken) acc[order.sellToken.address] = order.sellToken
        if (order.buyToken) acc[order.buyToken.address] = order.buyToken

        return acc
      }, {}) || {},
    [orders],
  )

  const txSettlement = useMemo(() => {
    const params: BuildSettlementParams = { networkId, tokens, txData, orders }

    return visualization === ViewType.TOKEN ? buildTokenBasedSettlement(params) : buildContractBasedSettlement(params)
  }, [networkId, orders, tokens, txData, visualization])

  return { txSettlement, error: txData.error, isLoading: txData.isLoading }
}

type UseVisualizationReturn = {
  visualization: ViewType
  onChangeVisualization: (vis: ViewType) => void
}

function useVisualization(): UseVisualizationReturn {
  const { visualization } = useQueryViewParams()

  const updateVisQuery = useUpdateVisQuery()

  const [visualizationViewSelected, setVisualizationViewSelected] = useState<ViewType>(
    ViewType[visualization] || DEFAULT_VIEW_TYPE,
  )

  const onChangeVisualization = useCallback((viewName: ViewType) => setVisualizationViewSelected(viewName), [])

  useEffect(() => {
    updateVisQuery(ViewType[visualizationViewSelected].toLowerCase())
  }, [updateVisQuery, visualizationViewSelected])

  return { visualization: visualizationViewSelected, onChangeVisualization }
}

export function TransactionBatchGraph(params: GraphBatchTxParams): JSX.Element {
  const { orders, networkId, txHash } = params
  const { visualization, onChangeVisualization } = useVisualization()

  const txBatchData = useTxBatchData(networkId, orders, txHash, visualization)

  const { isLoading } = txBatchData

  const {
    elements,
    failedToLoadGraph,
    heightSize,
    layout,
    setLayout,
    setResetZoom,
    resetZoom,
    setCytoscape,
    cyPopperRef,
    tokensStylesheets,
  } = useCytoscape({ networkId, txBatchData })

  const previousVisualization = usePrevious(visualization)

  const visualizationChanged = previousVisualization !== visualization

  useEffect(() => {
    if (visualizationChanged) {
      const layoutName = visualization === ViewType.CONTRACT ? 'fcose' : 'circle'
      setLayout(LAYOUTS[layoutName])
    }
  }, [setLayout, visualization, visualizationChanged])

  const theme = useTheme()
  const currentLayoutIndex = Object.keys(LayoutNames).findIndex((nameLayout) => nameLayout === layout.name)

  const stylesheet = useMemo(() => {
    return STYLESHEET(theme).concat(tokensStylesheets)
  }, [tokensStylesheets, theme])

  if (isLoading) {
    return (
      <EmptyItemWrapper>
        <CowLoading />
      </EmptyItemWrapper>
    )
  }

  if (failedToLoadGraph) {
    return (
      <EmptyItemWrapper>
        <p>Failed to load graph, please try again later</p>
      </EmptyItemWrapper>
    )
  }

  return (
    <div id="tx-graph" style={{ flex: 1 }}>
      <WrapperCytoscape
        elements={elements}
        layout={layout}
        style={{ width: '100%', height: heightSize }}
        stylesheet={stylesheet}
        cy={setCytoscape}
        wheelSensitivity={0.2}
        className="tx-graph"
        maxZoom={3}
        minZoom={0.1}
        zoom={1}
      />
      <FloatingWrapper>
        <ResetButton type="button" onClick={(): void => setResetZoom(!resetZoom)}>
          <FontAwesomeIcon icon={faRedo} /> <span>{layout.name === 'fcose' ? 'Re-arrange' : 'Reset'}</span>
        </ResetButton>
        <LayoutButton>
          <DropdownWrapper
            currentItem={currentLayoutIndex}
            dropdownButtonContent={
              <DropdownButtonContent
                icon={iconDice[currentLayoutIndex]}
                label={`Layout: ${LayoutNames[layout.name]}`}
              />
            }
            dropdownButtonContentOpened={
              <DropdownButtonContent
                icon={iconDice[currentLayoutIndex]}
                label={`Layout: ${LayoutNames[layout.name]}`}
                open
              />
            }
            callback={(): void => removePopper(cyPopperRef)}
            items={Object.values(LayoutNames).map((layoutName) => (
              <DropdownOption key={layoutName} onClick={(): void => setLayout(LAYOUTS[layoutName.toLowerCase()])}>
                {layoutName}
              </DropdownOption>
            ))}
            dropdownPosition={DropdownPosition.center}
          />
        </LayoutButton>
        <LayoutButton>
          <DropdownWrapper
            currentItem={visualization}
            dropdownButtonContent={
              <DropdownButtonContent
                icon={iconDice[visualization]}
                label={`Visualization: ${ViewTypeNames[visualization]}`}
              />
            }
            dropdownButtonContentOpened={
              <DropdownButtonContent
                icon={iconDice[visualization]}
                label={`Visualization: ${ViewTypeNames[visualization]}`}
                open
              />
            }
            callback={(): void => removePopper(cyPopperRef)}
            items={Object.keys(ViewTypeNames).map((viewType) => (
              <DropdownOption key={viewType} onClick={(): void => onChangeVisualization(Number(viewType))}>
                {ViewTypeNames[viewType]}
              </DropdownOption>
            ))}
            dropdownPosition={DropdownPosition.center}
          />
        </LayoutButton>
      </FloatingWrapper>
    </div>
  )
}
