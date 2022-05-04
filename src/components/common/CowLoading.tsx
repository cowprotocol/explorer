import React from 'react'
import styled, { keyframes } from 'styled-components'
import SVG from 'react-inlinesvg'
import CowLoadingSVG from 'assets/img/cowLoading.svg'

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
  .cowHead {
    animation: ${CowBounce} 1.5s infinite ease-in-out;
    animation-delay: -1s;
    fill: ${({ theme }): string => theme.white};
    opacity: 0.4;
  }
  .eyesBg {
    fill: ${({ theme }): string => theme.bg1};
    opacity: 1;
  }
  .eyes {
    fill: ${({ theme }): string => theme.orange};
    animation: ${EyesOpacity} 1.5s ease-in-out infinite;
    filter: blur(1px);
  }
`

export const CowLoading: React.FC = () => (
  <WrapperCenter>
    <StyledCowLoading src={CowLoadingSVG} />
  </WrapperCenter>
)

export default CowLoading
