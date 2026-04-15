import type { Address } from 'viem'

import type { ChainConfig } from '../config/config'
import { Label, Select } from './primitives'

type VaultSelectProps = {
  chain: ChainConfig
  value: Address | ''
  onChange: (value: Address | '') => void
}

export function VaultSelect({ chain, value, onChange }: VaultSelectProps) {
  return (
    <div>
      <Label htmlFor="vault-select">Vault</Label>
      <Select
        id="vault-select"
        disabled={chain.vaults.length === 0}
        value={value}
        onChange={(event) => onChange(event.target.value as Address | '')}
      >
        {chain.vaults.length === 0 ? (
          <option value="">No configured vaults on this chain</option>
        ) : (
          chain.vaults.map((vault) => (
            <option key={vault.address} value={vault.address}>
              {vault.name} ({vault.address.slice(0, 6)}...{vault.address.slice(-4)})
            </option>
          ))
        )}
      </Select>
    </div>
  )
}
