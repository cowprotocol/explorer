import React, { RefObject } from 'react'
import styled from 'styled-components'
import { useSmartTable } from './hooks'

const ResizableSpan = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  background: black;
  opacity: 0;
  width: 5%;
  cursor: col-resize;

  &:hover {
    opacity: 0.5;
  }

  transition: opacity 0.2s ease-in-out;
`

const ResizableWrapper = styled.th`
  &:hover > ${ResizableSpan} {
    opacity: 0.3;
  }
`

const ResizableHeaderRow: React.FC<{ className?: string }> = ({ children, className, ...restProps }) => (
  <ResizableWrapper className={className} {...restProps}>
    <ResizableSpan />
    {children}
  </ResizableWrapper>
)

const MIN_ROW_WIDTH_PX = 150

const CardTable = styled.table<{ $gridTemplateColumns?: string }>`
  border-collapse: collapse;
  min-width: 100%;

  display: grid;
  /* TODO: RECONSIDER DEFAULTS - TESTING */
  grid-template-columns: ${({ $gridTemplateColumns }): string =>
    $gridTemplateColumns || `repeat(3, minmax(${MIN_ROW_WIDTH_PX}px, 1fr))`};

  overflow-x: auto;

  thead,
  tbody,
  tr {
    display: contents;
  }

  th,
  td {
    padding: 15px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    text-align: left;
  }

  th {
    position: sticky;
    top: 0;
    font-weight: normal;

    /* TODO: RECONSIDER - TESTING */
    background: #6c7ae0;
    font-size: 1.1rem;
    color: white;
  }

  th:last-child {
    border: 0;
  }

  td {
    padding-top: 10px;
    padding-bottom: 10px;

    /* TODO: RECONSIDER - TESTING */
    color: #808080;
    /* TODO: REMOVE - TESTING */
    height: 12rem;
  }

  /* TODO: RECONSIDER - TESTING */
  tr:nth-child(even) td {
    background: #f8f6ff;
  }
`

export const SmartTable: React.FC<{ headerChildren: React.ReactNode[]; className?: string }> = (props) => {
  const { headerChildren = [], children, className } = props

  const { gridTemplateColumns, tableRef } = useSmartTable({
    minRowWidth: [150, 'px'],
    maxRowWidth: [1, 'fr'],
  })

  return (
    <CardTable
      ref={tableRef as RefObject<HTMLTableElement>}
      className={className}
      $gridTemplateColumns={gridTemplateColumns}
    >
      <thead>
        <tr>
          {headerChildren.map((row, index) => {
            const lastIndex = index === headerChildren.length - 1
            return lastIndex ? <th key={index}>{row}</th> : <ResizableHeaderRow key={index}>{row}</ResizableHeaderRow>
          })}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </CardTable>
  )
}

/* TODO: REMOVE - TESTING */
const HEADER = ['ROW 1', <span key="wow">WOW</span>, 'ROW 3']
export const ExampleSmartTable: React.FC = () => {
  return (
    <SmartTable headerChildren={HEADER}>
      <tr>
        <td>CONTENT 1</td>
        <td>CONTENT 1</td>
        <td>CONTENT 1</td>
      </tr>
      <tr>
        <td>CONTENT 1</td>
        <td>CONTENT 1</td>
        <td>CONTENT 1</td>
      </tr>
      <tr>
        <td>CONTENT 1</td>
        <td>CONTENT 1</td>
        <td>CONTENT 1</td>
      </tr>
      <tr>
        <td>CONTENT 1</td>
        <td>CONTENT 1</td>
        <td>CONTENT 1</td>
      </tr>
      <tr>
        <td>CONTENT 1</td>
        <td>CONTENT 1</td>
        <td>CONTENT 1</td>
      </tr>
      <tr>
        <td>CONTENT 1</td>
        <td>CONTENT 1</td>
        <td>CONTENT 1</td>
      </tr>
      <tr>
        <td>CONTENT 1</td>
        <td>CONTENT 1</td>
        <td>CONTENT 1</td>
      </tr>
      <tr>
        <td>CONTENT 1</td>
        <td>CONTENT 1</td>
        <td>CONTENT 1</td>
      </tr>
      <tr>
        <td>CONTENT 1</td>
        <td>CONTENT 1</td>
        <td>CONTENT 1</td>
      </tr>
      <tr>
        <td>CONTENT 1</td>
        <td>CONTENT 1</td>
        <td>CONTENT 1</td>
      </tr>
    </SmartTable>
  )
}

export default SmartTable
