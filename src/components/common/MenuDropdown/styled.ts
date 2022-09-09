import styled, { css, FlattenSimpleInterpolation } from 'styled-components'
import { media } from 'theme/styles/media'
import Icon from 'components/Icon'

export const Wrapper = styled.div<{ isMobileMenuOpen: boolean }>`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  .mobile-menu {
    background: ${({ theme }): string => theme.bg4};
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: flex-start;
    ${media.mediumUp} {
      min-height: 0;
      flex-direction: inherit;
      background: transparent;
    }

    ${media.mobile} {
      gap: 0;
    }
  }
  ${media.mobile} {
    grid-template-columns: unset;
    ${({ isMobileMenuOpen }): FlattenSimpleInterpolation | false =>
      isMobileMenuOpen &&
      css`
        top: 0;
        z-index: 4;
        right: 0;
        &::before {
          content: '';
          width: 100%;
          display: flex;
          height: 6rem;
          background: transparent;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 101;
        }
      `}
  }
`

export const MenuContainer = styled.nav`
  display: flex;
  position: relative;
  justify-content: flex-end;
  gap: 2rem;

  ${media.mobile}, ${media.mediumOnly} {
    width: 100%;
    height: 100%;
    position: fixed;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: flex-start;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 3;
    outline: 0;
    padding: 8rem 0.8rem;
    overflow: hidden auto;
    display: none;
  }

  a {
    font-size: 1.6rem;
    font-weight: 600;
    appearance: none;
    outline: 0;
    border-radius: 1.6rem;
    padding: 1rem 1.2rem;
    cursor: pointer;
    background: transparent;
    transition: background 0.15s ease-in-out 0s, color 0.15s ease-in-out 0s;
    color: ${({ theme }): string => theme.textSecondary2};
    :hover {
      background: ${({ theme }): string => theme.bg2};
      text-decoration: none;
      color: ${({ theme }): string => theme.textSecondary1};
    }
    ${media.mobile} {
      width: 100%;
      border-bottom: 0.1rem solid ${({ theme }): string => theme.bg3};
      border-radius: 0;
      padding: 2.8rem 1rem;
      font-size: 1.8rem;
      :hover {
        background: none;
      }
    }
  }
`

export const MenuFlyout = styled.ol`
  display: flex;
  padding: 0;
  margin: 0;
  position: relative;
  justify-content: flex-end;

  ${media.mobile} {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  > button {
    font-size: 1.6rem;
    position: relative;
    border-radius: 1.6rem;
    display: flex;
    align-items: center;
    font-weight: 600;
    appearance: none;
    outline: 0;
    padding: 0.8rem 1.2rem;
    border: 0;
    cursor: pointer;
    background: transparent;
    transition: background 0.15s ease-in-out 0s, color 0.15s ease-in-out 0s;
    color: ${({ theme }): string => theme.textSecondary2};

    ${media.mobile} {
      width: 100%;
      border-bottom: 0.1rem solid ${({ theme }): string => theme.bg3};
      border-radius: 0;
      padding: 2.8rem 1rem;
      font-size: 1.8rem;
    }

    &.expanded {
      border: none;
    }

    &:hover {
      background: ${({ theme }): string => theme.bg2};
      color: ${({ theme }): string => theme.textSecondary1};
      ${media.mobile} {
        background: none;
      }
      &::after {
        content: '';
        display: block;
        position: absolute;
        height: 1.8rem;
        width: 100%;
        ${media.desktopLarge} {
          content: none;
        }
      }
    }

    > svg {
      margin: 0 0 0 0.3rem;
      width: 1.6rem;
      height: 0.6rem;
      object-fit: contain;
      ${media.mobile} {
        margin: 0 0 0 auto;
        height: 1rem;
      }
    }

    > svg.expanded {
      transition: transform 0.3s ease-in-out;
      transform: rotate(180deg);
    }

    svg > path {
      fill: ${({ theme }): string => theme.textSecondary2};
    }
    :hover > svg > path {
      fill: ${({ theme }): string => theme.textSecondary1};
    }
  }
`

export const Content = styled.div`
  display: flex;
  position: absolute;
  top: 100%;
  right: 0;
  border-radius: 1.6rem;
  background: ${({ theme }): string => theme.bg4};
  box-shadow: 0 1.2rem 1.8rem ${({ theme }): string => theme.bg3};
  padding: 3.2rem;
  gap: 6.2rem;
  margin: 1.2rem 0 0;

  ${media.mobile} {
    box-shadow: none;
    background: transparent;
    padding: 0;
    position: relative;
    top: initial;
    left: initial;
    border-radius: 0;
    display: flex;
    flex-flow: column wrap;
    margin: 1.2rem;
    gap: 3.6rem;
  }

  > div {
    display: flex;
    flex-flow: column wrap;
  }
`

export const MenuTitle = styled.b`
  font-size: 1.2rem;
  text-transform: uppercase;
  font-weight: 600;
  opacity: 0.75;
  letter-spacing: 0.2rem;
  display: flex;
  margin: 0 0 0.6rem;
  color: ${({ theme }): string => theme.textSecondary2};
  ${media.mobile} {
    display: none;
  }
`

export const MenuSection = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: flex-start;
  align-content: flex-start;
  justify-content: flex-start;
  justify-items: flex-start;
  margin: 0;
  gap: 2.4rem;
  ${media.mobile} {
    /* padding: 8px 10px 28px; */
    gap: 3.6rem;
    opacity: 0.7;
  }

  a,
  button {
    display: flex;
    background: transparent;
    appearance: none;
    outline: 0;
    border: 0;
    cursor: pointer;
    font-size: 1.5rem;
    white-space: nowrap;
    font-weight: 500;
    margin: 0;
    padding: 0;
    color: ${({ theme }): string => theme.textSecondary1};
    gap: 1.2rem;
    align-items: center;

    &:hover {
      text-decoration: underline;
      font-weight: 500;
      background: transparent;
    }

    &.ACTIVE {
      font-weight: bold;
    }
  }

  a > svg > path {
    fill: white;
  }
`

export const StyledIcon = styled(Icon)`
  background: transparent;
  padding: 0;
  margin: 0;
  opacity: 0.3;
`
