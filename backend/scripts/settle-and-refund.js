import { config } from '../config/index.js'
import { processActiveMatches } from '../services/matchSettlementService.js'
import { ethers } from 'ethers'

/**
 * One-off utility script to:
 * - Settle all active matches (uses existing cron logic, including FPL fallback)
 * - Refund unmatched single-sided bets (requires refundUnmatchedBet in contract)
 *
 * Usage:
 *   OWNER_ADDRESS=0x575109e921c6d6a1cb7ca60be0191b10950afa6c \
 *   PRIVATE_KEY=... \
 *   RPC_URL=... \
 *   node backend/scripts/settle-and-refund.js
 */
async function main() {
	console.log('🔧 Running settle-and-refund script')
	console.log(`Owner address: ${config.blockchain.ownerAddress}`)

	if (!config.blockchain.privateKey) {
		console.error('❌ PRIVATE_KEY is required to run settlement/refund')
		process.exit(1)
	}

	// Settle all active matches (multi-sided)
	const result = await processActiveMatches()
	console.log('✅ Settlement run complete:', result)

	// Refund unmatched single-sided bets (no fee)
	await refundUnmatchedBets()
}

async function refundUnmatchedBets() {
	console.log('🔁 Scanning for unmatched bets to refund...')

	const provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl)
	const signer = new ethers.Wallet(config.blockchain.privateKey, provider)
	if (signer.address.toLowerCase() !== config.blockchain.ownerAddress.toLowerCase()) {
		console.warn('⚠️ Signer is not the configured owner; refunds will likely revert.')
	}

	const abi = [
		'function nextBetId() view returns (uint256)',
		'function bets(uint256) view returns (address bettor,uint256 gameweek,uint256 matchId,uint256 amount,uint8 prediction,bool isSettled,bool isWinner,uint256 timestamp)',
		'function settledMatches(uint256,uint256) view returns (bool)',
		'function refundUnmatchedBet(uint256,uint256)',
	]

	const contract = new ethers.Contract(config.blockchain.predictionContractAddress, abi, signer)
	const nextBetId = await contract.nextBetId()

	const matchCounts = new Map()
	for (let i = 0n; i < nextBetId; i++) {
		const bet = await contract.bets(i)
		if (bet.isSettled) continue
		const key = `${bet.gameweek}-${bet.matchId}`
		const current = matchCounts.get(key) || []
		current.push({ betId: i, bet })
		matchCounts.set(key, current)
	}

	let refunded = 0
	for (const [key, list] of matchCounts.entries()) {
		if (list.length !== 1) continue
		const [betEntry] = list
		const gw = Number(betEntry.bet.gameweek)
		const mid = Number(betEntry.bet.matchId)

		// Skip if already settled at match level
		const already = await contract.settledMatches(gw, mid)
		if (already) continue

		console.log(`   ↪️ Refunding unmatched bet for match ${key} (betId ${betEntry.betId})`)
		const tx = await contract.refundUnmatchedBet(gw, mid)
		await tx.wait()
		refunded++
	}

	console.log(`✅ Refund pass complete. Refunded: ${refunded}`)
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})

