#!/bin/bash
# Set result for a failed Chainlink Functions request
# Usage: ./set-result-for-chainlink-request.sh <gameweek> <matchId> <homeScore> <awayScore>

API_BASE_URL="${API_BASE_URL:-http://localhost:3002}"

if [ $# -lt 4 ]; then
    echo "Usage: $0 <gameweek> <matchId> <homeScore> <awayScore> [status]"
    echo ""
    echo "Example:"
    echo "  $0 1 124 2 1 FT"
    echo ""
    echo "For the Chainlink request that failed, you need to:"
    echo "  1. Find the gameweek and matchId from the Chainlink request details"
    echo "  2. Get the actual match result from FPL API or manually"
    echo "  3. Run this script with those values"
    exit 1
fi

GAMEWEEK=$1
MATCH_ID=$2
HOME_SCORE=$3
AWAY_SCORE=$4
STATUS="${5:-FT}"

echo "🔧 Setting Result for Failed Chainlink Request"
echo ""
echo "Match Details:"
echo "  Gameweek: $GAMEWEEK"
echo "  Match ID: $MATCH_ID"
echo "  Score: $HOME_SCORE - $AWAY_SCORE"
echo "  Status: $STATUS"
echo ""

# Check if result already exists
echo "📋 Checking if result already exists..."
CHECK_RESPONSE=$(curl -s "$API_BASE_URL/api/check-result?gameweek=$GAMEWEEK&matchId=$MATCH_ID")

if echo "$CHECK_RESPONSE" | grep -q '"hasOutcome":true'; then
    echo "⚠️  Result already exists!"
    echo "$CHECK_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CHECK_RESPONSE"
    exit 0
fi

# Set result
echo "📝 Setting result manually..."
SET_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/set-result-manually" \
    -H "Content-Type: application/json" \
    -d "{
        \"gameweek\": $GAMEWEEK,
        \"matchId\": $MATCH_ID,
        \"homeScore\": $HOME_SCORE,
        \"awayScore\": $AWAY_SCORE,
        \"status\": \"$STATUS\"
    }")

echo "$SET_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SET_RESPONSE"
echo ""

if echo "$SET_RESPONSE" | grep -q '"success":true'; then
    TX_HASH=$(echo "$SET_RESPONSE" | grep -o '"transactionHash":"[^"]*' | cut -d'"' -f4)
    echo "✅ Result set successfully!"
    echo ""
    echo "🔗 Transaction: https://sepolia.basescan.org/tx/$TX_HASH"
    echo ""
    echo "💡 Next step: Settle the match in PredictionContract using the 'Settle Match' button in the UI"
else
    echo "❌ Failed to set result"
    echo "   Check the error message above"
fi

