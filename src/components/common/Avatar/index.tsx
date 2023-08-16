import React, { useState } from 'react'
import { Avatar } from '@material-ui/core'

type BoringAvatarProps = {
  alt?: string
}
const BoringAvatar: React.FC<BoringAvatarProps> = ({ alt }) => {
  const [colors] = useState<string[]>(
    Array.from({ length: 6 }, () => Math.floor(Math.random() * 16777215).toString(16)),
  )
  return <Avatar alt={alt} src={`https://source.boringavatars.com/pixel/120/${alt}?colors=${colors.join(',')}`} />
}
export default BoringAvatar
