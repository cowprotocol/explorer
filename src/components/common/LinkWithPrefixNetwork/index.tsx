import React from 'react'
import { Link, LinkProps } from 'react-router-dom'

import { usePathPrefix } from 'state/network'

export function LinkWithPrefixNetwork(props: LinkProps): JSX.Element {
  const { to, children, ...otherParams } = props
  const prefix = usePathPrefix()
  const _to = prefix ? `/${prefix}${to}` : to

  return (
    <Link to={_to} {...otherParams}>
      {children}
    </Link>
  )
}
