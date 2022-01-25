import styled from 'styled-components'
import { media } from 'theme/styles/media'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'

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

export const Wrapper = styled.div`
  padding: 1.6rem;
  margin: 0 auto;
  width: 100%;

  ${media.mediumDown} {
    max-width: 94rem;
  }

  ${media.mobile} {
    max-width: 100%;
  }
  > h1 {
    display: flex;
    padding: 2.4rem 0 2.35rem;
    align-items: center;
    font-weight: ${({ theme }): string => theme.fontBold};
  }
`

export const TitleAddress = styled(RowWithCopyButton)`
  font-size: ${({ theme }): string => theme.fontSizeDefault};
  font-weight: ${({ theme }): string => theme.fontNormal};
  margin: 0 0 0 1.5rem;
  display: flex;
  align-items: center;
  ${media.tinyDown} {
    font-size: 1.2rem;
  }
`
