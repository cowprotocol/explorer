import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Icon = styled(FontAwesomeIcon)`
  background: ${({ theme }): string => theme.grey}33; /* 33==20% transparency in hex */
  border-radius: 1rem;
  width: 1.2rem !important; /* FontAwesome sets it to 1em with higher specificity */
  height: 1.2rem;
  padding: 0.4rem;
  margin-left: 0.5rem;
  cursor: pointer;
`

export default Icon
