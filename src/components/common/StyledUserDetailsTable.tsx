import styled from 'styled-components'

import { SimpleTable, Props as SimpleTableProps } from 'components/common/SimpleTable'

interface Props {
  showBorderTable?: boolean
}

export type StyledUserDetailsTableProps = SimpleTableProps & Props

const StyledUserDetailsTable = styled(SimpleTable)<StyledUserDetailsTableProps>`
  border: ${({ theme, showBorderTable }): string => (showBorderTable ? `0.1rem solid ${theme.borderPrimary}` : 'none')};
  border-radius: 0.4rem;

  tr td {
    &:not(:first-of-type) {
      text-align: left;
    }

    &.long {
      border-left: 0.2rem solid var(--color-long);
    }

    &.short {
      color: var(--color-short);
      border-left: 0.2rem solid var(--color-short);
    }
  }

  thead tr th {
    color: ${({ theme }): string => theme.textPrimary1};
    font-style: normal;
    font-weight: 800;
    font-size: 13px;
    line-height: 16px;
    height: 50px;
    border-bottom: ${({ theme }): string => `1px solid ${theme.borderPrimary}`};
    gap: 6px;
  }

  thead tr {
    width: 100%;
  }

  tbody tr:hover {
    backdrop-filter: contrast(0.9);
  }

  .span-copybtn-wrap {
    display: block;
  }

  span.wrap-datedisplay > span:last-of-type {
    display: flex;
  }
`

export const EmptyItemWrapper = styled.div`
  color: ${({ theme }): string => theme.textPrimary1};
  height: 100%;
  min-height: 15rem;
  align-items: center;
  justify-content: center;
  display: flex;
`

export default StyledUserDetailsTable
