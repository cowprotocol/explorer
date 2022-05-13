import React, { Context, useContext } from 'react'
import styled, { css } from 'styled-components'
import { faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { media } from 'theme/styles/media'
import { TokensTableContext } from '../../TokensTableWidget/context/TokensTableContext'

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

const PaginationText = styled.p`
  margin-right: 0.8rem;
  &.legend {
    margin-left: 2rem;
  }
  ${media.mediumDown} {
    &:not(.legend) {
      display: none;
    }
  }
`

const Icon = styled(FontAwesomeIcon)`
  width: 2rem !important;
  height: 2rem;
  color: ${({ theme }): string => theme.textSecondary1};
  .fill {
    color: ${({ theme }): string => theme.textActive1};
  }
`
const PaginationButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  height: auto;
  outline: none;
  padding: 0;
  user-select: none;
  width: 3.5rem;
  white-space: nowrap;

  &:hover {
    .fill {
      color: ${({ theme }): string => theme.textActive1};
    }
  }

  &[disabled],
  &[disabled]:hover {
    cursor: not-allowed;
    opacity: 0.5;
    .fill {
      color: ${({ theme }): string => theme.textSecondary1};
    }
  }
`
PaginationButton.defaultProps = { disabled: true }

type PaginationProps<T> = {
  context: Context<T>
  fixedResultsPerPage?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TablePagination: React.FC<PaginationProps<any>> = () => {
  const {
    isLoading,
    tableState: { pageSize, pageOffset, hasNextPage, pageIndex, totalResults = -1 },
    handleNextPage,
    handlePreviousPage,
    data: rows,
  } = useContext(TokensTableContext)

  const renderPageLegend = (): string => {
    if (isLoading && !rows?.length) return '.. - ..'

    let startPageCount = 0
    let endPageCount = 0
    if (rows?.length) {
      startPageCount = pageOffset + 1
      endPageCount = pageOffset + rows.length
    }

    if (totalResults >= 0) {
      return `Page ${!totalResults ? 0 : pageIndex} of ${Math.ceil(totalResults / pageSize)}`
    }
    return `${startPageCount} - ${endPageCount}`
  }
  const hasPreviousPage = !isLoading && pageOffset > 0

  return (
    <PaginationWrapper>
      <PaginationText className="legend">{renderPageLegend()}</PaginationText>{' '}
      <PaginationButton disabled={!hasPreviousPage} onClick={handlePreviousPage}>
        <Icon icon={faChevronLeft} className="fill" />
      </PaginationButton>
      <PaginationButton disabled={!hasNextPage} onClick={handleNextPage}>
        <Icon icon={faChevronRight} className="fill" />
      </PaginationButton>
    </PaginationWrapper>
  )
}

export default TablePagination
