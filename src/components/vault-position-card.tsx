import type { Address } from 'viem'

import { formatTokenAmount } from '../lib/format'
import { Button, Card, KeyValue } from './primitives'

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
  chainName: string
  referenceUrl?: string
}

type VaultPositionCardProps = {
  selectedVault: SelectedVault | null
  vaultData: VaultData | null | undefined
  isLoading: boolean
  isConnected: boolean
  isWrongNetwork: boolean
  onOpenDeposit: () => void
  onOpenWithdraw: () => void
  onSwitchNetwork: () => void
}

export function VaultPositionCard({
  selectedVault,
  vaultData,
  isLoading,
  isConnected,
  isWrongNetwork,
  onOpenDeposit,
  onOpenWithdraw,
  onSwitchNetwork,
}: VaultPositionCardProps) {
  return (
    <Card className="p-6 sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Vault position</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            {selectedVault ? selectedVault.name : 'Choose a supported vault'}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Inspect the selected ERC-4626 vault and interact with it using your connected wallet.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {isWrongNetwork ? (
            <Button variant="secondary" onClick={onSwitchNetwork}>
              Switch network
            </Button>
          ) : null}
          <Button onClick={onOpenDeposit} disabled={!selectedVault || !isConnected || isWrongNetwork || !vaultData}>
            Deposit
          </Button>
          <Button
            variant="secondary"
            onClick={onOpenWithdraw}
            disabled={
              !selectedVault ||
              !isConnected ||
              isWrongNetwork ||
              !vaultData ||
              vaultData.shareBalance <= 0n
            }
          >
            Withdraw
          </Button>
        </div>
      </div>

      {!selectedVault ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/12 bg-white/3 px-5 py-6 text-sm text-slate-400">
          This chain does not have a configured vault yet. Switch back to Ethereum Mainnet to inspect the initial target vault.
        </div>
      ) : isLoading ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/4 px-5 py-6 text-sm text-slate-300">
          Loading vault state...
        </div>
      ) : vaultData ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-white/8 bg-slate-900/70 p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Deposited value</p>
                <p className="mt-1 text-3xl font-semibold text-white">
                  {formatTokenAmount(vaultData.depositedAssets, vaultData.assetToken.decimals)}{' '}
                  {vaultData.assetToken.symbol}
                </p>
              </div>
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Wallet balance</p>
                <p className="mt-1 text-lg font-medium text-cyan-50">
                  {formatTokenAmount(vaultData.walletBalance, vaultData.assetToken.decimals)}{' '}
                  {vaultData.assetToken.symbol}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-slate-950/80 p-4">
              <KeyValue label="Vault address" value={selectedVault.address} />
              <KeyValue label="Underlying token" value={vaultData.assetToken.name} />
              <KeyValue label="Token symbol" value={vaultData.assetToken.symbol} />
              <KeyValue label="Token address" value={vaultData.assetToken.address} />
              <KeyValue label="Share balance" value={vaultData.shareBalance.toString()} />
              <KeyValue label="Network" value={`${selectedVault.chainName} (${selectedVault.chainId})`} />
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-white/8 bg-slate-900/70 p-5">
            <div>
              <p className="text-sm font-medium text-slate-200">Interaction state</p>
              <p className="mt-2 text-sm text-slate-400">
                {isConnected
                  ? isWrongNetwork
                    ? 'Your wallet is connected on a different chain than the selected vault.'
                    : 'Wallet and vault selection are aligned. You can deposit or withdraw now.'
                  : 'Connect a wallet to read wallet balances and submit transactions.'}
              </p>
            </div>

            {selectedVault.referenceUrl ? (
              <a
                className="inline-flex text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                href={selectedVault.referenceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open reference vault page
              </a>
            ) : null}

            <div className="rounded-2xl border border-white/8 bg-slate-950/80 p-4 text-sm text-slate-400">
              Deposits use the vault&apos;s underlying ERC-20 token. Withdraw all uses `redeem()` to avoid rounding issues when exiting the full position.
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-6 text-sm text-red-100">
          The selected vault could not be read from chain. Double-check the network and configured addresses.
        </div>
      )}
    </Card>
  )
}
