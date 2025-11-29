import { Match, Fixture } from '@/types/match'
import { ApiFixture } from '@/store/fixtures'

// Mock fixtures data
export const mockFixtures: ApiFixture[] = [
	{
		id: '1',
		externalId: '12345',
		homeTeam: 'Arsenal',
		awayTeam: 'Chelsea',
		homeTeamId: '42',
		awayTeamId: '49',
		kickoffTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
		status: 'pending',
		gameweek: 1,
		pools: {
			win: { total: 0, betCount: 0 },
			draw: { total: 0, betCount: 0 },
			lose: { total: 0, betCount: 0 },
		},
		isPayoutProcessed: false,
		totalPoolSize: 0,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: '2',
		externalId: '12346',
		homeTeam: 'Manchester United',
		awayTeam: 'Liverpool',
		homeTeamId: '33',
		awayTeamId: '40',
		kickoffTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
		status: 'pending',
		gameweek: 1,
		pools: {
			win: { total: 0, betCount: 0 },
			draw: { total: 0, betCount: 0 },
			lose: { total: 0, betCount: 0 },
		},
		isPayoutProcessed: false,
		totalPoolSize: 0,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: '3',
		externalId: '12347',
		homeTeam: 'Manchester City',
		awayTeam: 'Tottenham',
		homeTeamId: '50',
		awayTeamId: '47',
		kickoffTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
		status: 'pending',
		gameweek: 1,
		pools: {
			win: { total: 0, betCount: 0 },
			draw: { total: 0, betCount: 0 },
			lose: { total: 0, betCount: 0 },
		},
		isPayoutProcessed: false,
		totalPoolSize: 0,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: '4',
		externalId: '12348',
		homeTeam: 'Newcastle',
		awayTeam: 'Brighton',
		homeTeamId: '34',
		awayTeamId: '51',
		kickoffTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
		status: 'pending',
		gameweek: 1,
		pools: {
			win: { total: 0, betCount: 0 },
			draw: { total: 0, betCount: 0 },
			lose: { total: 0, betCount: 0 },
		},
		isPayoutProcessed: false,
		totalPoolSize: 0,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: '5',
		externalId: '12349',
		homeTeam: 'Aston Villa',
		awayTeam: 'West Ham',
		homeTeamId: '66',
		awayTeamId: '48',
		kickoffTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
		status: 'pending',
		gameweek: 1,
		pools: {
			win: { total: 0, betCount: 0 },
			draw: { total: 0, betCount: 0 },
			lose: { total: 0, betCount: 0 },
		},
		isPayoutProcessed: false,
		totalPoolSize: 0,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
]

// Helper function to convert ApiFixture to Fixture
export const convertApiFixtureToFixture = (apiFixture: ApiFixture, getTeamLogo: (teamId: string, teamName: string) => string): Fixture => {
	return {
		id: parseInt(apiFixture.externalId),
		date: apiFixture.kickoffTime,
		homeTeam: apiFixture.homeTeam,
		awayTeam: apiFixture.awayTeam,
		homeTeamLogo: getTeamLogo(apiFixture.homeTeamId, apiFixture.homeTeam),
		awayTeamLogo: getTeamLogo(apiFixture.awayTeamId, apiFixture.awayTeam),
		status: apiFixture.status === 'pending' ? 'upcoming' : 
				apiFixture.status === 'live' ? 'live' : 
				apiFixture.status === 'finished' ? 'finished' : 'upcoming',
		league: 'Premier League',
	}
}

// Mock matches data
export const mockOpenMatches: Match[] = [
	{
		id: '1',
		creator: '0x1234567890123456789012345678901234567890',
		stake: '5000000000000000', // 0.005 ETH
		fixtureId: 12345,
		fixture: {
			id: 12345,
			date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
			homeTeam: 'Arsenal',
			awayTeam: 'Chelsea',
			homeTeamLogo: 'https://media.api-sports.io/football/teams/42.png',
			awayTeamLogo: 'https://media.api-sports.io/football/teams/49.png',
			status: 'upcoming',
			league: 'Premier League',
		},
		creatorPrediction: 'home',
		settled: false,
		status: 'open',
		createdAt: Date.now() - 3600000,
	},
	{
		id: '2',
		creator: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
		stake: '5000000000000000', // 0.005 ETH
		fixtureId: 12346,
		fixture: {
			id: 12346,
			date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
			homeTeam: 'Manchester United',
			awayTeam: 'Liverpool',
			homeTeamLogo: 'https://media.api-sports.io/football/teams/33.png',
			awayTeamLogo: 'https://media.api-sports.io/football/teams/40.png',
			status: 'upcoming',
			league: 'Premier League',
		},
		creatorPrediction: 'draw',
		settled: false,
		status: 'open',
		createdAt: Date.now() - 7200000,
	},
]

export const mockActiveMatches: Match[] = [
	{
		id: '3',
		creator: '0x9876543210987654321098765432109876543210',
		joiner: '0xfedcbafedcbafedcbafedcbafedcbafedcbafed',
		stake: '5000000000000000', // 0.005 ETH
		fixtureId: 12347,
		fixture: {
			id: 12347,
			date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
			homeTeam: 'Manchester City',
			awayTeam: 'Tottenham',
			homeTeamLogo: 'https://media.api-sports.io/football/teams/50.png',
			awayTeamLogo: 'https://media.api-sports.io/football/teams/47.png',
			status: 'upcoming',
			league: 'Premier League',
		},
		creatorPrediction: 'home',
		joinerPrediction: 'away',
		settled: false,
		status: 'active',
		createdAt: Date.now() - 86400000,
	},
]

export const mockCompletedMatches: Match[] = [
	{
		id: '4',
		creator: '0x5555555555555555555555555555555555555555',
		joiner: '0x6666666666666666666666666666666666666666',
		stake: '5000000000000000', // 0.005 ETH
		fixtureId: 12348,
		fixture: {
			id: 12348,
			date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
			homeTeam: 'Newcastle',
			awayTeam: 'Brighton',
			homeTeamLogo: 'https://media.api-sports.io/football/teams/34.png',
			awayTeamLogo: 'https://media.api-sports.io/football/teams/51.png',
			status: 'finished',
			score: { home: 2, away: 1 },
			league: 'Premier League',
		},
		creatorPrediction: 'home',
		joinerPrediction: 'away',
		settled: true,
		winner: '0x5555555555555555555555555555555555555555',
		status: 'completed',
		createdAt: Date.now() - 86400000 * 3,
	},
]

// Mock user stats
export const mockUserStats = {
	totalMatches: 5,
	wins: 3,
	losses: 2,
	totalStaked: '25000000000000000', // 0.025 ETH (5 matches * 0.005 ETH)
	totalWinnings: '15000000000000000', // 0.015 ETH
	winRate: 60,
}

// Mock token balance
export const mockTokenBalance = '1000000000000000000000' // 1000 tokens
export const mockTokenAllowance = '500000000000000000000' // 500 tokens

