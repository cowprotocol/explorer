import React from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'

import { RawOrder } from 'api/operator'

import { SimpleTable } from 'components/common/SimpleTable'

// TODO: move to theme AAAAND pick color for white variant
const FONT_COLOR_DESCRIPTION = 'rgba(255, 255, 255, 0.9);';

const Table = styled(SimpleTable)`
  border: 0.1rem solid ${TABLE_BORDER_COLOR};
  border-radius: 0.4rem;

  > tbody > tr {
    grid-template-columns: 14rem auto;

    > td {
      justify-content: flex-start;

      &:first-of-type {
        font-weight: var(--font-weight-bold);

        /* Question mark */
        > svg {
          margin: 0 1rem 0 0;
        }

        /* Column after text on first column */
        ::after {
          content: ':';
        }
      }

      &:last-of-type {
        color: ${FONT_COLOR_DESCRIPTION};
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
