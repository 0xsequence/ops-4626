import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { Address } from 'viem'
import { parseUnits } from 'viem'
import { toast } from 'sonner'
import { useWriteContract } from 'wagmi'

import { erc20Abi } from '../lib/abis/erc20'
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

export function useDeposit(selectedVault: SelectedVault | null, assetToken?: AssetToken, account?: Address) {
  const queryClient = useQueryClient()
  const { writeContractAsync } = useWriteContract()
  const [isPending, setIsPending] = useState(false)

  async function deposit(amount: string) {
    if (!selectedVault || !assetToken || !account) {
      return
    }

    const assets = parseUnits(amount, assetToken.decimals)
    const client = publicClients[selectedVault.chainId]
    const toastId = 'deposit-flow'

    setIsPending(true)

    try {
      const allowance = await client.readContract({
        address: assetToken.address,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [account, selectedVault.address],
      })

      if (allowance < assets) {
        toast.loading(`Approving ${assetToken.symbol}...`, { id: toastId })

        const approvalHash = await writeContractAsync({
          chainId: selectedVault.chainId,
          address: assetToken.address,
          abi: erc20Abi,
          functionName: 'approve',
          args: [selectedVault.address, assets],
        })

        await client.waitForTransactionReceipt({ hash: approvalHash })
      }

      toast.loading(`Depositing ${assetToken.symbol}...`, { id: toastId })

      const depositHash = await writeContractAsync({
        chainId: selectedVault.chainId,
        address: selectedVault.address,
        abi: erc4626Abi,
        functionName: 'deposit',
        args: [assets, account],
      })

      await client.waitForTransactionReceipt({ hash: depositHash })
      await queryClient.invalidateQueries({ queryKey: ['vault-data'] })
      toast.success('Deposit complete.', { id: toastId })
    } catch (error) {
      toast.error(getErrorMessage(error), { id: toastId })
      throw error
    } finally {
      setIsPending(false)
    }
  }

  return {
    deposit,
    isPending,
  }
}
