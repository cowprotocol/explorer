import styled from 'styled-components'
import { FoldableRowWrapper } from 'components/Layout/Card'

export const OrderRowWrapper = styled(FoldableRowWrapper)<{ $color?: string }>`
  color: ${({ $color = '' }): string => $color};

  &.pending {
    background: rgba(33, 141, 255, 0.1);
  }

  &.scheduled {
    background: rgba(0, 201, 167, 0.08);
  }

  .order-image-row {
    display: none;
  }

  .order-details-responsive {
    display: none;
  }

  .order-details {
    white-space: normal;
    word-break: break-word;
  }

  .sub-columns {
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
    align-items: center;

    > div:not(:last-child) {
      margin: 0 0.3rem 0 0;
    }
  }

  .pendingCell {
    justify-content: center;
    align-items: center;
    display: flex;

    a {
      top: 100%;
      position: absolute;
    }
  }

  &&&&& {
    td[data-label='Market'] {
      border-bottom: 0.1rem solid rgba(0, 0, 0, 0.14);
    }

    ${(props): string | false =>
      !props.$open &&
      `
        td[data-label='Price'] { 
          border: none; 
        }
      `}
  }
`

export const ResponsiveTitleRow = styled.td`
  // force first
  order: -1;

  > div:first-of-type {
    display: flex;
    justify-content: center;
    align-items: items;
  }
`
