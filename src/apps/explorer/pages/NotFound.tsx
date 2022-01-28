import React from 'react'
import styled from 'styled-components'
import { ContentCard as Content, StyledLink, Title, Wrapper as WrapperTemplate } from 'apps/explorer/pages/styled'

import { getNetworkFromId } from '@gnosis.pm/dex-js'
import { useNetworkId } from 'state/network'
import { media } from 'theme/styles/media'

const Wrapper = styled(WrapperTemplate)`
  max-width: 118rem;

  ${media.mediumDown} {
    flex-flow: column wrap;
  }
`

const NotFoundRequestPage: React.FC = () => {
  const networkId = useNetworkId() || 1
  const network = networkId !== 1 ? getNetworkFromId(networkId).toLowerCase() : ''

  return (
    <Wrapper>
      <Title>Page not found</Title>
      <Content>
        <p>We&apos;re sorry, the page you requested could not be found.</p>
        <StyledLink to={`/${network}`}>Back Home</StyledLink>
      </Content>
    </Wrapper>
  )
}

export default NotFoundRequestPage
