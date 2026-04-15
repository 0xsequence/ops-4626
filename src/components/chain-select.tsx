import { APP_CONFIG } from '../config/config'
import { Label, Select } from './primitives'

type ChainSelectProps = {
  value: number
  onChange: (chainId: number) => void
}

export function ChainSelect({ value, onChange }: ChainSelectProps) {
  return (
    <div>
      <Label htmlFor="chain-select">Chain</Label>
      <Select id="chain-select" value={value} onChange={(event) => onChange(Number(event.target.value))}>
        {APP_CONFIG.map((chain) => (
          <option key={chain.id} value={chain.id}>
            {chain.name} ({chain.id})
          </option>
        ))}
      </Select>
    </div>
  )
}
