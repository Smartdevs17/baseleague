#!/bin/bash
# Quick test of backend manual result endpoint

echo "🧪 Quick Backend Test"
echo ""

# Test 1: Health check
echo "1️⃣  Testing health endpoint..."
curl -s http://localhost:3002/health
echo ""
echo ""

# Test 2: Check result endpoint (read-only, doesn't need PRIVATE_KEY)
echo "2️⃣  Testing check-result endpoint (read-only)..."
curl -s "http://localhost:3002/api/check-result?gameweek=1&matchId=124"
echo ""
echo ""

# Test 3: Try to set result (requires PRIVATE_KEY)
echo "3️⃣  Testing set-result-manually endpoint..."
echo "   (This will fail if PRIVATE_KEY is not set)"
RESPONSE=$(curl -s -X POST "http://localhost:3002/api/set-result-manually" \
  -H "Content-Type: application/json" \
  -d '{
    "gameweek": 1,
    "matchId": 999,
    "homeScore": 2,
    "awayScore": 1,
    "status": "FT"
  }')

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q "Blockchain connection not available"; then
    echo "⚠️  PRIVATE_KEY not set in backend/.env"
    echo "   Add: PRIVATE_KEY=your_private_key_here"
elif echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Backend is working! Result set successfully"
else
    echo "📋 Response received (may be an error or existing result)"
fi

