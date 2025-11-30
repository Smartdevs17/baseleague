import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent, useBalance } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { CONTRACTS, ABIS, Prediction, MatchOutcome, Bet } from '@/lib/contracts'
import { toast } from 'sonner'
import { useRef, useEffect } from 'react'
import { getExplorerUrl } from '@/utils/explorer'

// Hook for ResultsConsumer contract
export const useResultsConsumer = () => {
	const { address, isConnected } = useAccount()
	const { writeContract, data: hash, isPending, error } = useWriteContract()
	const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
		hash,
	})

	// Request match result
	const requestResult = async (gameweek: number, matchId: number) => {
		if (!isConnected) {
			toast.error('Please connect your wallet')
			return
		}

		try {
			const txHash = await writeContract({
				address: CONTRACTS.RESULTS_CONSUMER,
				abi: ABIS.RESULTS_CONSUMER,
				functionName: 'requestResult',
				args: [BigInt(gameweek), BigInt(matchId)],
			})
			toast.success('Result request submitted!')
			return txHash
		} catch (err: any) {
			toast.error(err?.message || 'Failed to request result')
			throw err
		}
	}

	// Check if outcome exists (read hook)
	const hasOutcome = (gameweek: number, matchId: number) => {
		return useReadContract({
			address: CONTRACTS.RESULTS_CONSUMER,
			abi: ABIS.RESULTS_CONSUMER,
			functionName: 'hasOutcome',
			args: [BigInt(gameweek), BigInt(matchId)],
			query: {
				enabled: isConnected,
			},
		})
	}

	// Get match outcome
	const getOutcome = (gameweek: number, matchId: number) => {
		return useReadContract({
			address: CONTRACTS.RESULTS_CONSUMER,
			abi: ABIS.RESULTS_CONSUMER,
			functionName: 'getOutcome',
			args: [BigInt(gameweek), BigInt(matchId)],
			query: {
				enabled: isConnected,
			},
		})
	}

	return {
		requestResult,
		hasOutcome,
		getOutcome,
		isPending,
		isConfirming,
		isConfirmed,
		error,
		hash,
	}
}

	// Hook for PredictionContract
	export const usePredictionContract = () => {
		const { address, isConnected } = useAccount()
		const { writeContract, data: hash, isPending, error } = useWriteContract()
		const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
			hash,
		})
		
		// Use refs to track state so we can access latest values in async function
		const hashRef = useRef(hash)
		const isPendingRef = useRef(isPending)
		const errorRef = useRef(error)
		
		useEffect(() => {
			hashRef.current = hash
		}, [hash])
		
		useEffect(() => {
			isPendingRef.current = isPending
		}, [isPending])
		
		useEffect(() => {
			errorRef.current = error
		}, [error])

	// Place a bet (sends ETH directly)
	const placeBet = async (gameweek: number, matchId: number, prediction: Prediction, amount: string) => {
		if (!isConnected) {
			toast.error('Please connect your wallet')
			throw new Error('Wallet not connected')
		}

		try {
			console.log('🔍 [placeBet] Input parameters:', {
				gameweek,
				matchId,
				prediction,
				amountString: amount,
				amountType: typeof amount,
			})
			
			// Validate amount
			if (!amount || amount === '0' || parseFloat(amount) <= 0) {
				throw new Error('Invalid bet amount. Amount must be greater than 0.')
			}
			
			const amountWei = parseEther(amount)
			
			console.log('🔍 [placeBet] Amount conversion:', {
				amountString: amount,
				amountWei: amountWei.toString(),
				amountWeiHex: `0x${amountWei.toString(16)}`,
				amountEth: formatEther(amountWei),
			})
			
			console.log('🔍 [placeBet] Before writeContract call')
			console.log('  Current hash state:', hashRef.current)
			console.log('  isPending:', isPending)
			
			// In Wagmi v2, writeContract triggers the transaction and hash appears in hook state
			// Call writeContract (this opens MetaMask)
			console.log('🔍 [placeBet] Calling writeContract, waiting for user confirmation in MetaMask...')
			console.log('🔍 [placeBet] writeContract params:', {
				value: amountWei.toString(),
				valueHex: `0x${amountWei.toString(16)}`,
				gameweek,
				matchId,
				prediction,
			})
			
			// Call writeContract - this will open MetaMask
			// The promise might resolve immediately, hash appears in hook state
			let writeContractPromise: Promise<`0x${string}` | undefined>
			try {
				writeContractPromise = writeContract({
					address: CONTRACTS.PREDICTION_CONTRACT,
					abi: ABIS.PREDICTION_CONTRACT,
					functionName: 'placeBet',
					args: [BigInt(gameweek), BigInt(matchId), BigInt(prediction)],
					value: amountWei, // Send ETH with the transaction
				}) as Promise<`0x${string}` | undefined>
			} catch (callError: any) {
				// Immediate error (before MetaMask opens)
				const errorMessage = callError?.message || String(callError) || ''
				if (errorMessage.toLowerCase().includes('user rejected') || 
				    errorMessage.toLowerCase().includes('rejected')) {
					throw new Error('USER_REJECTED')
				}
				throw callError
			}
			
			// Wait for either:
			// 1. Promise to resolve (might return hash or undefined)
			// 2. Hash to appear in hook state
			// 3. User rejection error
			const maxWait = 60000 // 60 seconds - give user time to sign
			const interval = 300 // Check every 300ms
			let elapsed = 0
			let promiseResolved = false
			let promiseResult: `0x${string}` | undefined = undefined
			let promiseError: any = null
			
			// Start waiting for promise (in case it resolves or rejects)
			// Note: In Wagmi v2, the promise might not resolve with hash immediately
			// The hash usually appears in hook state after user confirms
			writeContractPromise
				.then((result) => {
					promiseResolved = true
					promiseResult = result
					console.log('✅ [placeBet] writeContract promise resolved:', result)
					// If promise resolved with hash, we can return it
					// But usually hash appears in hook state instead
				})
				.catch((err) => {
					promiseResolved = true
					promiseError = err
					console.log('❌ [placeBet] writeContract promise rejected:', err)
					// This usually means user rejected or there's an error
				})
			
			// Wait for hash to appear (either from promise or hook state)
			while (elapsed < maxWait) {
				await new Promise(resolve => setTimeout(resolve, interval))
				elapsed += interval
				
				// Check hook state for hash FIRST (this is where it usually appears)
				if (hashRef.current) {
					console.log('✅ [placeBet] Hash found in hook state:', hashRef.current)
					return hashRef.current
				}
				
				// Check if promise resolved with hash (less common in Wagmi v2)
				if (promiseResolved && promiseResult) {
					console.log('✅ [placeBet] Hash from promise:', promiseResult)
					return promiseResult
				}
				
				// Check if promise rejected (user rejection or error)
				if (promiseResolved && promiseError) {
					const errorMessage = promiseError?.message || String(promiseError) || ''
					const errorCode = promiseError?.code || promiseError?.error?.code || ''
					
					const isUserRejection = 
						errorCode === 4001 ||
						errorCode === 'ACTION_REJECTED' ||
						errorMessage.toLowerCase().includes('user rejected') ||
						errorMessage.toLowerCase().includes('user denied') ||
						errorMessage.toLowerCase().includes('rejected') ||
						errorMessage.toLowerCase().includes('denied') ||
						errorMessage.toLowerCase().includes('cancelled') ||
						errorMessage.toLowerCase().includes('canceled')
					
					if (isUserRejection) {
						throw new Error('USER_REJECTED')
					}
					
					// Real error from promise
					throw promiseError
				}
				
				// Check for errors in hook state (but only if not pending)
				const currentError = errorRef.current
				const currentIsPending = isPendingRef.current
				
				if (currentError && !currentIsPending) {
					const errorMessage = currentError?.message || String(currentError) || ''
					const isUserRejection = 
						errorMessage.toLowerCase().includes('user rejected') ||
						errorMessage.toLowerCase().includes('user denied') ||
						errorMessage.toLowerCase().includes('rejected') ||
						errorMessage.toLowerCase().includes('denied')
					
					if (isUserRejection) {
						throw new Error('USER_REJECTED')
					}
					
					console.error('❌ [placeBet] Error from hook:', currentError)
					throw currentError
				}
				
				// Log progress every 5 seconds
				if (elapsed % 5000 === 0 && elapsed > 0) {
					console.log(`⏳ [placeBet] Waiting for hash... (${elapsed/1000}s elapsed, isPending: ${currentIsPending}, promiseResolved: ${promiseResolved})`)
				}
			}
			
			// Timeout - check one more time
			if (hashRef.current) {
				console.log('✅ [placeBet] Hash found after timeout check:', hashRef.current)
				return hashRef.current
			}
			
			// If we get here, hash never appeared
			console.error('❌ [placeBet] Timeout waiting for hash after 60 seconds')
			throw new Error('Transaction hash not received. The transaction may have been rejected or is taking too long. Please check your wallet.')
		} catch (err: any) {
			console.error('❌ [placeBet] Error:', err)
			
			// Check if this is a user rejection
			const errorMessage = err?.message || String(err) || ''
			if (errorMessage === 'USER_REJECTED') {
				// User rejected - don't treat as error, just throw a specific error
				throw new Error('USER_REJECTED')
			}
			
			// Don't show toast here - let the caller handle it
			// Re-throw so caller can handle the error appropriately
			throw err
		}
	}

	// Settle match (owner only)
	const settleMatch = async (gameweek: number, matchId: number) => {
		if (!isConnected) {
			toast.error('Please connect your wallet')
			return
		}

		try {
			const txHash = await writeContract({
				address: CONTRACTS.PREDICTION_CONTRACT,
				abi: ABIS.PREDICTION_CONTRACT,
				functionName: 'settleMatch',
				args: [BigInt(gameweek), BigInt(matchId)],
			})
			toast.success('Match settlement submitted!', {
				action: txHash ? {
					label: 'View on Explorer',
					onClick: () => window.open(getExplorerUrl(txHash), '_blank'),
				} : undefined,
			})
			return txHash
		} catch (err: any) {
			toast.error(err?.message || 'Failed to settle match')
			throw err
		}
	}

	// Get bet details
	const getBet = (betId: bigint) => {
		return useReadContract({
			address: CONTRACTS.PREDICTION_CONTRACT,
			abi: ABIS.PREDICTION_CONTRACT,
			functionName: 'getBet',
			args: [betId],
			query: {
				enabled: isConnected,
			},
		})
	}

	// Get total bets for a match
	const getTotalBets = (gameweek: number, matchId: number) => {
		return useReadContract({
			address: CONTRACTS.PREDICTION_CONTRACT,
			abi: ABIS.PREDICTION_CONTRACT,
			functionName: 'getTotalBets',
			args: [BigInt(gameweek), BigInt(matchId)],
			query: {
				enabled: isConnected,
			},
		})
	}

	return {
		placeBet,
		settleMatch,
		getBet,
		getTotalBets,
		isPending,
		isConfirming,
		isConfirmed,
		error,
		hash,
	}
}

