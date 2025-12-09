/**
 * Test script for backend manual result setting endpoint
 * This tests the fallback mechanism when Chainlink Functions fails
 */

import fetch from 'node-fetch'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002'

// Test data - replace with actual gameweek and matchId from your active matches
const TEST_DATA = {
	gameweek: 1, // Replace with actual gameweek
	matchId: 124, // Replace with actual match ID (e.g., from the Chainlink request)
	homeScore: 2,
	awayScore: 1,
	status: 'FT', // Full Time
}

async function testManualResultSetting() {
	console.log('🧪 Testing Backend Manual Result Setting\n')
	console.log('API Base URL:', API_BASE_URL)
	console.log('Test Data:', TEST_DATA)
	console.log('')

	try {
		// Test 1: Check if result already exists
		console.log('📋 Step 1: Checking if result already exists...')
		const checkUrl = `${API_BASE_URL}/api/check-result?gameweek=${TEST_DATA.gameweek}&matchId=${TEST_DATA.matchId}`
		console.log('   URL:', checkUrl)
		
		const checkResponse = await fetch(checkUrl)
		const checkData = await checkResponse.json()
		
		console.log('   Response:', JSON.stringify(checkData, null, 2))
		console.log('')

		if (checkData.hasOutcome) {
			console.log('⚠️  Result already exists!')
			console.log('   Existing result:', checkData.result)
			console.log('')
			console.log('💡 To test with a different match, update TEST_DATA in this script')
			return
		}

		// Test 2: Set result manually
		console.log('📝 Step 2: Setting result manually via backend...')
		const setUrl = `${API_BASE_URL}/api/set-result-manually`
		console.log('   URL:', setUrl)
		console.log('   Method: POST')
		console.log('   Body:', TEST_DATA)
		console.log('')

		const setResponse = await fetch(setUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(TEST_DATA),
		})

		const setData = await setResponse.json()
		
		if (setResponse.ok) {
			console.log('✅ Success! Result set manually')
			console.log('   Response:', JSON.stringify(setData, null, 2))
			console.log('')
			console.log('🔗 View transaction on BaseScan:')
			console.log(`   https://sepolia.basescan.org/tx/${setData.transactionHash}`)
			console.log('')
			
			// Test 3: Verify result was set
			console.log('🔍 Step 3: Verifying result was set...')
			const verifyResponse = await fetch(checkUrl)
			const verifyData = await verifyResponse.json()
			
			if (verifyData.hasOutcome) {
				console.log('✅ Verification successful!')
				console.log('   Result:', verifyData.result)
			} else {
				console.log('⚠️  Result not found after setting (may need to wait for block confirmation)')
			}
		} else {
			console.log('❌ Error setting result')
			console.log('   Status:', setResponse.status)
			console.log('   Response:', JSON.stringify(setData, null, 2))
			
			if (setData.error?.includes('Blockchain connection not available')) {
				console.log('')
				console.log('💡 Make sure PRIVATE_KEY is set in backend/.env')
			}
		}
	} catch (error) {
		console.error('❌ Test failed:', error.message)
		console.error('')
		console.error('💡 Make sure:')
		console.error('   1. Backend server is running (npm run dev in backend/)')
		console.error('   2. PRIVATE_KEY is set in backend/.env')
		console.error('   3. Backend can connect to Base Sepolia RPC')
	}
}

// Run the test
testManualResultSetting()
	.then(() => {
		console.log('')
		console.log('✅ Test completed')
		process.exit(0)
	})
	.catch((error) => {
		console.error('❌ Test error:', error)
		process.exit(1)
	})

