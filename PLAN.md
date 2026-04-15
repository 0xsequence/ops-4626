# ERC-4626 Vault Utility App Plan

## Repo Status

The repository is currently empty, so this plan assumes a fresh TypeScript + React app setup.

## Recommendations

### Design system

Agreed: `shadcn/ui` with Tailwind CSS.

### Wallet connection

Recommended: `wagmi` + `viem` + `Reown AppKit`.

Why:
- `wagmi` is the cleanest React integration when using `viem`
- `Reown AppKit` is a strong fit when WalletConnect support is a priority
- It works with `wagmi`, so our React state and contract interaction model stays clean
- WalletConnect support is first-class through the Reown / WalletConnect project configuration
- We still keep contract reads/writes in the `viem` / `wagmi` ecosystem instead of mixing stacks

If we want the absolute minimum dependency surface later, we can still replace AppKit with custom `wagmi` connectors, but for this app I recommend AppKit because WalletConnect matters to us.

## Product Scope

Single-page utility app for interacting with supported ERC-4626 vaults.

Primary user actions:
- Connect wallet
- See connected wallet address
- Select supported chain
- Select supported vault from config
- View current vault position for the connected wallet
- View underlying asset details
- Deposit more underlying asset into the vault
- Withdraw part of the position or withdraw all

## Core Technical Decisions

### Frontend stack

- React + TypeScript
- Vite 8 for local development and production builds
- `pnpm` as the package manager
- Tailwind CSS
- `shadcn/ui`
- `wagmi`
- `viem`
- `@tanstack/react-query`
- `Reown AppKit`

### Package management

We should use `pnpm` for dependency installation and script execution.

Examples:

- Install dependencies: `pnpm install`
- Run local dev server: `pnpm dev`
- Build production bundle: `pnpm build`
- Preview production bundle: `pnpm preview`

### Config-driven vault support

We will define supported chains and vaults in a `config.ts` file.

Suggested shape:

```ts
type VaultConfig = {
  name: string
  address: `0x${string}`
}

type ChainConfig = {
  id: number
  name: string
  rpcUrl: string
  vaults: VaultConfig[]
}

export const APP_CONFIG: ChainConfig[] = [
  {
    id: 1,
    name: 'Ethereum',
    rpcUrl: `https://nodes.sequence.app/mainnet/${import.meta.env.VITE_SEQUENCE_ACCESS_KEY}`,
    vaults: [
      {
        name: 'Alpha USDC Forex V2',
        address: '0x153Bd1abE60104Bd46aa05a27fA12D1346D64A57',
      },
    ],
  },
  {
    id: 137,
    name: 'Polygon',
    rpcUrl: `https://nodes.sequence.app/polygon/${import.meta.env.VITE_SEQUENCE_ACCESS_KEY}`,
    vaults: [],
  },
]
```

The UI will derive the chain dropdown and vault dropdown directly from this config.

### Supported chains for v1

- Ethereum Mainnet (`id: 1`)
- Polygon (`id: 137`)

RPC endpoints to use:

- Ethereum: `https://nodes.sequence.app/mainnet/<SEQUENCE_ACCESS_KEY>`
- Polygon: `https://nodes.sequence.app/polygon/<SEQUENCE_ACCESS_KEY>`

### Initial test vault

For the first implementation pass, we should include this Ethereum mainnet vault in `config.ts`:

- Chain: Ethereum Mainnet (`id: 1`)
- Vault name: `Alpha USDC Forex V2`
- Vault address: `0x153Bd1abE60104Bd46aa05a27fA12D1346D64A57`
- Reference: `https://app.morpho.org/ethereum/vault/0x153Bd1abE60104Bd46aa05a27fA12D1346D64A57/alpha-usdc-forex-v2`

This gives us a concrete real-world ERC-4626 target while keeping the app config-driven for additional vaults later.

### Reown configuration

We should configure Reown AppKit with:

- Project ID: `6c925148f99706f295d774b730eba1f2`

Suggested environment setup:

```bash
VITE_REOWN_PROJECT_ID=6c925148f99706f295d774b730eba1f2
VITE_SEQUENCE_ACCESS_KEY=
```

