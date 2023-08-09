import React from 'react'
import { Avatar } from '@material-ui/core'

type BoringAvatarProps = {
  alt?: string
}
const BoringAvatar: React.FC<BoringAvatarProps> = ({ alt }) => (
  <Avatar alt={alt} src="https://source.boringavatars.com/pixel" />
)

export default BoringAvatar
