import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { Address } from 'viem'
import { parseUnits } from 'viem'
import { toast } from 'sonner'
import { useWriteContract } from 'wagmi'

import { erc4626Abi } from '../lib/abis/erc4626'
import { getErrorMessage } from '../lib/format'
import { publicClients } from '../lib/wagmi'

type SelectedVault = {
  name: string
  address: Address
  chainId: number
}

type AssetToken = {
  address: Address
  symbol: string
  decimals: number
}

export function useWithdraw(selectedVault: SelectedVault | null, assetToken?: AssetToken, account?: Address) {
  const queryClient = useQueryClient()
  const { writeContractAsync } = useWriteContract()
  const [isPending, setIsPending] = useState(false)

  async function withdraw(amount: string) {
    if (!selectedVault || !assetToken || !account) {
      return
    }

    const assets = parseUnits(amount, assetToken.decimals)
    const client = publicClients[selectedVault.chainId]
    const toastId = 'withdraw-flow'

    setIsPending(true)

    try {
      toast.loading(`Withdrawing ${assetToken.symbol}...`, { id: toastId })

      const withdrawHash = await writeContractAsync({
        chainId: selectedVault.chainId,
        address: selectedVault.address,
        abi: erc4626Abi,
        functionName: 'withdraw',
        args: [assets, account, account],
      })

      await client.waitForTransactionReceipt({ hash: withdrawHash })
      await queryClient.invalidateQueries({ queryKey: ['vault-data'] })
      toast.success('Withdrawal complete.', { id: toastId })
    } catch (error) {
      toast.error(getErrorMessage(error), { id: toastId })
      throw error
    } finally {
      setIsPending(false)
    }
  }

  async function withdrawAll(shares: bigint) {
    if (!selectedVault || !account || shares <= 0n) {
      return
    }

    const client = publicClients[selectedVault.chainId]
    const toastId = 'withdraw-flow'

    setIsPending(true)

    try {
      toast.loading('Redeeming full position...', { id: toastId })

      const redeemHash = await writeContractAsync({
        chainId: selectedVault.chainId,
        address: selectedVault.address,
        abi: erc4626Abi,
        functionName: 'redeem',
        args: [shares, account, account],
      })

      await client.waitForTransactionReceipt({ hash: redeemHash })
      await queryClient.invalidateQueries({ queryKey: ['vault-data'] })
      toast.success('Full withdrawal complete.', { id: toastId })
    } catch (error) {
      toast.error(getErrorMessage(error), { id: toastId })
      throw error
    } finally {
      setIsPending(false)
    }
  }

  return {
    withdraw,
    withdrawAll,
    isPending,
  }
}
