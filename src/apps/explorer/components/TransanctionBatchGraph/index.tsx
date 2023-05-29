import Cytoscape from 'cytoscape'
import popper from 'cytoscape-popper'
import noOverlap from 'cytoscape-no-overlap'
import fcose from 'cytoscape-fcose'
import klay from 'cytoscape-klay'
import React from 'react'
import CytoscapeComponent from 'react-cytoscapejs'
import styled, { useTheme } from 'styled-components'
import {
  faRedo,
  faDiceOne,
  faDiceTwo,
  faDiceThree,
  faDiceFour,
  faDiceFive,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { GetTxBatchTradesResult as TxBatchData } from 'hooks/useTxBatchTrades'
import { Network } from 'types'
import { STYLESHEET, ResetButton, LayoutButton, DropdownWrapper, FloatingWrapper } from './styled'
import CowLoading from 'components/common/CowLoading'
import { media } from 'theme/styles/media'
import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import { layouts, LayoutNames } from './layouts'
import { DropdownOption, DropdownPosition } from 'apps/explorer/components/common/Dropdown'
import { removePopper } from 'apps/explorer/components/TransanctionBatchGraph/utils'
import { useCytoscape } from 'apps/explorer/components/TransanctionBatchGraph/hooks'

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
  txBatchData: TxBatchData
  networkId: Network | undefined
}

function DropdownButtonContent({
  layout,
  icon,
  open,
}: {
  layout: string
  icon: IconDefinition
  open?: boolean
}): JSX.Element {
  return (
    <>
      <FontAwesomeIcon icon={icon} />
      <span>Layout: {layout}</span>
      <span className={`arrow ${open && 'open'}`} />
    </>
  )
}

export function TransactionBatchGraph(params: GraphBatchTxParams): JSX.Element {
  const {
    txBatchData: { isLoading },
  } = params
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
  } = useCytoscape(params)

  const theme = useTheme()
  const currentLayoutIndex = Object.keys(LayoutNames).findIndex((nameLayout) => nameLayout === layout.name)

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
    <>
      <WrapperCytoscape
        elements={elements}
        layout={layout}
        style={{ width: '100%', height: heightSize }}
        stylesheet={STYLESHEET(theme)}
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
              <DropdownButtonContent icon={iconDice[currentLayoutIndex]} layout={LayoutNames[layout.name]} />
            }
            dropdownButtonContentOpened={
              <DropdownButtonContent icon={iconDice[currentLayoutIndex]} layout={LayoutNames[layout.name]} open />
            }
            callback={(): void => removePopper(cyPopperRef)}
            items={Object.values(LayoutNames).map((layoutName) => (
              <DropdownOption key={layoutName} onClick={(): void => setLayout(layouts[layoutName.toLowerCase()])}>
                {layoutName}
              </DropdownOption>
            ))}
            dropdownPosition={DropdownPosition.center}
          />
        </LayoutButton>
      </FloatingWrapper>
    </>
  )
}
