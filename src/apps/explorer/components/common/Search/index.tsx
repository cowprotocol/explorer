import React, { useState, useEffect } from 'react'
import { Wrapper, Button, Input, SearchIcon, Placeholder } from './Search.styled'
import { useSearchSubmit } from 'hooks/useSearchSubmit'

// assets
import searchImg from 'assets/img/search2.svg'

interface SearchProps {
  searchString?: string
  submitSearchImmediatly?: boolean
}

export const Search: React.FC<React.HTMLAttributes<HTMLDivElement> & SearchProps> = (props) => {
  const { className, searchString = '', submitSearchImmediatly = false } = props
  const [query, setQuery] = useState('')
  const [showPlaceholder, setShowPlaceholder] = useState(true)
  const handleSubmit = useSearchSubmit()

  useEffect(() => {
    if (searchString && submitSearchImmediatly) {
      handleSubmit(searchString)
    }
    setShowPlaceholder(query.length > 0)
  }, [handleSubmit, searchString, submitSearchImmediatly, query])
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
        placeholder="Order ID / ETH Address / ENS Address"
        aria-label="Search the GP explorer for orders, batches and transactions"
      />
      <Placeholder isActive={showPlaceholder}>Order ID / ETH Address / ENS Address</Placeholder>
    </Wrapper>
  )
}
