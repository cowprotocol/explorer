import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { faCopy } from '@fortawesome/free-regular-svg-icons'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CopyToClipboard from 'react-copy-to-clipboard'

import { DISPLAY_TEXT_COPIED_CHECK } from 'apps/explorer/const'

const Icon = styled(FontAwesomeIcon)<{ copied: boolean }>`
  color: ${({ theme, copied }): string => (copied ? theme.green : theme.grey)};
  transition: color 0.2s ease-in;
  cursor: ${({ copied }): string => (copied ? 'reset' : 'pointer')};

  &:hover {
    color: ${({ theme, copied }): string => (copied ? theme.green : theme.white)};
  }

  + span {
    color: ${({ theme }): string => theme.green};
    font-weight: ${({ theme }): string => theme.fontMedium};
    margin: 0 0 0 0.1rem;
  }
`

export type Props = { text: string }

/**
 * Simple CopyButton component.
 *
 * Takes in the `text` to be copied when button is clicked
 * Displays the copy icon with theme based color
 * When clicked, displays a green check for DISPLAY_TEXT_COPIED_CHECK seconds,
 * then is back to original copy icon
 */
export function CopyButton(props: Props): JSX.Element {
  const { text } = props

  const [copied, setCopied] = useState(false)
  const onCopy = (): void => setCopied(true)

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null

    if (copied) {
      timeout = setTimeout(() => setCopied(false), DISPLAY_TEXT_COPIED_CHECK)
    }

    return (): void => {
      timeout && clearTimeout(timeout)
    }
  }, [copied])

  return (
    <CopyToClipboard text={text} onCopy={onCopy}>
      <span>
        <Icon icon={copied ? faCheck : faCopy} copied={copied} /> {copied && <span>Copied</span>}
      </span>
    </CopyToClipboard>
  )
}
