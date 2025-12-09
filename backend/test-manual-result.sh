#!/bin/bash
# Test script for backend manual result setting endpoint

API_BASE_URL="${API_BASE_URL:-http://localhost:3002}"

# Test data - UPDATE THESE with actual values from your Chainlink request
GAMEWEEK=1
MATCH_ID=124
HOME_SCORE=2
AWAY_SCORE=1
STATUS="FT"

echo "🧪 Testing Backend Manual Result Setting"
echo ""
echo "API Base URL: $API_BASE_URL"
echo "Test Data:"
echo "  Gameweek: $GAMEWEEK"
echo "  Match ID: $MATCH_ID"
echo "  Score: $HOME_SCORE - $AWAY_SCORE"
echo "  Status: $STATUS"
echo ""

# Step 1: Check if result exists
echo "📋 Step 1: Checking if result already exists..."
CHECK_URL="$API_BASE_URL/api/check-result?gameweek=$GAMEWEEK&matchId=$MATCH_ID"
echo "   URL: $CHECK_URL"
echo ""

CHECK_RESPONSE=$(curl -s "$CHECK_URL")
echo "   Response: $CHECK_RESPONSE"
echo ""

# Check if result exists
if echo "$CHECK_RESPONSE" | grep -q '"hasOutcome":true'; then
    echo "⚠️  Result already exists!"
    echo "   Use a different match ID or gameweek"
    exit 0
fi

# Step 2: Set result manually
echo "📝 Step 2: Setting result manually via backend..."
SET_URL="$API_BASE_URL/api/set-result-manually"
echo "   URL: $SET_URL"
echo "   Method: POST"
echo ""

SET_RESPONSE=$(curl -s -X POST "$SET_URL" \
    -H "Content-Type: application/json" \
    -d "{
        \"gameweek\": $GAMEWEEK,
        \"matchId\": $MATCH_ID,
        \"homeScore\": $HOME_SCORE,
        \"awayScore\": $AWAY_SCORE,
        \"status\": \"$STATUS\"
    }")

echo "   Response: $SET_RESPONSE"
echo ""

# Check if successful
if echo "$SET_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Success! Result set manually"
    echo ""
    
    # Extract transaction hash
    TX_HASH=$(echo "$SET_RESPONSE" | grep -o '"transactionHash":"[^"]*' | cut -d'"' -f4)
    if [ ! -z "$TX_HASH" ]; then
        echo "🔗 View transaction on BaseScan:"
        echo "   https://sepolia.basescan.org/tx/$TX_HASH"
        echo ""
    fi
    
    # Step 3: Verify
    echo "🔍 Step 3: Verifying result was set..."
    sleep 2
    VERIFY_RESPONSE=$(curl -s "$CHECK_URL")
    echo "   Response: $VERIFY_RESPONSE"
    
    if echo "$VERIFY_RESPONSE" | grep -q '"hasOutcome":true'; then
        echo "✅ Verification successful!"
    else
        echo "⚠️  Result not found yet (may need to wait for block confirmation)"
    fi
else
    echo "❌ Error setting result"
    echo ""
    echo "💡 Make sure:"
    echo "   1. PRIVATE_KEY is set in backend/.env"
    echo "   2. Backend can connect to Base Sepolia RPC"
    echo "   3. The deployer address matches the contract owner"
fi