// Helper function to format balance with fixed precision (3 decimal places)
const formatBalance = (value: bigint | undefined, decimals: number = 3): string => {
	if (!value || value === 0n) return '0'
	const formatted = formatEther(value)
	const parts = formatted.split('.')
	if (parts.length === 1) return formatted
	// Truncate to specified decimal places
	const truncated = parts[0] + '.' + parts[1].substring(0, decimals)
	// Remove trailing zeros
	return parseFloat(truncated).toString()
}

// Hook for CELO Balance (replaces BLEAG token)
export const useEthBalance = () => {
	const { address, isConnected } = useAccount()
	const { data: balance, isLoading } = useBalance({
		address: address,
		query: {
			enabled: isConnected && !!address,
		},
	})

	return {
		balance: balance?.value || 0n,
		isLoading,
		formatted: formatBalance(balance?.value, 3), // Show 3 decimal places
		symbol: balance?.symbol || 'ETH', // Base Sepolia - show ETH
	}
}

// Hook to watch contract events (DISABLED - RPC free tier doesn't support eth_newFilter)
// Event watching requires eth_newFilter which is not available on free tier RPC providers
// The app will still work - matches will update via polling (nextBetId refetch every 5 seconds)
export const useContractEvents = () => {
	const { isConnected } = useAccount()

	// Disable event watching due to RPC limitations
	// Most free tier RPC providers don't support eth_newFilter
	// We rely on polling instead (nextBetId refetch in useContractMatches)
	
	// IMPORTANT: Always call hooks unconditionally to follow Rules of Hooks
	// Use the 'enabled' prop to control whether the hook is active
	// Watch BetPlaced events (disabled - RPC doesn't support filters)
	useWatchContractEvent({
		address: CONTRACTS.PREDICTION_CONTRACT,
		abi: ABIS.PREDICTION_CONTRACT,
		eventName: 'BetPlaced',
		enabled: false, // DISABLED - RPC doesn't support filters, and only enable when connected
		onLogs(logs) {
			logs.forEach((log) => {
				toast.success('Bet placed!', {
					action: log.transactionHash ? {
						label: 'View on Explorer',
						onClick: () => window.open(getExplorerUrl(log.transactionHash), '_blank'),
					} : undefined,
					description: `Gameweek ${log.args[2]}, Match ${log.args[3]}`,
				})
			})
		},
		onError(error) {
			// Silently ignore - expected on free tier RPC
			console.debug('Event watching not available (free tier RPC limitation)')
		},
	})

	// Return empty object since useWatchContractEvent doesn't return data
	return {}
}