Even though this value is used client-side, it is still cleaner to keep it in an environment variable rather than hardcoding it across the app.

### Environment files

We should use a `.env` file for local development.

Suggested initial `.env`:

```bash
VITE_REOWN_PROJECT_ID=6c925148f99706f295d774b730eba1f2
VITE_SEQUENCE_ACCESS_KEY=AQAAAAAAAKF1SMnmyl3VgghxQiiIQtMGULA
```

Suggested `.env.example`:

```bash
VITE_REOWN_PROJECT_ID=
VITE_SEQUENCE_ACCESS_KEY=
```

If we later need app metadata, analytics flags, or a deployment-specific base URL, we can add those as additional `VITE_` variables.

The app should build the Sequence RPC URLs from `VITE_SEQUENCE_ACCESS_KEY` rather than hardcoding a specific access key in source.

### Git ignore rules

We should add a standard `.gitignore` for a Vite + React + TypeScript + pnpm project.

At minimum, ignore:

- `node_modules/`
- `dist/`
- `.env`
- `.env.local`
- `.env.*.local`
- `.DS_Store`
- `*.log`
- `.vite`

Reasoning:

- `node_modules/` and `dist/` are generated artifacts
- `.env` files can contain deployment-specific values
- log and OS files should not be committed

### Build and static deployment

Recommended approach: use Vite itself for the release bundle.

- Local dev: `vite`
- Production build: `vite build`
- Local verification of production bundle: `vite preview`
- Deployment artifact: static files in `dist/`

Because this app is a client-side React SPA with direct wallet/onchain access and no backend rendering requirements, Vite's static output is the simplest and best fit.

Deployment note:

- If we deploy at the domain root, the default Vite setup is fine
- If we deploy under a subpath, we should set Vite's `base` config before building
- If we later add client-side routes, the static host must be configured to serve `index.html` as the fallback

Good static hosting targets later include Cloudflare Pages, Netlify, Vercel static output, S3 + CloudFront, or any nginx-based static host.

## Functional Plan

### 1. Wallet and network setup

- Add a wallet connect button in the header/top area
- Show the connected wallet address in shortened form
- Support injected wallets plus WalletConnect
- Detect if the user is on the wrong chain for the selected vault
- Prompt network switch when supported by the wallet

### 2. Chain and vault selection

- Chain dropdown shows configured chain name and chain ID
- Vault dropdown shows vault name and address
- Changing the chain resets the vault selection to a vault on that chain
- Selected vault drives all reads and write actions

### 3. Vault position query

For the selected vault and connected wallet, read:
- `asset()` from the ERC-4626 vault to discover the underlying ERC-20
- `balanceOf(user)` from the vault to get user share balance
- `convertToAssets(shares)` to show the user’s deposited amount in underlying asset terms

For the underlying token, read:
- `name()`
- `symbol()`
- `decimals()`
- `balanceOf(user)` for available wallet balance

Display:
- Vault name
- Vault address
- Underlying token name
- Underlying token symbol
- Underlying token address
- Token decimals-aware deposited amount
- Optional share balance if useful for debugging/transparency

### 4. Deposit flow

When user clicks `Deposit`:
- Open a modal
- Show vault name and asset token details
- Show wallet token balance
- Let user enter an amount in underlying asset units

Write flow:
- Check ERC-20 allowance for the vault
- If allowance is insufficient, submit `approve()` first
- After approval confirmation, submit vault `deposit(assets, receiver)`
- Wait for transaction receipt
- Show success or error toast/notification
- Refetch vault position and wallet balance after completion

### 5. Withdraw flow

Withdraw button is enabled only when the user has a vault position.

When user clicks `Withdraw`:
- Open a modal
- Show current deposited amount
- Let user enter an amount to withdraw in underlying asset units
- Offer `Withdraw all`

Write flow:
- For partial withdraw, call `withdraw(assets, receiver, owner)`
- For withdraw all, prefer `redeem(shares, receiver, owner)` using the full share balance
- Wait for transaction receipt
- Show success or error toast/notification
- Refetch vault position and wallet balance after completion

Using `redeem()` for withdraw-all avoids rounding issues when converting the entire position back to assets.

