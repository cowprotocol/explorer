import React from 'react'
import styled, { keyframes } from 'styled-components'
// import SVG from 'react-inlinesvg'
// import CowLoadingSVG from 'assets/img/cowLoading.svg'

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

export const StyledCowLoading = styled.svg`
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
  /* animation: ${CowBounce} 1.5s infinite ease-in-out;
  animation-delay: -1s;
  path:nth-child(1) {
    fill: ${({ theme }): string => theme.white};
    opacity: 0.4;
  }
  path:nth-child(2) {
    fill: ${({ theme }): string => theme.bg1};
    opacity: 1;
  }
  path:nth-child(3) {
    fill: ${({ theme }): string => theme.orange};
    animation: ${EyesOpacity} 1.5s ease-in-out infinite;
    filter: blur(1px);
  } */
`

export const CowLoading: React.FC = () => (
  <WrapperCenter>
    <StyledCowLoading>
      <path
        className="cowHead"
        d="M38.5553 11.5185L32.2056 10.4831L37.0544 8.46012L38.1487 4.09164L36.8693 1.82363L30.6177 0L33.8002 4.55249L33.8189 4.5794L31.3395 5.1979L25.2086 0.995857L20.0072 1.61325L14.8052 0.995857L8.67431 5.1979L6.19484 4.5794L6.21357 4.55249L9.39611 0L3.14507 1.82363L1.8552 4.09164L2.94782 8.46012L7.79657 10.4831L1.44691 11.5185L0 15.4141L4.35286 17.514L8.46603 16.0666L9.0578 20.4477L11.7637 26.736L13.0801 30.1476L19.4501 34.6128L19.9917 34.9923V35H19.9961L20.0017 34.9962L20.0072 35H20.011V34.9923L20.5527 34.6128L26.9227 30.1476L28.239 26.736L30.9428 20.4477L31.534 16.0666L35.6471 17.514L40 15.4141L38.5553 11.5185ZM3.56714 2.36578L7.82247 1.12439L5.51326 4.4267L2.69767 3.90708L3.56714 2.36578ZM2.63045 4.54425L5.10992 5.00181L3.36547 7.4736L2.63045 4.54425ZM8.41589 15.4113L4.39914 16.8236L0.808863 15.0917L1.92463 12.0892L8.41589 11.0302V15.4113ZM8.41589 10.0465L3.71756 8.08605L5.79646 5.14132L8.41148 5.79443L8.41589 10.0465ZM26.3105 11.7569L25.7045 13.7838H14.3033L13.6972 11.7569L20.0017 2.67557L26.3105 11.7569ZM20.2529 20.0429H16.1475L14.5027 14.4226H25.5011L23.8564 20.0429H20.2529ZM23.6652 20.6801L21.6265 26.0675L20.0055 27.3968L18.3839 26.0675L16.3453 20.6801H23.6652ZM9.05229 9.30986V5.71258L14.9639 1.66104L19.5339 2.20319L19.5642 2.20648L19.5509 2.21967L13.1258 11.4224L9.05229 9.30986ZM12.3583 26.4954L9.68428 20.2764L9.08756 15.8733L13.8939 14.6182L15.5656 20.3346L14.2124 23.1546L12.3891 26.5767L12.3583 26.4954ZM12.6944 27.366L14.5975 23.7957L19.5014 27.8175L19.3361 27.9521L13.5363 29.5582L12.6944 27.366ZM20.0028 34.2184L14.0834 30.0696L20.0028 28.43L25.9215 30.0696L20.0028 34.2184ZM26.4654 29.5571L20.6656 27.951L20.5003 27.8164L25.4042 23.7945L27.3073 27.3649L26.4654 29.5571ZM30.3223 20.2742L27.6484 26.4932L27.617 26.5745L25.7937 23.1524L24.4366 20.3346L26.1089 14.6182L30.9152 15.8733L30.3223 20.2742ZM30.9516 9.30986L26.8781 11.4224L20.4529 2.21967L20.4397 2.20648L20.47 2.20319L25.0399 1.66104L30.9516 5.71258V9.30986ZM36.6411 7.4725L34.8967 5.00071L37.3762 4.54315L36.6411 7.4725ZM32.183 1.12549L36.4384 2.36687L37.3078 3.90817L34.4923 4.4278L32.183 1.12549ZM31.5924 5.79443L34.2118 5.14187L36.2907 8.0866L31.5924 10.047V5.79443ZM35.6097 16.8241L31.5924 15.4119V11.0302L38.0836 12.0892L39.1994 15.0917L35.6097 16.8241Z"
      />
      <path className="eyesBg" d="M9 15V10.5L13 12L13.5 14L9 15Z" />
      <path className="eyesBg" d="M30.969 15.0164V10.5164L26.969 12.0164L26.469 14.0164L30.969 15.0164Z" />
      <path className="eyes" d="M9 15V10.5L13 12L13.5 14L9 15Z" />
      <path className="eyes" d="M30.969 15.0164V10.5164L26.969 12.0164L26.469 14.0164L30.969 15.0164Z" />
    </StyledCowLoading>
  </WrapperCenter>
)

export default CowLoading
