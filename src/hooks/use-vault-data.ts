import { useQuery } from '@tanstack/react-query'
import type { Address } from 'viem'

import { erc20Abi } from '../lib/abis/erc20'
import { erc4626Abi } from '../lib/abis/erc4626'
import { publicClients } from '../lib/wagmi'

type SelectedVault = {
  name: string
  address: Address
  chainId: number
  chainName: string
  referenceUrl?: string
}

async function readStringOrDefault<T>(promise: Promise<T>, fallback: T) {
  try {
    return await promise
  } catch {
    return fallback
  }
}

export function useVaultData(selectedVault: SelectedVault | null, account?: Address) {
  return useQuery({
    queryKey: ['vault-data', selectedVault?.chainId, selectedVault?.address, account],
    enabled: Boolean(selectedVault),
    queryFn: async () => {
      if (!selectedVault) {
        return null
      }

      const client = publicClients[selectedVault.chainId]
      const assetAddress = await client.readContract({
        address: selectedVault.address,
        abi: erc4626Abi,
        functionName: 'asset',
      })

      const [name, symbol, decimals] = await Promise.all([
        readStringOrDefault(
          client.readContract({
            address: assetAddress,
            abi: erc20Abi,
            functionName: 'name',
          }),
          'Unknown token',
        ),
        readStringOrDefault(
          client.readContract({
            address: assetAddress,
            abi: erc20Abi,
            functionName: 'symbol',
          }),
          'UNKNOWN',
        ),
        readStringOrDefault(
          client.readContract({
            address: assetAddress,
            abi: erc20Abi,
            functionName: 'decimals',
          }),
          18,
        ),
      ])

      if (!account) {
        return {
          assetToken: {
            address: assetAddress,
            name,
            symbol,
            decimals,
          },
          shareBalance: 0n,
          depositedAssets: 0n,
          walletBalance: 0n,
        }
      }

      const shareBalance = await client.readContract({
        address: selectedVault.address,
        abi: erc4626Abi,
        functionName: 'balanceOf',
        args: [account],
      })

      const [depositedAssets, walletBalance] = await Promise.all([
        shareBalance > 0n
          ? client.readContract({
              address: selectedVault.address,
              abi: erc4626Abi,
              functionName: 'convertToAssets',
              args: [shareBalance],
            })
          : Promise.resolve(0n),
        client.readContract({
          address: assetAddress,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [account],
        }),
      ])

      return {
        assetToken: {
          address: assetAddress,
          name,
          symbol,
          decimals,
        },
        shareBalance,
        depositedAssets,
        walletBalance,
      }
    },
  })
}
