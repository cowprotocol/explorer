import React, { useState } from 'react'
import { Wrapper, Button, Input, SearchIcon } from './Search.styled'
import { useSearchSubmit } from 'hooks/useSearchSubmit'

// assets
import searchImg from 'assets/img/search2.svg'

export const Search: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [query, setQuery] = useState('')
  const handleSubmit = useSearchSubmit()
  const { className } = props

  return (
    <Wrapper
      onSubmit={(e): void => {
        e.preventDefault()
        handleSubmit(query)
      }}
      className={className}
    >
      <Button type="submit">
        <SearchIcon src={searchImg} />
      </Button>
      <Input
        autoComplete="off"
        type="search"
        name="query"
        value={query}
        onChange={(e): void => setQuery(e.target.value.trim())}
        placeholder="Search by Order ID / Address"
        aria-label="Search the GP explorer for orders, batches and transactions"
      />
    </Wrapper>
  )
}
