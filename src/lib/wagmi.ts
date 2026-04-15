import { createAppKit } from '@reown/appkit/react'
import { mainnet, polygon } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createPublicClient, defineChain, http, type PublicClient } from 'viem'

import { APP_CONFIG } from '../config/config'

const projectId =
  import.meta.env.VITE_REOWN_PROJECT_ID || '6c925148f99706f295d774b730eba1f2'
const sequenceAccessKey = import.meta.env.VITE_SEQUENCE_ACCESS_KEY || ''

const metadata = {
  name: 'Vault Utility',
  description: 'Config-driven ERC-4626 vault utility app',
  url: typeof window === 'undefined' ? 'http://localhost:5173' : window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/1833646?s=200&v=4'],
}

const appKitFeatures = {
  analytics: false,
  email: false,
  socials: [],
  swaps: false,
  onramp: false,
  pay: false,
  payWithExchange: false,
  payments: false,
}

const metaMaskWalletId = 'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'

const excludedWalletIds = [
  '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4',
  '0b415a746fb9ee99cce155c2ceca0c6f6061b1dbca2d722b3ba16381d0562150',
  '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
]

function createRpcUrl(path: 'mainnet' | 'polygon' | 'katana') {
  if (path === 'katana') {
    return 'https://nodes.sequence.app/katana'
  }

  return `https://nodes.sequence.app/${path}/${sequenceAccessKey}`
}

const ethereumChain = {
  ...mainnet,
  rpcUrls: {
    ...mainnet.rpcUrls,
    default: { http: [createRpcUrl('mainnet')] },
    public: { http: [createRpcUrl('mainnet')] },
  },
}

const polygonChain = {
  ...polygon,
  rpcUrls: {
    ...polygon.rpcUrls,
    default: { http: [createRpcUrl('polygon')] },
    public: { http: [createRpcUrl('polygon')] },
  },
}

const katanaChain = defineChain({
  id: 747474,
  name: 'Katana',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [createRpcUrl('katana')] },
    public: { http: [createRpcUrl('katana')] },
  },
  blockExplorers: {
    default: {
      name: 'KatanaScan',
      url: 'https://katanascan.com',
    },
  },
})

export const appChains = [ethereumChain, polygonChain, katanaChain] as [
  typeof ethereumChain,
  typeof polygonChain,
  typeof katanaChain,
]

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: appChains,
  multiInjectedProviderDiscovery: true,
  ssr: false,
})

createAppKit({
  adapters: [wagmiAdapter],
  networks: appChains,
  projectId,
  metadata,
  allWallets: 'HIDE',
  includeWalletIds: [metaMaskWalletId],
  excludeWalletIds: excludedWalletIds,
  featuredWalletIds: [metaMaskWalletId],
  enableEIP6963: true,
  features: appKitFeatures,
})

export const wagmiConfig = wagmiAdapter.wagmiConfig

export const publicClients = APP_CONFIG.reduce<Record<number, PublicClient>>((clients, chain) => {
  const matchingChain = appChains.find((candidate) => candidate.id === chain.id)

  if (!matchingChain) {
    return clients
  }

  clients[chain.id] = createPublicClient({
    chain: matchingChain,
    transport: http(createRpcUrl(chain.rpcPath)),
  })

  return clients
}, {})
