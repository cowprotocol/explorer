import React, { useContext } from 'react'
import styled, { css } from 'styled-components'

import { Dropdown, DropdownOption } from 'apps/explorer/components/common/Dropdown'
import { OrdersTableContext } from './context/OrdersTableContext'

const PaginationTextCSS = css`
  color: ${({ theme }): string => theme.textPrimary1};
  font-size: ${({ theme }): string => theme.fontSizeDefault};
  font-weight: normal;
  white-space: nowrap;
`
const PaginationWrapper = styled.span`
  ${PaginationTextCSS}
  align-items: center;
  display: flex;
  justify-content: center;
  padding-right: 1.5rem;
`

const DropdownPagination = styled(Dropdown)`
  .dropdown-options {
    min-width: 60px;
  }
`
const PaginationDropdownButton = styled.button`
  ${PaginationTextCSS}
  background: none;
  border: none;
  white-space: nowrap;
  cursor: pointer;
  &.selected {
    background-color: transparent;
    cursor: not-allowed;
    opacity: 0.5;
    pointer-events: none;
  }
`

const PaginationText = styled.p`
  margin-right: 0.8rem;
`

const PaginationItem = styled(DropdownOption)`
  align-items: center;
  cursor: pointer;
  height: 32px;
  line-height: 1.2;
  padding: 0 1rem;
  white-space: nowrap;
`

const PaginationOrdersTable: React.FC = () => {
  const {
    isFirstLoading,
    tableState: { pageSize },
    setPageSize,
  } = useContext(OrdersTableContext)
  const quantityPerPage = [10, 20, 30, 50]

  return (
    <PaginationWrapper>
      <PaginationText>Rows per page:</PaginationText>
      <DropdownPagination
        disabled={isFirstLoading}
        dropdownButtonContent={<PaginationDropdownButton>{pageSize} ▼</PaginationDropdownButton>}
        dropdownButtonContentOpened={
          <PaginationDropdownButton className="selected">{pageSize} ▲</PaginationDropdownButton>
        }
        currentItem={quantityPerPage.findIndex((option) => option === pageSize)}
        items={quantityPerPage.map((pageOption) => (
          <PaginationItem key={pageOption} onClick={(): void => setPageSize(pageOption)}>
            {pageOption}
          </PaginationItem>
        ))}
      />
    </PaginationWrapper>
  )
}

export default PaginationOrdersTable
