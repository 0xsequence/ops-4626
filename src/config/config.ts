import type { Address } from 'viem'

export type VaultConfig = {
  name: string
  address: Address
  referenceUrl?: string
}

export type ChainConfig = {
  id: number
  name: string
  rpcPath: 'mainnet' | 'polygon'
  vaults: VaultConfig[]
}

export const APP_CONFIG: ChainConfig[] = [
  {
    id: 1,
    name: 'Ethereum Mainnet',
    rpcPath: 'mainnet',
    vaults: [
      {
        name: 'Alpha USDC Forex V2',
        address: '0x153Bd1abE60104Bd46aa05a27fA12D1346D64A57',
        referenceUrl:
          'https://app.morpho.org/ethereum/vault/0x153Bd1abE60104Bd46aa05a27fA12D1346D64A57/alpha-usdc-forex-v2',
      },
    ],
  },
  {
    id: 137,
    name: 'Polygon',
    rpcPath: 'polygon',
    vaults: [],
  },
]

export const DEFAULT_CHAIN_ID = APP_CONFIG[0].id

export function getChainConfig(chainId: number) {
  return APP_CONFIG.find((chain) => chain.id === chainId)
}

export function getVaultConfig(chainId: number, address: Address) {
  return getChainConfig(chainId)?.vaults.find((vault) => vault.address === address)
}
