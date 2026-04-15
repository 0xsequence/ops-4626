import { useState } from 'react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'

import { ChainSelect } from '../components/chain-select'
import { DepositModal } from '../components/deposit-modal'
import { VaultPositionCard } from '../components/vault-position-card'
import { VaultSelect } from '../components/vault-select'
import { WalletButton } from '../components/wallet-button'
import { WithdrawModal } from '../components/withdraw-modal'
import { useSelectedVault } from '../hooks/use-selected-vault'
import { useVaultData } from '../hooks/use-vault-data'
import { Card } from '../components/primitives'

export function HomePage() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChainAsync } = useSwitchChain()
  const [depositOpen, setDepositOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  const {
    selectedChain,
    selectedChainId,
    selectedVault,
    selectedVaultAddress,
    setSelectedChainId,
    setSelectedVaultAddress,
  } = useSelectedVault()

  const { data: vaultData, isLoading } = useVaultData(selectedVault, address)
  const isWrongNetwork = Boolean(isConnected && selectedVault && chainId !== selectedVault.chainId)

  async function handleSwitchNetwork() {
    if (!selectedVault) {
      return
    }

    await switchChainAsync({ chainId: selectedVault.chainId })
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-8 flex flex-col gap-5 rounded-[2rem] border border-white/10 bg-slate-950/65 p-6 shadow-[0_30px_100px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">ERC-4626 utility</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Vault operations app</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
            Connect a wallet, pick a supported chain and vault, inspect your position, then deposit or withdraw directly from the same screen.
          </p>
        </div>
        <WalletButton />
      </header>

      <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="h-fit p-6 sm:p-7">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Selection</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Chain and vault</h2>
          <p className="mt-2 text-sm text-slate-400">
            The supported options come directly from config so adding new vaults is a source change, not a UI rewrite.
          </p>

          <div className="mt-6 space-y-5">
            <ChainSelect value={selectedChainId} onChange={setSelectedChainId} />
            <VaultSelect chain={selectedChain} value={selectedVaultAddress} onChange={setSelectedVaultAddress} />
          </div>

          <div className="mt-6 rounded-2xl border border-white/8 bg-slate-900/70 p-4 text-sm text-slate-400">
            {isConnected
              ? `Connected wallet: ${address}`
              : 'Wallet-dependent balances and write actions unlock after connection.'}
          </div>
        </Card>

        <VaultPositionCard
          selectedVault={selectedVault}
          vaultData={vaultData}
          isLoading={isLoading}
          isConnected={isConnected}
          isWrongNetwork={isWrongNetwork}
          onOpenDeposit={() => setDepositOpen(true)}
          onOpenWithdraw={() => setWithdrawOpen(true)}
          onSwitchNetwork={() => {
            void handleSwitchNetwork()
          }}
        />
      </section>

      <DepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        selectedVault={selectedVault}
        vaultData={vaultData}
        account={address}
        isWrongNetwork={isWrongNetwork}
        onSwitchNetwork={() => {
          void handleSwitchNetwork()
        }}
      />

      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        selectedVault={selectedVault}
        vaultData={vaultData}
        account={address}
        isWrongNetwork={isWrongNetwork}
        onSwitchNetwork={() => {
          void handleSwitchNetwork()
        }}
      />
    </main>
  )
}
