import { useEffect, useMemo, useState } from 'react'
import type { Address } from 'viem'
import { parseUnits } from 'viem'

import { useWithdraw } from '../hooks/use-withdraw'
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

type WithdrawModalProps = {
  open: boolean
  onClose: () => void
  selectedVault: SelectedVault | null
  vaultData: VaultData | null | undefined
  account?: Address
  isWrongNetwork: boolean
  onSwitchNetwork: () => void
}

export function WithdrawModal({
  open,
  onClose,
  selectedVault,
  vaultData,
  account,
  isWrongNetwork,
  onSwitchNetwork,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState('')
  const { withdraw, withdrawAll, isPending } = useWithdraw(selectedVault, vaultData?.assetToken, account)

  useEffect(() => {
    if (open) {
      setAmount('')
    }
  }, [open])

  const exceedsPosition = useMemo(() => {
    if (!vaultData || !amount) {
      return false
    }

    try {
      return parseUnits(amount, vaultData.assetToken.decimals) > vaultData.depositedAssets
    } catch {
      return true
    }
  }, [amount, vaultData])

  async function handleWithdraw() {
    if (!amount) {
      return
    }

    await withdraw(amount)
    onClose()
  }

  async function handleWithdrawAll() {
    if (!vaultData) {
      return
    }

    await withdrawAll(vaultData.shareBalance)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Withdraw from vault"
      description="Use asset units for partial withdrawals, or redeem your full share balance in one transaction."
    >
      {!selectedVault || !vaultData ? null : (
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/8 bg-slate-900/70 p-4">
            <KeyValue label="Vault" value={selectedVault.name} />
            <KeyValue
              label="Deposited amount"
              value={`${formatTokenAmount(vaultData.depositedAssets, vaultData.assetToken.decimals)} ${vaultData.assetToken.symbol}`}
            />
            <KeyValue label="Share balance" value={vaultData.shareBalance.toString()} />
          </div>

          <div>
            <Label htmlFor="withdraw-amount">Amount</Label>
            <Input
              id="withdraw-amount"
              inputMode="decimal"
              placeholder={`0.0 ${vaultData.assetToken.symbol}`}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            {exceedsPosition ? (
              <p className="mt-2 text-sm text-red-300">Entered amount is higher than your current deposited balance.</p>
            ) : null}
          </div>

          {isWrongNetwork ? (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              Switch your wallet network before withdrawing.
            </div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3">
            {isWrongNetwork ? (
              <Button variant="secondary" onClick={onSwitchNetwork}>
                Switch network
              </Button>
            ) : null}
            <Button
              variant="secondary"
              onClick={() => {
                void handleWithdrawAll()
              }}
              disabled={!account || vaultData.shareBalance <= 0n || isWrongNetwork || isPending}
            >
              Withdraw all
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                void handleWithdraw()
              }}
              disabled={!account || !amount || exceedsPosition || isWrongNetwork || isPending}
            >
              {isPending ? 'Submitting...' : 'Withdraw'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
