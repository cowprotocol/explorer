import React from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'

import { RawOrder } from 'api/operator'

import { SimpleTable } from 'components/common/SimpleTable'

// TODO: move to theme AAAAND pick color for white variant
const COLUMN_COLOR = '#252535'

const Table = styled(SimpleTable)`
  > tbody > tr {
    grid-template-columns: minmax(10rem, 25rem) auto;

    background: ${({ theme }): string => theme.bg2};
    border-right: 0.1em solid;
    border-color: ${COLUMN_COLOR};

    :first-of-type {
      /* border on top of the first row to close the table */
      border-top: 0.1rem solid ${COLUMN_COLOR};
    }

    &:last-of-type {
      /* Remove weird block at the end of the table */
      margin: 0;
    }

    > td {
      justify-content: flex-start;

      :first-of-type {
        /* First column same color as border */
        background: ${COLUMN_COLOR};

        /* Question mark */
        > svg {
          margin-right: 2rem;
        }

        /* Column after text on first column */
        ::after {
          content: ':';
        }
      }

      height: 5rem;

      :not(:first-of-type) {
        padding-left: 2.5rem;
      }
    }
  }
`

// TODO: use tooltip component once we have tooltips
const questionMark = <FontAwesomeIcon icon={faQuestionCircle} />

// TODO: either use a RichOrder object or transform it here
// TODO: for that we'll need token info (decimals, symbol)
export type Props = { order: RawOrder }

export function OrderDetails(props: Props): JSX.Element {
  const { order } = props
  const { uid } = order

  return (
    <Table
      body={
        <>
          <tr>
            <td>{questionMark}Order Id</td>
            <td>{uid}</td>
          </tr>
          <tr>
            <td>{questionMark}Sell order</td>
            <td>Swap 10 WETH for DAI</td>
          </tr>
          <tr>
            <td>{questionMark}Status</td>
            <td>TODO</td>
          </tr>
          <tr>
            <td>{questionMark}Fill Price</td>
            <td>TODO</td>
          </tr>
          <tr>
            <td>{questionMark}Filled</td>
            <td>TODO</td>
          </tr>
          <tr>
            <td>{questionMark}Submission Time</td>
            <td>TODO</td>
          </tr>
          <tr>
            <td>{questionMark}Limit Price</td>
            <td>TODO</td>
          </tr>
          <tr>
            <td>{questionMark}Expiration Time</td>
            <td>TODO</td>
          </tr>
          <tr>
            <td>{questionMark}Gas Fee</td>
            <td>TODO</td>
          </tr>
        </>
      }
    />
  )
}
