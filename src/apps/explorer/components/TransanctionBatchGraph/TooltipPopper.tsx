import React from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import Cytoscape, { EventObject } from 'cytoscape'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import { TokenDisplay } from 'components/common/TokenDisplay'
import { Network } from 'types'

export interface PopperInstance {
  scheduleUpdate: () => void
  destroy: () => void
}

/**
 * This allow bind a tooltip (popper.js) around to a cytoscape elements (node, edge)
 */
export function bindPopper(
  event: EventObject,
  targetData: Cytoscape.NodeDataDefinition | Cytoscape.EdgeDataDefinition,
  popperRef: React.MutableRefObject<PopperInstance | null>,
): void {
  const tooltipId = `popper-target-${targetData.id}`
  const popperClassTarget = 'target-popper'

  // Remove if already existing
  const existingTooltips: HTMLCollectionOf<Element> = document.getElementsByClassName(popperClassTarget)
  Array.from(existingTooltips).forEach((ele: { remove: () => void }): void => ele && ele.remove())

  const target = event.target
  popperRef.current = target.popper({
    content: () => {
      const tooltip = document.createElement('span')
      tooltip.id = tooltipId
      tooltip.classList.add(popperClassTarget)

      ReactDOM.render(<TooltipPopper tooltipData={targetData.tooltip} />, tooltip)
      document.body.appendChild(tooltip)

      return tooltip
    },
    popper: {
      placement: 'top-start',
      removeOnDestroy: true,
    },
  }) as PopperInstance

  const popperUpdate = (): void => popperRef.current?.scheduleUpdate()

  target.on('position', () => popperUpdate)
  target.cy().removeListener('pan zoom')
  target.cy().on('pan zoom resize', () => popperUpdate)
  const newTarget = document.getElementById(tooltipId)
  target
    .on('click tapstart', () => {
      if (newTarget) {
        newTarget.classList.add('active')
      }
    })
    .on('mouseout tapend', () => {
      if (newTarget) {
        newTarget.remove()
      }
      popperRef.current?.destroy()
    })
}

const Wrapper = styled.span`
  tr > td:first-child {
    font-weight: bold;
    text-transform: uppercase;
    width: 6rem;
  }
`
const AmountDisplay = styled.span`
  margin: 0;
  display: flex;
  flex-wrap: wrap;
`

interface TooltipPopperProps {
  from: string
  to: string
  amount: string
  token: TokenErc20
  networkId: Network
}

function TooltipPopper({ tooltipData }: { tooltipData: TooltipPopperProps }): JSX.Element {
  const { from, to, token, amount, networkId } = tooltipData
  const [tokenAmount] = amount.split(' ')

  return (
    <Wrapper>
      <table>
        <tbody>
          <tr>
            <td>FROM</td>
            <td>{from}</td>
          </tr>
          <tr>
            <td>TO</td>
            <td>{to}</td>
          </tr>
          <tr>
            <td>AMOUNT</td>
            <td>
              <AmountDisplay>
                {tokenAmount} {<TokenDisplay showAbbreviated erc20={token} network={networkId} />}
              </AmountDisplay>
            </td>
          </tr>
        </tbody>
      </table>
    </Wrapper>
  )
}
