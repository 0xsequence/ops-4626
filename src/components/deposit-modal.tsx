import { useEffect, useMemo, useState } from 'react'
import type { Address } from 'viem'
import { parseUnits } from 'viem'

import { useDeposit } from '../hooks/use-deposit'
import { formatTokenAmount } from '../lib/format'
import { Button, Input, KeyValue, Label } from './primitives'
import { Modal } from './modal'

type VaultData = {
  assetToken: {
    address: Address
    name: string
    symbol: string
    decimals: number
  }
  shareBalance: bigint
  depositedAssets: bigint
  walletBalance: bigint
}

type SelectedVault = {
  name: string
  address: Address
  chainId: number
}

type DepositModalProps = {
  open: boolean
  onClose: () => void
  selectedVault: SelectedVault | null
  vaultData: VaultData | null | undefined
  account?: Address
  isWrongNetwork: boolean
  onSwitchNetwork: () => void
}

export function DepositModal({
  open,
  onClose,
  selectedVault,
  vaultData,
  account,
  isWrongNetwork,
  onSwitchNetwork,
}: DepositModalProps) {
  const [amount, setAmount] = useState('')
  const { deposit, isPending } = useDeposit(selectedVault, vaultData?.assetToken, account)

  useEffect(() => {
    if (open) {
      setAmount('')
    }
  }, [open])

  const insufficientBalance = useMemo(() => {
    if (!vaultData || !amount) {
      return false
    }

    try {
      return parseUnits(amount, vaultData.assetToken.decimals) > vaultData.walletBalance
    } catch {
      return true
    }
  }, [amount, vaultData])

  async function handleSubmit() {
    if (!amount) {
      return
    }

    await deposit(amount)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Deposit into vault"
      description="Approve the underlying token if needed, then submit a vault deposit using asset units."
    >
      {!selectedVault || !vaultData ? null : (
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/8 bg-slate-900/70 p-4">
            <KeyValue label="Vault" value={selectedVault.name} />
            <KeyValue label="Asset" value={`${vaultData.assetToken.name} (${vaultData.assetToken.symbol})`} />
            <KeyValue
              label="Wallet balance"
              value={`${formatTokenAmount(vaultData.walletBalance, vaultData.assetToken.decimals)} ${vaultData.assetToken.symbol}`}
            />
          </div>

          <div>
            <Label htmlFor="deposit-amount">Amount</Label>
            <Input
              id="deposit-amount"
              inputMode="decimal"
              placeholder={`0.0 ${vaultData.assetToken.symbol}`}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            {insufficientBalance ? (
              <p className="mt-2 text-sm text-red-300">Entered amount is higher than your wallet balance.</p>
            ) : null}
          </div>

          {isWrongNetwork ? (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              Switch your wallet network before depositing.
            </div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3">
            {isWrongNetwork ? (
              <Button variant="secondary" onClick={onSwitchNetwork}>
                Switch network
              </Button>
            ) : null}
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                void handleSubmit()
              }}
              disabled={!account || !amount || insufficientBalance || isWrongNetwork || isPending}
            >
              {isPending ? 'Submitting...' : 'Deposit'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
