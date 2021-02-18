import React from 'react'
import { Redirect } from 'react-router'
import { History } from 'history'

import { useWalletConnection } from 'hooks/useWalletConnection'
import { ConnectWalletBanner } from 'apps/gp-v1/components/ConnectWalletBanner'

type ConnectWalletProps = History<{ from: string }>

const ConnectWallet: React.FC<ConnectWalletProps> = (props: ConnectWalletProps) => {
  const { from } = props.location.state || { from: { pathname: '/' } }
  const { isConnected, pending } = useWalletConnection()

  if (pending) return null

  if (isConnected) {
    return <Redirect to={from} />
  }

  return <ConnectWalletBanner />
}

export default ConnectWallet
