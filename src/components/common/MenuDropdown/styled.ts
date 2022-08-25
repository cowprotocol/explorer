import styled, { css, FlattenSimpleInterpolation } from 'styled-components/macro'
import { media } from 'theme/styles/media'

export const Wrapper = styled.div<{ isMobileMenuOpen: boolean }>`
  width: 100%;
  .mobile-menu {
    background: ${({ theme }): string => theme.bg2};
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: flex-start;
  }
  ${media.mobile} {
    grid-template-columns: unset;
    ${({ isMobileMenuOpen }): FlattenSimpleInterpolation | false =>
      isMobileMenuOpen &&
      css`
        position: absolute;
        top: 0;
        z-index: 3;

        &::before {
          content: '';
          width: 100%;
          display: flex;
          height: 60px;
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

  ${media.mobile} {
    display: flex;
    flex-flow: column wrap;
    align-items: center;
  }

  a {
    font-size: 1.6rem;
    font-weight: 600;
    appearance: none;
    outline: 0px;
    border-radius: 1.6rem;
    padding: 1.1rem 1.2rem;
    cursor: pointer;
    background: transparent;
    transition: background 0.15s ease-in-out 0s, color 0.15s ease-in-out 0s;
    color: ${({ theme }): string => theme.textSecondary2};
    :hover {
      background: ${({ theme }): string => theme.bg2};
      text-decoration: none;
      color: ${({ theme }): string => theme.textSecondary1};
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
    /* margin: 0.4rem; */
    padding: 0.8rem 1.2rem;
    border: 0;
    cursor: pointer;
    background: transparent;
    transition: background 0.15s ease-in-out 0s, color 0.15s ease-in-out 0s;
    color: ${({ theme }): string => theme.textSecondary2};

    &.expanded {
      border: none;
      background: ${({ theme }): string => theme.bg1};
    }

    &:hover {
      background: ${({ theme }): string => theme.bg2};
      color: ${({ theme }): string => theme.textSecondary1};
      &::after {
        content: '';
        display: block;
        position: absolute;
        height: 18px;
        width: 100%;
        bottom: -18px;
        left: 0;
        background: transparent;
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
  border-radius: 16px;
  background: ${({ theme }): string => theme.black};
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
  }

  > div {
    display: flex;
    flex-flow: column wrap;
  }
`

export const MenuTitle = styled.b`
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 600;
  opacity: 0.75;
  letter-spacing: 2px;
  display: flex;
  margin: 0 0 6px;
  color: ${({ theme }): string => theme.textSecondary2};
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

  a,
  button {
    display: flex;
    background: transparent;
    appearance: none;
    outline: 0;
    border: 0;
    cursor: pointer;
    font-size: 15px;
    white-space: nowrap;
    font-weight: 500;
    margin: 0;
    padding: 0;
    color: ${({ theme }): string => theme.textSecondary1};
    gap: 2.4rem;

    &:hover {
      text-decoration: underline;
      font-weight: 500;
    }

    &.ACTIVE {
      font-weight: bold;
    }
  }

  a > svg,
  a > img {
    width: 18px;
    height: auto;
    max-height: 21px;
    object-fit: contain;
    color: ${({ theme }): string => theme.textActive1};
  }

  a > svg > path {
    /* fill: ${({ theme }): string => theme.textSecondary1}; */
    fill: white;
  }
`
