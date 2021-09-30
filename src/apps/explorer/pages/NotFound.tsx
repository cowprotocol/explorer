import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { media } from 'theme/styles/media'

const Wrapper = styled.div`
  max-width: 118rem;
  margin: 0 auto;

  ${media.mediumDown} {
    max-width: 94rem;
    flex-flow: column wrap;
  }

  ${media.mobile} {
    max-width: 100%;
  }
`

const Title = styled.h1`
  margin: 4rem 0;
  font-weight: ${({ theme }): string => theme.fontBold};
`

const Content = styled.div`
  font-size: 16px;
  border: 0.1rem solid ${({ theme }): string => theme.borderPrimary};
  padding: 20px;
  border-radius: 0.4rem;
  min-height: 23rem;

  p {
    line-height: ${({ theme }): string => theme.fontLineHeight};
    overflow-wrap: break-word;
  }
`

const StyledLink = styled(Link)`
  height: 5rem;
  border: 1px solid ${({ theme }): string => theme.borderPrimary};
  border-radius: 0.6rem;
  width: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  cursor: pointer;
  color: ${({ theme }): string => theme.white} !important;

  :hover {
    background-color: ${({ theme }): string => theme.greyOpacity};
    text-decoration: none;
  }
`
const NotFound2: React.FC = () => (
  <Wrapper>
    <Title>Page not found</Title>
    <Content>
      <p>We&apos;re sorry, the page you requested could not be found.</p>
      <StyledLink to="/">home page</StyledLink>
    </Content>
  </Wrapper>
)

export default NotFound2
