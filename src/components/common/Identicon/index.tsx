import * as React from 'react'

import makeBlockie from 'ethereum-blockies-base64'
import styled from 'styled-components'

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
type Props = {
  address: string
  size: Size
}

const identicon = {
  size: {
    xs: '10px',
    sm: '16px',
    md: '32px',
    lg: '40px',
    xl: '48px',
    xxl: '60px',
  },
}

const StyledImg = styled.img<{ size: Size }>`
  height: ${({ size }): string => identicon.size[size]};
  width: ${({ size }): string => identicon.size[size]};
  border-radius: 50%;
`

const Identicon = ({ size = 'md', address, ...rest }: Props): React.ReactElement => {
  const iconSrc = React.useMemo(() => makeBlockie(address), [address])

  return <StyledImg src={iconSrc} size={size} {...rest} />
}

export default Identicon
