import React, { ReactElement } from 'react'

import { Network } from 'types'
import { ExternalLink } from 'components/analytics/ExternalLink'
import LogoWrapper, { LOGO_MAP } from 'components/common/LogoWrapper'

import { abbreviateString } from 'utils'

type BlockExplorerLinkType = 'tx' | 'address' | 'contract' | 'token' | 'event'

export interface Props {
  /**
   * type of BlockExplorerLink
   */
  type: BlockExplorerLinkType
  /**
   * address or transaction or other hash
   */
  identifier: string
  /**
   * network number | chain id
   */
  networkId?: number
  /**
   * label to replace textContent generated from identifier
   */
  label?: string | ReactElement | void

  /**
   * Use the URL as a label
   */
  useUrlAsLabel?: boolean
  /**
   * className to pass on to <a/>
   */
  className?: string // to allow subclassing styles with styled-components
  /**
   * to show explorer logo
   */
  showLogo?: boolean
}

function getEtherscanUrlPrefix(networkId: Network): string {
  return !networkId || networkId === Network.MAINNET ? '' : (Network[networkId] || '').toLowerCase() + '.'
}

function getEtherscanUrlSuffix(type: BlockExplorerLinkType, identifier: string): string {
  switch (type) {
    case 'tx':
      return `tx/${identifier}`
    case 'event':
      return `tx/${identifier}#eventlog`
    case 'address':
      return `address/${identifier}`
    case 'contract':
      return `address/${identifier}#code`
    case 'token':
      return `token/${identifier}`
  }
}

function getBlockscoutUrlPrefix(networkId: number): string {
  switch (networkId) {
    case Network.GNOSIS_CHAIN:
      return 'poa/xdai'

    default:
      return ''
  }
}

function getBlockscoutUrlSuffix(type: BlockExplorerLinkType, identifier: string): string {
  switch (type) {
    case 'tx':
      return `tx/${identifier}`
    case 'event':
      return `tx/${identifier}/logs`
    case 'address':
      return `address/${identifier}/transactions`
    case 'contract':
      return `address/${identifier}/contracts`
    case 'token':
      return `tokens/${identifier}/token-transfers`
  }
}

function getBlockscoutUrl(networkId: number, type: BlockExplorerLinkType, identifier: string): string {
  return `https://blockscout.com/${getBlockscoutUrlPrefix(networkId)}/${getBlockscoutUrlSuffix(type, identifier)}`
}

function getEtherscanUrl(networkId: number, type: BlockExplorerLinkType, identifier: string): string {
  return `https://${getEtherscanUrlPrefix(networkId)}etherscan.io/${getEtherscanUrlSuffix(type, identifier)}`
}

function getExplorerUrl(networkId: number, type: BlockExplorerLinkType, identifier: string): string {
  return networkId === Network.GNOSIS_CHAIN
    ? getBlockscoutUrl(networkId, type, identifier)
    : getEtherscanUrl(networkId, type, identifier)
}

/**
 * Dumb BlockExplorerLink, a pure UI component
 *
 * Does not make any assumptions regarding the network.
 * Expects all data as input. Does not use any hooks internally.
 */
export const BlockExplorerLink: React.FC<Props> = (props: Props) => {
  const { type, identifier, label: labelProp, useUrlAsLabel = false, className, networkId, showLogo = false } = props

  if (!networkId || !identifier) {
    return null
  }

  const url = getExplorerUrl(networkId, type, identifier)
  const label = labelProp || (useUrlAsLabel && url) || abbreviateString(identifier, 6, 4)

  return (
    <ExternalLink href={url} target="_blank" rel="noopener noreferrer" className={className}>
      <span>{label}</span>
      {showLogo && <LogoWrapper title="Open it on Etherscan" src={LOGO_MAP.etherscan} />}
    </ExternalLink>
  )
}
