import styled from 'styled-components'
import { media } from 'theme/styles/media'

export const WrapperPage = styled.div`
  padding: 1.6rem;
  margin: 0 auto;
  width: 100%;
  max-width: 140rem;

  ${media.mediumDown} {
    max-width: 94rem;
  }

  ${media.mobile} {
    max-width: 100%;
  }

  > h1 {
    display: flex;
    padding: 2.4rem 0 0.75rem;
    align-items: center;
    font-weight: ${({ theme }): string => theme.fontBold};
  }
`
