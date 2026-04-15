import { formatUnits } from 'viem'

export function shortenAddress(value?: string) {
  if (!value) {
    return 'Not connected'
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

export function formatTokenAmount(value: bigint, decimals: number, maximumFractionDigits = 6) {
  const formatted = Number(formatUnits(value, decimals))

  if (!Number.isFinite(formatted)) {
    return '0'
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(formatted)
}

export function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null) {
    if ('shortMessage' in error && typeof error.shortMessage === 'string') {
      return error.shortMessage
    }

    if ('message' in error && typeof error.message === 'string') {
      return error.message
    }
  }

  return 'Something went wrong.'
}
