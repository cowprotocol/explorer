import React from 'react'
import styled from 'styled-components'
import { media } from 'theme/styles/media'
import { getGpV2ContractAddress } from 'utils/contract'

// Components
import { BlockExplorerLink } from 'apps/gp-v1/components/common/BlockExplorerLink'

// Hooks
import { useWalletConnection } from 'hooks/useWalletConnection'

// Config
import { footerConfig } from '../Footer/config'

const FooterStyled = styled.footer`
  display: flex;
  align-items: center;
  box-sizing: border-box;
  font-size: 1.2rem;
  padding: 2.4rem 1.6rem 4rem;
  flex: 1 1 auto;
  color: ${({ theme }): string => theme.textSecondary2};
  width: 100%;
  max-width: 140rem;
  justify-content: space-between;
  margin: 0 auto;

  ${media.mediumDown} {
    max-width: 94rem;
  }

  ${media.mobile} {
    max-width: 100%;
    flex-flow: column wrap;
  }

  > a {
    text-decoration: none;

    &:hover {
      text-decoration: underline;
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

  ${media.mobile} {
    margin: 0 0 1.6rem;
  }
`

const ContractsWrapper = styled.div`
  display: flex;

  > :first-child {
    margin-right: 1rem;
  }
`

const VerifiedButton = styled(BlockExplorerLink)`
  margin: 0;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0;

  ${media.mobile} {
    margin: 0 0 1.6rem;
  }
`

const VersionsWrapper = styled.div`
  display: flex;
  margin: 0 0 0 auto;
  align-items: center;
  padding: 0 0 0 1rem;
  height: 100%;

  ${media.mobile} {
    margin: 0 0 1.6rem;
  }

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
  const { isBeta = footerConfig.isBeta, url = footerConfig.url } = props
  const { networkIdOrDefault: networkId } = useWalletConnection()
  const settlementContractAddress = getGpV2ContractAddress(networkId, 'GPv2Settlement')
  const allowanceManagerContractAddress = getGpV2ContractAddress(networkId, 'GPv2AllowanceManager')

  return (
    <FooterStyled>
      <BetaWrapper>{isBeta && 'This project is in beta. Use at your own risk.'}</BetaWrapper>
      <ContractsWrapper>
        {settlementContractAddress ? (
          <VerifiedButton
            type="contract"
            identifier={settlementContractAddress}
            networkId={networkId}
            label={'View settlement contract'}
          />
        ) : null}
        {allowanceManagerContractAddress ? (
          <VerifiedButton
            type="contract"
            identifier={allowanceManagerContractAddress}
            networkId={networkId}
            label={'View allowance manager contract'}
          />
        ) : null}
      </ContractsWrapper>
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
