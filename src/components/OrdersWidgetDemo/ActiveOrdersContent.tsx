import React from 'react'
import styled from 'styled-components'
import { SimpleTable } from 'components/common/SimpleTable'

const Table = styled(SimpleTable)`
  padding: 0 1rem 3rem;
  margin: 1rem 0 0;

  tr > th:not(:first-of-type),
  tr > td:not(:first-of-type) {
    justify-content: flex-end;
  }

  tr > td {

    &.long {
      color: var(--color-long);
      border-left: 0.2rem solid var(--color-long);
    }

    &.short {
      color: var(--color-short);
      border-left: 0.2rem solid var(--color-short);
    }
  }

  > thead > tr,
  > tbody > tr {
    grid-template-columns: 5rem minmax(14rem, 1fr) repeat(5, 1fr) 7rem;
  }
`

const CancelledOrderButton = styled.button`
  appearance: none;
  background: none;
  border: 0;
  color: var(--color-text-primary);
  cursor: pointer;
`

const HEADER = (
  <tr>
    <th>Side</th>
    <th>Date</th>
    <th>Pair</th>
    <th>Limit price</th>
    <th>Amount WETH</th>
    <th>Filled WETH</th>
    <th>Expires</th>
    <th>Status</th>
  </tr>
)

const BODY = (
  <>
    {[...Array(30).keys()].map((i) => (
      <tr key={i}>
        <td className={i % 2 === 1 ? 'long' : 'short'}>{i % 2 === 1 ? 'Buy' : 'Sell'}</td>
        <td>01-10-2020 17:45:{i}2</td>
        <td>WETH/USDT</td>
        <td>370.96</td>
        <td>
          {i}.0{i}
        </td>
        <td>{i}</td>
        <td>Never</td>
        <td className="action">
          Active <CancelledOrderButton>✕</CancelledOrderButton>
        </td>
      </tr>
    ))}
  </>
)

export const ActiveOrdersContent: React.FC = () => {
  return <Table header={HEADER} body={BODY} />
}
