import { formatEther, formatUnits } from 'viem'

/**
 * Format ETH amount with smart precision
 * Shows more decimal places for small amounts, fewer for large amounts
 * Never shows "0.000 ETH" when there's actually a small amount
 */
export function formatEth(value: bigint | string, options?: {
	minDecimals?: number
	maxDecimals?: number
	showZero?: boolean
}): string {
	const {
		minDecimals = 0,
		maxDecimals = 6,
		showZero = true,
	} = options || {}

	// Convert to number for easier manipulation
	const ethValue = typeof value === 'string' ? parseFloat(formatEther(BigInt(value))) : parseFloat(formatEther(value))

	// Handle zero
	if (ethValue === 0) {
		return showZero ? '0 ETH' : '0'
	}

	// For very small amounts (< 0.000001), show up to 9 decimals
	if (ethValue < 0.000001) {
		const formatted = ethValue.toFixed(9)
		// Remove trailing zeros
		return `${parseFloat(formatted)} ETH`
	}

	// For small amounts (< 0.001), show up to 6 decimals
	if (ethValue < 0.001) {
		const formatted = ethValue.toFixed(6)
		// Remove trailing zeros but keep at least 3 decimal places
		const num = parseFloat(formatted)
		if (num === 0) return '0 ETH'
		return `${num.toFixed(Math.max(3, maxDecimals))} ETH`
	}

	// For medium amounts (< 1), show 3-4 decimals
	if (ethValue < 1) {
		return `${ethValue.toFixed(4)} ETH`
	}

	// For larger amounts, show 2-3 decimals
	if (ethValue < 100) {
		return `${ethValue.toFixed(3)} ETH`
	}

	// For very large amounts, show 2 decimals
	return `${ethValue.toFixed(2)} ETH`
}

/**
 * Format ETH amount with fixed decimal places (for consistency)
 */
export function formatEthFixed(value: bigint | string, decimals: number = 6): string {
	const ethValue = typeof value === 'string' ? parseFloat(formatEther(BigInt(value))) : parseFloat(formatEther(value))
	
	if (ethValue === 0) {
		return '0 ETH'
	}

	// For very small amounts, show more decimals
	if (ethValue < 0.000001) {
		return `${ethValue.toFixed(9)} ETH`
	}

	return `${ethValue.toFixed(decimals)} ETH`
}

/**
 * Format ETH amount for display in UI components
 * Automatically adjusts precision based on amount size
 */
export function formatEthDisplay(value: bigint | string): string {
	return formatEth(value, {
		minDecimals: 0,
		maxDecimals: 6,
		showZero: true,
	})
}

