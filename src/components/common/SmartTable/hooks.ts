import React, { useCallback, useEffect, useRef } from 'react'

interface Column {
  header: HTMLTableCellElement
  size: string
}

interface UseSmartTable {
  gridTemplateColumns?: string
  tableRef: React.MutableRefObject<HTMLTableElement | undefined>
}

type OptionKeys = 'minRowWidth' | 'maxRowWidth'

type Options = {
  [key in OptionKeys]: [number, string]
}

export const useSmartTable = (options: Options): UseSmartTable => {
  const tableRef = useRef<HTMLTableElement>()
  const _tableHeaderCellRef = useRef<HTMLTableHeaderCellElement>()
  const _tableHeaderColumnRef = useRef<Column[]>([])

  const [gridTemplateColumns, setGridTemplateColumns] = React.useState<string | undefined>(undefined)

  const {
    minRowWidth: [minSize, minFormat],
    maxRowWidth: [maxSize, maxFormat],
  } = options

  const _onMouseMove = useCallback(
    (e) =>
      window.requestAnimationFrame(() => {
        if (!tableRef.current || !_tableHeaderCellRef.current)
          return console.debug('[_onMouseMove]::No _tableHeaderCellRef or tableRef found')
        // Calculate the desired width
        const horizontalScrollOffset = document.documentElement.scrollLeft
        const width = horizontalScrollOffset + e.clientX - _tableHeaderCellRef.current.offsetLeft

        /*
            Update the column object with the new size value
            NOTE: we're only fixing one column's width, not all. This is what causes the bad user experience.
          */
        const column = _tableHeaderColumnRef.current.find(({ header }) => header === _tableHeaderCellRef.current)

        if (!column || !column.size) return console.debug('[_onMouseMove]::No column(s) found')

        column.size = Math.max(minSize, width) + minFormat

        /* 
            Update the column sizes
            Reminder: grid-template-_tableHeaderColumnRef sets the width for all _tableHeaderColumnRef in one value
          */
        const adjustedTableGridTemplateColumns = _tableHeaderColumnRef.current.map(({ size }) => size).join(' ')
        setGridTemplateColumns(adjustedTableGridTemplateColumns)
      }),
    [minFormat, minSize],
  )

  const _onMouseUp = useCallback(() => {
    window.removeEventListener('mousemove', _onMouseMove)
    window.removeEventListener('mouseup', _onMouseUp)

    if (!_tableHeaderCellRef.current) return console.debug('[_onMouseUp]::No _tableHeaderCellRef found')

    _tableHeaderCellRef.current.classList.remove('header--being-resized')
    _tableHeaderCellRef.current = undefined
  }, [_onMouseMove])

  // Get ready, they're about to resize
  const _initResize = useCallback(
    ({ target }) => {
      _tableHeaderCellRef.current = target.parentNode as HTMLTableHeaderCellElement

      if (!_tableHeaderCellRef.current) return console.debug('[_initResize]::No _tableHeaderCellRef found')

      window.addEventListener('mousemove', _onMouseMove)
      window.addEventListener('mouseup', _onMouseUp)
      _tableHeaderCellRef.current.classList.add('header--being-resized')
    },
    [_onMouseMove, _onMouseUp],
  )

  useEffect(() => {
    _tableHeaderColumnRef.current = []

    if (!tableRef.current) return console.debug('[ON_MOUNT]::No tableRef found')

    // Let's populate that _tableHeaderColumnRef array and add listeners to the resize handles
    tableRef.current.querySelectorAll('th').forEach((header) => {
      header.removeEventListener('mousedown', _initResize)
      const columnToSet = {
        header,
        // The initial size value for grid-template-columns:
        size: `minmax(${minSize}${minFormat}, ${maxSize}${maxFormat})`,
      }
      _tableHeaderColumnRef.current = [..._tableHeaderColumnRef.current, columnToSet]
      header.addEventListener('mousedown', _initResize)
    })

    return _onMouseUp()
  }, [_initResize, _onMouseUp, maxFormat, maxSize, minFormat, minSize])

  return {
    gridTemplateColumns,
    tableRef,
  }
}

export default useSmartTable
