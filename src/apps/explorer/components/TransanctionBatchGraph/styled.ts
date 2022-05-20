import { Stylesheet } from 'cytoscape'
import styled, { DefaultTheme } from 'styled-components'

import TraderOtherIcon from 'assets/img/TraderOther.svg'
import CowProtocolIcon from 'assets/img/CoW.svg'
import DexIcon from 'assets/img/Dex.svg'

export const ResetButton = styled.button`
  cursor: pointer;
  background: transparent;
  color: white;
  height: 3rem;
  border: 1px solid white;
  padding: 0.5rem;
  border-radius: 0.5rem;
  position: absolute;
  right: 0;
  margin: 4rem;
`

export function STYLESHEET(theme: DefaultTheme): Stylesheet[] {
  return [
    {
      selector: 'node[label]',
      style: {
        label: 'data(label)',
        color: theme.textSecondary1,
        height: 50,
        width: 50,
        'background-color': theme.bg2,
      },
    },

    {
      selector: 'edge[label]',
      style: {
        label: 'data(label)',
        width: 2,
        'target-arrow-shape': 'triangle',
        'target-arrow-color': theme.grey,
        'curve-style': 'unbundled-bezier',
        color: theme.black,
        'line-color': theme.grey,
        'line-opacity': 0.8,
        'text-background-color': theme.labelTextOpen,
        'text-background-opacity': 1,
        'text-background-padding': '4px',
        'text-background-shape': 'roundrectangle',
        'font-size': '16px',
        'min-zoomed-font-size': 8,
      },
    },
    {
      selector: 'edge[label].many-bidirectional',
      style: {
        'curve-style': 'bezier',
        'font-size': '15px',
        'text-background-padding': '3px',
      },
    },
    {
      selector: 'edge[label].hover',
      style: {
        width: 3,
        'line-color': theme.orange1,
        'target-arrow-color': theme.orange1,
        'text-background-color': theme.orange,
        color: theme.white,
      },
    },
    {
      selector: 'node[type="trader"]',
      style: {
        'background-image': `url(${TraderOtherIcon})`,
        'text-valign': 'bottom',
        'text-margin-y': 8,
      },
    },
    {
      selector: 'node[type="dex"]',
      style: {
        'background-image': `url(${DexIcon})`,
        'text-max-width': '5rem',
        'text-valign': 'bottom',
        'text-margin-y': 8,
      },
    },
    {
      selector: 'node[type="cowProtocol"]',
      style: {
        'background-image': `url(${CowProtocolIcon})`,
        height: '90',
        width: '90',
        'text-valign': 'bottom',
        'text-margin-y': 8,
      },
    },
    {
      selector: 'node[type="networkNode"]',
      style: {
        'border-style': 'dashed',
        'border-opacity': 0.8,
      },
    },
  ]
}
