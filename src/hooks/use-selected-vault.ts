import { useEffect, useMemo, useState } from 'react'
import type { Address } from 'viem'

import { APP_CONFIG, DEFAULT_CHAIN_ID } from '../config/config'

export function useSelectedVault() {
  const [selectedChainId, setSelectedChainId] = useState(DEFAULT_CHAIN_ID)
  const [selectedVaultAddress, setSelectedVaultAddress] = useState<Address | ''>(
    APP_CONFIG[0]?.vaults[0]?.address ?? '',
  )

  const selectedChain = useMemo(
    () => APP_CONFIG.find((chain) => chain.id === selectedChainId) ?? APP_CONFIG[0],
    [selectedChainId],
  )

  useEffect(() => {
    const nextVault = selectedChain.vaults[0]?.address ?? ''

    setSelectedVaultAddress(nextVault)
  }, [selectedChain])

  const selectedVault = useMemo(() => {
    const vault = selectedChain.vaults.find((item) => item.address === selectedVaultAddress)

    if (!vault) {
      return null
    }

    return {
      ...vault,
      chainId: selectedChain.id,
      chainName: selectedChain.name,
    }
  }, [selectedChain, selectedVaultAddress])

  return {
    selectedChain,
    selectedChainId,
    selectedVault,
    selectedVaultAddress,
    setSelectedChainId,
    setSelectedVaultAddress,
  }
}
