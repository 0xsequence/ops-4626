import { createAppKit } from '@reown/appkit/react'
import { mainnet, polygon } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createPublicClient, http, type PublicClient } from 'viem'

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

function createRpcUrl(path: 'mainnet' | 'polygon') {
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

export const appChains = [ethereumChain, polygonChain] as [typeof ethereumChain, typeof polygonChain]

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: appChains,
  ssr: false,
})

createAppKit({
  adapters: [wagmiAdapter],
  networks: appChains,
  projectId,
  metadata,
  features: {
    analytics: false,
    email: false,
    socials: [],
  },
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
