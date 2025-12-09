import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { usePredictionContract, useEthBalance } from '@/hooks/useContracts'
import { Prediction, getPredictionLabel } from '@/lib/contracts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { formatEther, parseEther } from 'viem'

/**
 * Example component showing how to integrate with the deployed contracts
 * This demonstrates:
 * - Requesting match results from Chainlink Functions
 * - Placing bets on matches
 * - Checking token balance and approval
 * - Viewing match outcomes
 */
export const ContractIntegrationExample = () => {
	const { address, isConnected } = useAccount()
	const { placeBet, isPending: isPlacingBet } = usePredictionContract()
	const { balance, formatted: balanceFormatted, symbol } = useEthBalance()

	const [gameweek, setGameweek] = useState<string>('1')
	const [matchId, setMatchId] = useState<string>('1')
	const [betAmount, setBetAmount] = useState<string>('10')
	const [prediction, setPrediction] = useState<Prediction>(Prediction.HOME_WIN)

	const handlePlaceBet = async () => {
		if (!isConnected) {
			toast.error('Please connect your wallet')
			return
		}

		// Check if user has enough ETH balance
		const betAmountWei = parseEther(betAmount)
		if (balance < betAmountWei) {
			toast.error('Insufficient ETH balance')
			return
		}

		try {
			await placeBet(parseInt(gameweek), parseInt(matchId), prediction, betAmount)
		} catch (error) {
			console.error('Failed to place bet:', error)
		}
	}

	if (!isConnected) {
		return (
			<Card>
				<CardContent className="p-6">
					<p className="text-center text-muted-foreground">
						Please connect your wallet to interact with contracts
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			{/* ETH Balance Information */}
			<Card>
				<CardHeader>
					<CardTitle>ETH Balance</CardTitle>
					<CardDescription>Your ETH balance for betting</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4">
						<div>
							<Label>Balance</Label>
							<p className="text-2xl font-bold">
								{balanceFormatted} {symbol}
							</p>
						</div>
					</div>
					{balance === 0n && (
						<div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-600">
							⚠️ You need ETH to place bets. Get testnet ETH from a faucet.
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Results</CardTitle>
					<CardDescription>Results are fetched and settled by the backend; no on-chain request needed.</CardDescription>
				</CardHeader>
			</Card>

			{/* Place Bet */}
			<Card>
				<CardHeader>
					<CardTitle>Place Bet</CardTitle>
					<CardDescription>Place a bet on a match outcome</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="bet-gameweek">Gameweek</Label>
							<Input
								id="bet-gameweek"
								type="number"
								value={gameweek}
								onChange={(e) => setGameweek(e.target.value)}
								placeholder="1"
							/>
						</div>
						<div>
							<Label htmlFor="bet-matchId">Match ID</Label>
							<Input
								id="bet-matchId"
								type="number"
								value={matchId}
								onChange={(e) => setMatchId(e.target.value)}
								placeholder="1"
							/>
						</div>
					</div>
					<div>
						<Label htmlFor="bet-amount">Bet Amount (ETH)</Label>
						<Input
							id="bet-amount"
							type="number"
							value={betAmount}
							onChange={(e) => setBetAmount(e.target.value)}
							placeholder="10"
						/>
					</div>
					<div>
						<Label htmlFor="prediction">Prediction</Label>
						<Select
							value={prediction.toString()}
							onValueChange={(value) => setPrediction(parseInt(value) as Prediction)}
						>
							<SelectTrigger id="prediction">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={Prediction.HOME_WIN.toString()}>
									{getPredictionLabel(Prediction.HOME_WIN)}
								</SelectItem>
								<SelectItem value={Prediction.DRAW.toString()}>
									{getPredictionLabel(Prediction.DRAW)}
								</SelectItem>
								<SelectItem value={Prediction.AWAY_WIN.toString()}>
									{getPredictionLabel(Prediction.AWAY_WIN)}
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<Button
						onClick={handlePlaceBet}
						disabled={isPlacingBet || balance === 0n}
						className="w-full"
					>
						{isPlacingBet ? 'Placing Bet...' : 'Place Bet'}
					</Button>
					{balance === 0n && (
						<p className="text-sm text-muted-foreground text-center">
							You need ETH to place bets
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	)
}