## Proposed UI Structure

### Main page sections

1. Header
- App title
- Connected wallet button / address

2. Vault selector card
- Chain selector
- Vault selector

3. Vault position card
- Selected vault name and address
- Asset token name, symbol, address
- Current deposited amount
- Action buttons: `Deposit` and `Withdraw`

4. Modal dialogs
- Deposit modal
- Withdraw modal

### UX style

- Keep layout clean and compact
- Prefer cards/forms over dashboard-style complexity
- Use toasts for transaction lifecycle feedback
- Keep labels explicit because this is a financial utility app

## State Management Plan

Use local React state for selections and modal visibility.

Use `wagmi` / `react-query` for:
- Wallet connection state
- Contract reads
- Transaction status
- Refetch/invalidation after writes

No separate global state library should be needed.

## Contract Interaction Plan

### ABIs needed

- Minimal ERC-4626 ABI
- Minimal ERC-20 ABI

### Read calls

- Vault: `asset`, `balanceOf`, `convertToAssets`
- Token: `name`, `symbol`, `decimals`, `balanceOf`, `allowance`

### Write calls

- Token: `approve`
- Vault: `deposit`, `withdraw`, `redeem`

## Edge Cases To Handle

- No wallet connected
- No vault selected
- Wrong network selected in wallet
- User has zero vault balance
- User has insufficient token balance for deposit
- User rejects wallet signature
- Approval succeeds but deposit fails
- Selected vault/token contract call reverts
- Tokens with unusual metadata behavior

## Suggested File Structure

```text
src/
  app/
    providers.tsx
  components/
    wallet-button.tsx
    chain-select.tsx
    vault-select.tsx
    vault-position-card.tsx
    deposit-modal.tsx
    withdraw-modal.tsx
  config/
    config.ts
  lib/
    abis/
      erc20.ts
      erc4626.ts
    format.ts
    wagmi.ts
  hooks/
    use-selected-vault.ts
    use-vault-data.ts
    use-deposit.ts
    use-withdraw.ts
  pages/
    home.tsx
  main.tsx
```

We can collapse some of this if you want an even smaller codebase, but this is still fairly lean.

## Implementation Order

1. Scaffold the React + TypeScript app and install base dependencies with `pnpm`
2. Configure Vite 8, `.env`, Tailwind, `shadcn/ui`, `wagmi`, `viem`, `Reown AppKit`
3. Add a standard `.gitignore` before installing dependencies
4. Add `config.ts` for supported chains, RPC URLs, and vaults
5. Build wallet connection and header UI
6. Build chain + vault selection UI
7. Add read-only vault position queries
8. Implement deposit modal and approval/deposit flow
9. Implement withdraw modal and partial/full withdrawal flow
10. Add transaction feedback, loading states, and refetch behavior
11. Final pass on formatting, empty states, and wrong-network handling

## Assumptions To Confirm Before Build

- We are okay using `Reown AppKit` for the wallet connection UI
- We are using `shadcn/ui` + Tailwind CSS
- The initial version is a single-page app with no routing complexity
- Local development and release builds will use Vite 8
- `pnpm` will be the package manager
- Release deployment target is static files produced by `vite build`
- We will add a standard `.gitignore` including `node_modules/`, `dist/`, and local env files
- Supported chains and vaults will be hardcoded in `config.ts`
- Initial supported chains are Ethereum mainnet and Polygon
- Reown AppKit will use project ID `6c925148f99706f295d774b730eba1f2`
- Sequence RPC access will use `VITE_SEQUENCE_ACCESS_KEY`
- Initial supported vault should include Ethereum mainnet `Alpha USDC Forex V2` at `0x153Bd1abE60104Bd46aa05a27fA12D1346D64A57`
- We will use direct onchain reads only, with no indexer or backend

## Summary Recommendation

For this app, I recommend:

- UI: `shadcn/ui` + Tailwind CSS
- Wallet stack: `wagmi` + `viem` + `Reown AppKit`
- App style: simple single-page utility UI, fully config-driven for supported chains and vaults

This is the smallest setup that still gives us solid WalletConnect support, clean React ergonomics, and straightforward ERC-4626 contract interactions.
