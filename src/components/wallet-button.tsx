import { useAppKit } from '@reown/appkit/react'
import { useAccount } from 'wagmi'

import { shortenAddress } from '../lib/format'
import { Button } from './primitives'

export function WalletButton() {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()

  return (
    <Button
      variant={isConnected ? 'secondary' : 'primary'}
      className="min-w-[148px]"
      onClick={() => open()}
    >
      {isConnected ? shortenAddress(address) : 'Connect wallet'}
    </Button>
  )
}
