import { NETWORK } from '@/lib/contracts'

export function getExplorerUrl(txHash: string): string {
	return `${NETWORK.explorer}/tx/${txHash}`
}

export function getExplorerAddressUrl(address: string): string {
	return `${NETWORK.explorer}/address/${address}`
}

