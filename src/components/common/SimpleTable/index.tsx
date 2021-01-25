import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.table<{ $numColumns?: number }>`
  font-size: var(--font-size-default);
  background: var(--color-primary);

  height: 100%;
  width: 100%;

  margin: 0;
  padding: 0;
  box-sizing: border-box;
  border-spacing: 0;
  display: inline-grid;
  grid-template-areas:
    'head-fixed'
    'body-scrollable';

  > thead {
    grid-area: head-fixed;
    position: sticky;
    top: 0;
    height: auto;
    display: flex;
    align-items: center;

    > tr {
      color: var(--color-text-secondary2);
      display: grid;
      width: calc(100% - 0.6rem);

      > th {
        font-weight: var(--font-weight-normal);
        &:not(:first-of-type) {
          text-align: right;
        }
      }
    }
  }

  > tbody {
    grid-area: body-scrollable;
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
    box-sizing: border-box;
    padding: 0;

    > tr {
      display: grid;
      width: 100%;
      transition: background 0.1s ease-in-out;
      border-bottom: 0.1rem solid var(--color-border);
      &:hover {
        background: var(--color-text-hover);
        > td {
          color: var(--color-text-primary);
        }
      }

      &:last-of-type {
        margin: 0 0 5rem;
      }
    }
  }

  tr {
    text-align: left;
    padding: 0;

    > td {
      padding: 0;
      color: var(--color-text-secondary2);
      transition: color 0.1s ease-in-out;
      box-sizing: border-box;
    }

    align-items: center;
    ${({ $numColumns }): string => ($numColumns ? `grid-template-columns: repeat(${$numColumns}, 1fr);` : '')}

    > th, 
    > td {
      height: 3rem;
      display: flex;
      align-items: center;
      justify-content: flex-end;

      &:first-of-type {
        padding-left: 1rem;
        justify-content: flex-start;
      }
    }
  }
`

export type Props = {
  header: JSX.Element
  body: JSX.Element
  className?: string
  numColumns?: number
}

export const SimpleTable = ({ header, body, className, numColumns }: Props): JSX.Element => (
  <Wrapper $numColumns={numColumns} className={className}>
    <thead>{header}</thead>
    <tbody>{body}</tbody>
  </Wrapper>
)
