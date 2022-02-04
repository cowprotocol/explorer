import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { COLOURS } from 'styles'
import { media } from 'theme/styles/media'

const { fadedGreyishWhiteOpacity, white, gnosisChainColor } = COLOURS

export const SelectorContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  .arrow {
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: ${({ theme }): string => `5px solid ${theme.grey}`};
    transform: rotate(180deg);
    transition: transform 0.1s linear;
    &.open {
      transform: rotate(0deg);
      transition: transform 0.1s linear;
    }
  }
  ${media.xSmallDown} {
    padding-right: 2rem;
  }
`

export const OptionsContainer = styled.div<{ width: number }>`
  position: absolute;
  z-index: 1;
  margin: 0 auto;
  width: ${(props: { width: number }): string => `${184 + props.width}px`};
  height: 128px;
  left: 15px;
  top: 54px;
  background: ${({ theme }): string => theme.bg1};
  border: ${(): string => `1px solid ${fadedGreyishWhiteOpacity}`};
  box-sizing: border-box;
  border-radius: 6px;
`

export const Option = styled.div`
  display: flex;
  flex: 1;
  font-family: var(--font-avenir);
  font-weight: 800;
  font-size: 13px;
  line-height: 18px;
  align-items: center;
  letter-spacing: 0.02em;
  padding: 12px 16px;
  &:hover {
    backdrop-filter: contrast(0.9);
    .name {
      color: ${(): string => white};
    }
  }
  .name {
    color: ${({ theme }): string => theme.grey};
    &.selected {
      color: ${(): string => white};
    }
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 100%;
    margin-right: 9px;
    &.rinkeby {
      background: ${({ theme }): string => theme.yellow4};
    }
    &.gnosischain {
      background: ${(): string => gnosisChainColor};
    }
    &.ethereum {
      background: ${({ theme }): string => theme.blue4};
    }
  }
`

export const NetworkLabel = styled.span`
  border-radius: 0.6rem;
  display: flex;
  margin: 0 0.5rem;
  font-size: 1.1rem;
  text-align: center;
  padding: 0.7rem;
  text-transform: uppercase;
  font-weight: ${({ theme }): string => theme.fontBold};
  letter-spacing: 0.1rem;

  &.rinkeby {
    background: ${({ theme }): string => theme.yellow4};
    color: ${({ theme }): string => theme.black};
  }

  &.ethereum {
    background: ${({ theme }): string => theme.blue4};
    color: ${({ theme }): string => theme.textSecondary1};
  }

  &.gnosischain {
    background: ${(): string => `rgba(7,121,91,1.00);`};
    color: ${(): string => white};
  }
`

export const StyledFAIcon = styled(FontAwesomeIcon)`
  color: ${({ theme }): string => theme.orange};
  position: absolute;
  right: 10px;
  font-size: 14px;
`
