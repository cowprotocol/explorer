import styled, { keyframes } from 'styled-components'
import { media } from 'theme/styles/media'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import * as CSS from 'csstype'
import { Link } from 'react-router-dom'
import SVG from 'react-inlinesvg'

export const Wrapper = styled.div`
  padding: 1.6rem;
  margin: 0 auto;
  width: 100%;
  flex-grow: 1;

  ${media.mediumDown} {
    max-width: 94rem;
  }

  ${media.mobile} {
    max-width: 100%;
  }

  > h1 {
    display: flex;
    padding: 2.4rem 0;
    align-items: center;
    font-weight: ${({ theme }): string => theme.fontBold};
    margin: 0;
  }
`

export const WrapperCenter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`

const CowBounce = keyframes`
  0%,
    100% {
      transform: scale(0.95);
    }
    50% {
      transform: scale(1);
    }
`

const EyesOpacity = keyframes`
  from {
      opacity: 1;
    }
    30% {
      opacity: 0.3;
    }

    to {
      opacity: 1;
    }
`

export const StyledCowLoading = styled(SVG)`
  #cow-loading {
    animation: ${CowBounce} 1.5s infinite ease-in-out;
    animation-delay: -1s;
  }
  #cow-head {
    fill: ${({ theme }): string => theme.white};
    opacity: 0.4;
  }
  #eyes-bg {
    fill: ${({ theme }): string => theme.bg1};
    opacity: 1;
  }
  #eyes {
    fill: ${({ theme }): string => theme.yellow4};
    animation: ${EyesOpacity} 1.5s ease-in-out infinite;
    filter: blur(1px);
  }
`

export const StyledTabLoader = styled.span`
  padding-left: 4px;
`

export const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  ${media.mobile} {
    flex-direction: column;
    align-items: flex-start;
  }
`

export const FlexContainerVar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  margin: 2.4rem 0;

  ${media.mobile} {
    /* margin: 0 0 0 1.5rem; */
    span:nth-child(1) {
      margin: 0 0 0 1.5rem;
    }
  }
`

export const TitleAddress = styled(RowWithCopyButton)`
  font-size: ${({ theme }): string => theme.fontSizeDefault};
  font-weight: ${({ theme }): string => theme.fontNormal};
  margin: 0 0 0 1.5rem;
  ${media.mobile} {
    font-size: 1.2rem;
    margin: 0 0 1.5rem 0;
  }
  a {
    display: flex;
    align-items: center;
  }
`

export const FlexWrap = styled.div<Partial<CSS.Properties & { grow?: number }>>`
  display: flex;
  align-items: center;
  flex-grow: ${({ grow }): string => `${grow}` || '0'};
`

export const StyledLink = styled(Link)`
  height: 5rem;
  border: 0.1rem solid ${({ theme }): string => theme.borderPrimary};
  border-radius: 0.6rem;
  width: 16rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 1 auto;
  cursor: pointer;
  color: ${({ theme }): string => theme.white} !important;

  :hover {
    background-color: ${({ theme }): string => theme.greyOpacity};
    text-decoration: none;
  }
`

export const Title = styled.h1`
  margin: 2.4rem 0;
  font-weight: ${({ theme }): string => theme.fontBold};
`

export const BVButton = styled.a`
  color: ${({ theme }): string => theme.orange};
  font-size: 1.3rem;
  margin-left: auto;
  svg {
    margin: 0 0.75rem 0 0;
  }
  ${media.mobile} {
    margin: -3rem 0 1.5rem auto;
  }
`

export const ContentCard = styled.div`
  font-size: 1.6rem;
  border: 0.1rem solid ${({ theme }): string => theme.borderPrimary};
  padding: 20px;
  border-radius: 0.4rem;
  min-height: 23rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  p {
    line-height: ${({ theme }): string => theme.fontLineHeight};
    overflow-wrap: break-word;
  }
`
