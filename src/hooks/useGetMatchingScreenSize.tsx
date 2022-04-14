import { useEffect, useState } from 'react'

import { getMatchingScreenSize, subscribeToScreenSizeChange, Breakpoints } from 'utils/mediaQueries'

export function useGetMatchingScreenSize(): Breakpoints {
  const [resolution, setResolution] = useState<string>(getMatchingScreenSize())

  useEffect(() => {
    const mediaQuery = subscribeToScreenSizeChange(() => setResolution(getMatchingScreenSize()))
    return (): void => mediaQuery()
  }, [])

  return resolution as Breakpoints
}
