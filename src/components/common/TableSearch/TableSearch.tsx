import React from 'react'
import styled from 'styled-components'
import { Wrapper, Input, SearchIcon } from 'apps/explorer/components/common/Search/Search.styled'
import { media } from 'theme/styles/media'

// assets
import searchImg from 'assets/img/search2.svg'

interface SearchProps {
  query: string
  setQuery: (query: string) => void
  placeholder?: string
}

const SearchWrapped = styled(Wrapper)`
  max-width: 400px;
  margin-left: 1.6rem;

  ${media.mobile} {
    margin-left: 0;
    max-width: 100%;
    display: flex;
    flex-direction: column;
  }
  ${SearchIcon} {
    width: 1.6rem;
    position: absolute;
    left: 2rem;
    top: 1.2rem;
  }
  ${Input} {
    height: 4rem;
    font-size: 1.5rem;
  }
`

export function TableSearch({
  query,
  setQuery,
  placeholder = 'Search token by name, symbol or hash',
}: SearchProps): JSX.Element {
  return (
    <SearchWrapped onSubmit={(e): void => e.preventDefault()}>
      <SearchIcon src={searchImg} />
      <Input
        autoComplete="off"
        type="search"
        name="query"
        value={query}
        onChange={(e): void => setQuery(e.target.value.trim())}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </SearchWrapped>
  )
}
