import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk'
import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  color: ${({ theme }): string => theme.grey};
  font-size: ${({ theme }): string => theme.fontSizeDefault};
  font-weight: ${({ theme }): string => theme.fontNormal};

  line-height: 3rem;
  padding: 2rem;
`

export const Swap: React.FC = () => {
  const { sdk, safe, connected } = useSafeAppsSDK()
  const { safeAddress, network } = safe
  console.log('Safe SDK ready', sdk)

  return (
    <Wrapper>
      <h1>Gnosis Protocol</h1>
      <div>
        <ul>
          <li>
            <strong>Safe</strong>: {safeAddress}
          </li>
          <li>
            <strong>Network</strong>: {network}
          </li>
          <li>
            <strong>Connected</strong>: {String(connected)}
          </li>
        </ul>
      </div>
    </Wrapper>
  )
}

export default Swap
