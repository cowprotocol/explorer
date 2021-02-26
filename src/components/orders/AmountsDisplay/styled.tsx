import styled from 'styled-components'

import TokenImg from 'components/common/TokenImg'

export const Wrapper = styled.div`
  display: grid;
  row-gap: 1rem;
  justify-items: start;
  align-items: center;
  grid-template-columns: 11rem auto;
  padding: 1.3rem 0;
`

export const RowTitle = styled.span`
  display: flex;
  align-items: center;
  font-weight: ${({ theme }): string => theme.fontBold};

  &::before {
    content: '▶';
    margin-right: 0.5rem;
    color: ${({ theme }): string => theme.grey};
    font-size: 0.75rem;
  }
`

export const RowContents = styled.span`
  display: flex;
  align-items: center;

  & > span:first-child {
    margin: 0 0.5rem 0 0;
  }

  & > :not(:first-child) {
    margin-left: 0.5rem;
  }
`

export const UsdAmount = styled.span`
  color: ${({ theme }): string => theme.textPrimary1};
  opacity: 0.5;
`

export const StyledImg = styled(TokenImg)`
  width: 1.6rem;
  height: 1.6rem;
  margin: 0 0.5rem;
`
