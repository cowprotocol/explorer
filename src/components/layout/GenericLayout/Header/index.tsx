import React, { PropsWithChildren } from 'react'
import styled from 'styled-components'
import { media } from 'theme/styles/media'

import { Link } from 'react-router-dom'

// Assets
import LogoImage from 'assets/img/logo-v2.svg'

const HeaderStyled = styled.header`
  height: auto;
  margin: 2.2rem auto 0;
  position: relative;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 0 1.6rem;
  max-width: 140rem;

  ${media.mediumDown} {
    max-width: 94rem;
  }

  ${media.mobile} {
    max-width: 100%;
  }
`

const Logo = styled(Link)`
  height: 2.8rem;
  padding: 0;
  display: flex;
  align-content: center;
  justify-content: center;

  &:hover {
    text-decoration: none;
  }

  > img {
    transform: perspective(20rem) rotateY(0);
    transform-style: preserve-3d;
    transition: transform 1s ease-in-out;

    &:hover {
      animation-name: spin;
      animation-duration: 4s;
      animation-iteration-count: infinite;
      animation-delay: 0.3s;
    }

    background: url(${LogoImage}) no-repeat center/contain;
    border: 0;
    object-fit: contain;
    width: inherit;
    height: inherit;
    margin: auto;
  }

  > span {
    margin: 0 0 0 1rem;
    display: flex;
    align-content: center;
    justify-content: center;
    color: ${({ theme }): string => theme.textPrimary1};
  }

  @keyframes spin {
    0% {
      transform: perspective(20rem) rotateY(0);
    }
    30% {
      transform: perspective(20rem) rotateY(200deg);
    }
    100% {
      transform: perspective(20rem) rotateY(720deg);
    }
  }
`

type Props = PropsWithChildren<{
  label?: React.ReactNode
  linkTo?: string
  logoAlt?: string
}>

export const Header: React.FC<Props> = ({ children, linkTo, logoAlt, label }) => (
  <HeaderStyled>
    <Logo to={linkTo || '/'}>
      <img src={LogoImage} alt={logoAlt || 'Trading interface homepage'} />
      {label && <span>{label}</span>}
    </Logo>
    {children}
  </HeaderStyled>
)
