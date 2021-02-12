import React from 'react'
import styled from 'styled-components'
import { depositApi } from 'apps/gp-v1/api'

// Components
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'

// Hooks
import { useWalletConnection } from 'hooks/useWalletConnection'

// Config
import { footerConfig } from '../Footer/config'

const FooterStyled = styled.footer`
  position: fixed;
  font-size: 1.1rem;
  bottom: 0;
  height: 3rem;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 0 1rem;
  border-top: 0.1rem solid var(--color-border);
  flex: 1 1 auto;
  color: ${({ theme }): string => theme.textSecondary2};
  background: ${({ theme }): string => theme.bg1};
  width: 100%;
  justify-content: space-between;

  & a {
    color: inherit;
    text-decoration: none;
    transition: color 0.2s ease-in-out;

    &:hover {
      color: ${({ theme }): string => theme.white};
    }
  }
`

const BetaWrapper = styled.div`
  display: flex;
  margin: 0;
  height: 100%;
  align-items: center;
  padding: 0 1rem 0 0;
  position: relative;
  border-right: 0.1rem solid ${({ theme }): string => theme.borderPrimary};
`

const VerifiedButton = styled(BlockExplorerLink)`
  margin: 0;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 1rem;
  border-right: 0.1rem solid ${({ theme }): string => theme.borderPrimary};
`

const VersionsWrapper = styled.div`
  display: flex;
  margin: 0 0 0 auto;
  align-items: center;
  padding: 0 0 0 1rem;
  height: 100%;
  border-left: 0.1rem solid ${({ theme }): string => theme.borderPrimary};

  > a:not(:last-of-type) {
    margin: 0 1rem 0 0;
    flex-flow: row nowrap;
    display: flex;
    position: relative;
  }
`
export interface FooterType {
  readonly verifiedText?: string
  readonly isBeta?: boolean
  readonly url?: {
    readonly web: string
    readonly appId: string
    readonly contracts: string
  }
}

export const Footer: React.FC<FooterType> = (props) => {
  const { verifiedText = footerConfig.verifiedText, isBeta = footerConfig.isBeta, url = footerConfig.url } = props
  const { networkIdOrDefault: networkId } = useWalletConnection()
  const contractAddress = depositApi.getContractAddress(networkId)

  return (
    <FooterStyled>
      <BetaWrapper>{isBeta && 'This project is in beta. Use at your own risk.'}</BetaWrapper>
      {contractAddress && networkId ? (
        <VerifiedButton
          type="contract"
          identifier={contractAddress}
          networkId={networkId}
          label={verifiedText ? verifiedText : 'View contract'}
        />
      ) : null}
      <VersionsWrapper>
        {url.web && VERSION ? (
          <a target="_blank" rel="noopener noreferrer" href={url.web + VERSION}>
            Web: v{VERSION}
          </a>
        ) : null}
        {CONFIG.appId ? (
          <a target="_blank" rel="noopener noreferrer" href={url.appId ?? '#'}>
            App Id: {CONFIG.appId}
          </a>
        ) : null}
        {url.contracts && CONTRACT_VERSION ? (
          <a target="_blank" rel="noopener noreferrer" href={url.contracts + CONTRACT_VERSION}>
            Contracts: v{CONTRACT_VERSION}
          </a>
        ) : null}
      </VersionsWrapper>
    </FooterStyled>
  )
}
