import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { useResultsConsumer, usePredictionContract, useEthBalance } from '@/hooks/useContracts'
import { Prediction, getPredictionLabel } from '@/lib/contracts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
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
	const { requestResult, getOutcome, isPending: isRequesting } = useResultsConsumer()
	const { placeBet, isPending: isPlacingBet } = usePredictionContract()
	const { balance, formatted: balanceFormatted, symbol } = useEthBalance()

	const [gameweek, setGameweek] = useState<string>('1')
	const [matchId, setMatchId] = useState<string>('1')
	const [betAmount, setBetAmount] = useState<string>('10')
	const [prediction, setPrediction] = useState<Prediction>(Prediction.HOME_WIN)

	// Get match outcome
	const outcomeQuery = getOutcome(parseInt(gameweek), parseInt(matchId))
	const hasOutcome = outcomeQuery.data?.exists || false

	const handleRequestResult = async () => {
		if (!isConnected) {
			toast.error('Please connect your wallet')
			return
		}

		try {
			await requestResult(parseInt(gameweek), parseInt(matchId))
		} catch (error) {
			console.error('Failed to request result:', error)
		}
	}


	const handlePlaceBet = async () => {
		if (!isConnected) {
			toast.error('Please connect your wallet')
			return
		}

		// Check if user has enough CELO balance
		const betAmountWei = parseEther(betAmount)
		if (balance < betAmountWei) {
			toast.error('Insufficient CELO balance')
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
			{/* CELO Balance Information */}
			<Card>
				<CardHeader>
					<CardTitle>CELO Balance</CardTitle>
					<CardDescription>Your CELO balance for betting</CardDescription>
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
							⚠️ You need CELO to place bets. Get testnet CELO from a faucet.
						</div>
					)}
				</CardContent>
			</Card>

			{/* Request Match Result */}
			<Card>
				<CardHeader>
					<CardTitle>Request Match Result</CardTitle>
					<CardDescription>
						Request match result from Chainlink Functions (FPL API)
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="gameweek">Gameweek</Label>
							<Input
								id="gameweek"
								type="number"
								value={gameweek}
								onChange={(e) => setGameweek(e.target.value)}
								placeholder="1"
							/>
						</div>
						<div>
							<Label htmlFor="matchId">Match ID</Label>
							<Input
								id="matchId"
								type="number"
								value={matchId}
								onChange={(e) => setMatchId(e.target.value)}
								placeholder="1"
							/>
						</div>
					</div>
					<Button
						onClick={handleRequestResult}
						disabled={isRequesting}
						className="w-full"
					>
						{isRequesting ? 'Requesting...' : 'Request Result'}
					</Button>
				</CardContent>
			</Card>

			{/* Match Outcome */}
			{hasOutcome && outcomeQuery.data && (
				<Card>
					<CardHeader>
						<CardTitle>Match Result</CardTitle>
						<CardDescription>Result from Chainlink Functions</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex justify-between">
								<span>Home Score:</span>
								<Badge variant="outline">{outcomeQuery.data.homeScore.toString()}</Badge>
							</div>
							<div className="flex justify-between">
								<span>Away Score:</span>
								<Badge variant="outline">{outcomeQuery.data.awayScore.toString()}</Badge>
							</div>
							<div className="flex justify-between">
								<span>Status:</span>
								<Badge>{outcomeQuery.data.status}</Badge>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

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
						<Label htmlFor="bet-amount">Bet Amount (CELO)</Label>
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
							You need CELO to place bets
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	)
}

