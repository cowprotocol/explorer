import styled from 'styled-components'

import TokenImg from 'components/common/TokenImg'

export const Wrapper = styled.div`
  display: grid;
  row-gap: 1rem;
  justify-items: start;
  align-items: center;
  grid-template-columns: 10rem auto;
`

export const RowTitle = styled.span`
  ::before {
    content: '▶';
    margin-right: 0.5rem;
    color: ${({ theme }): string => theme.icon};
    font-size: 0.75rem;
  }

  font-weight: ${({ theme }): string => theme.fontBold};
`

export const RowContents = styled.span`
  display: flex;
  align-items: center;

  & > :first-child {
    margin: 0 0.5rem 0 0;
  }

  & > :not(:first-child) {
    margin-left: 0.5rem;
  }
`

export const UsdAmount = styled.span`
  color: ${({ theme }): string => theme.bgDisabled};
`

export const StyledImg = styled(TokenImg)`
  width: 1.6rem;
  height: 1.6rem;
`
