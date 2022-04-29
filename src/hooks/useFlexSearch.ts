import { useState, useEffect } from 'react'
import { Index, SearchOptions } from 'flexsearch'

const SEARCH_INDEX = new Index({
  tokenize: 'forward',
})

export const useFlexSearch = (
  query: string,
  data: unknown[],
  filterValues: Array<string>,
  searchOptions?: SearchOptions,
): unknown[] => {
  const [index, setIndex] = useState(SEARCH_INDEX)
  const [filteredResults, setFilteredResults] = useState<unknown[]>(data)

  useEffect(() => {
    data.forEach((el: any) => {
      const filteredObj = Object.keys(el)
        .filter((key) => filterValues.includes(key))
        .reduce((cur, key) => {
          return Object.assign(cur, { [key]: el[key] })
        }, {})
      index.add(el.id, JSON.stringify(filteredObj))
    })
  }, [index, data, filterValues])

  useEffect(() => {
    setIndex(SEARCH_INDEX)
  }, [data])

  useEffect(() => {
    if (!query) return

    const result = index.search(query, searchOptions)
    const filteredResults = data.filter((el: any) => result.includes(el.id))
    setFilteredResults(filteredResults)
  }, [query, index, searchOptions, data])

  return filteredResults
}
