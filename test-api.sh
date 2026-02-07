#!/bin/bash

# VaultLink API Test Script
# Tests basic functionality of the VaultLink backend

API_URL="${API_URL:-http://localhost:5000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================"
echo "VaultLink API Test Suite"
echo "================================"
echo "API URL: $API_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}Warning: jq is not installed. Install it for better output formatting:${NC}"
    echo "  Ubuntu/Debian: sudo apt-get install jq"
    echo "  macOS: brew install jq"
    echo ""
fi

# Test counter
PASSED=0
FAILED=0

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2
    local expected_pattern=$3
    
    echo -e "${YELLOW}Running: $test_name${NC}"
    
    response=$(eval $test_command 2>&1)
    http_code=$(echo "$response" | tail -n 1)
    
    if echo "$response" | grep -q "$expected_pattern"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "Response: $response"
        ((FAILED++))
    fi
    echo ""
}

# Test 1: Health Check
echo "Test 1: Health Check"
echo "--------------------"
response=$(curl -s -w "\n%{http_code}" $API_URL/health)
http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    if command -v jq &> /dev/null; then
        echo "$body" | jq '.'
    else
        echo "$body"
    fi
    ((PASSED++))
else
    echo -e "${RED}✗ Health check failed (HTTP $http_code)${NC}"
    ((FAILED++))
fi
echo ""

# Test 2: Text Upload
echo "Test 2: Text Upload (Default Expiry)"
echo "-----------------------------------"
response=$(curl -s -w "\n%{http_code}" -X POST $API_URL/api/upload \
  -F "type=text" \
  -F "content=Hello from automated test!")

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "201" ]; then
    echo -e "${GREEN}✓ Text upload successful${NC}"
    if command -v jq &> /dev/null; then
        echo "$body" | jq '.'
        UNIQUE_ID=$(echo "$body" | jq -r '.uniqueId')
    else
        echo "$body"
        UNIQUE_ID=$(echo "$body" | grep -o '"uniqueId":"[^"]*"' | cut -d'"' -f4)
    fi
    echo "Unique ID: $UNIQUE_ID"
    ((PASSED++))
else
    echo -e "${RED}✗ Text upload failed (HTTP $http_code)${NC}"
    echo "$body"
    ((FAILED++))
    UNIQUE_ID=""
fi
echo ""

# Test 3: Retrieve Text Content
if [ -n "$UNIQUE_ID" ]; then
    echo "Test 3: Retrieve Text Content"
    echo "-----------------------------"
    sleep 1
    response=$(curl -s -w "\n%{http_code}" $API_URL/api/content/$UNIQUE_ID)
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ Content retrieval successful${NC}"
        if command -v jq &> /dev/null; then
            echo "$body" | jq '.'
        else
            echo "$body"
        fi
        ((PASSED++))
    else
        echo -e "${RED}✗ Content retrieval failed (HTTP $http_code)${NC}"
        echo "$body"
        ((FAILED++))
    fi
    echo ""
fi

# Test 4: File Upload
echo "Test 4: File Upload"
echo "------------------"
echo "This is a test file for VaultLink" > /tmp/vaultlink-test.txt

response=$(curl -s -w "\n%{http_code}" -X POST $API_URL/api/upload \
  -F "type=file" \
  -F "file=@/tmp/vaultlink-test.txt")

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "201" ]; then
    echo -e "${GREEN}✓ File upload successful${NC}"
    if command -v jq &> /dev/null; then
        echo "$body" | jq '.'
        FILE_UNIQUE_ID=$(echo "$body" | jq -r '.uniqueId')
    else
        echo "$body"
        FILE_UNIQUE_ID=$(echo "$body" | grep -o '"uniqueId":"[^"]*"' | cut -d'"' -f4)
    fi
    echo "File Unique ID: $FILE_UNIQUE_ID"
    ((PASSED++))
else
    echo -e "${RED}✗ File upload failed (HTTP $http_code)${NC}"
    echo "$body"
    ((FAILED++))
    FILE_UNIQUE_ID=""
fi
echo ""

# Test 5: Retrieve File Info
if [ -n "$FILE_UNIQUE_ID" ]; then
    echo "Test 5: Retrieve File Info"
    echo "-------------------------"
    sleep 1
    response=$(curl -s -w "\n%{http_code}" $API_URL/api/content/$FILE_UNIQUE_ID)
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ File info retrieval successful${NC}"
        if command -v jq &> /dev/null; then
            echo "$body" | jq '.'
        else
            echo "$body"
        fi
        ((PASSED++))
    else
        echo -e "${RED}✗ File info retrieval failed (HTTP $http_code)${NC}"
        echo "$body"
        ((FAILED++))
    fi
    echo ""
fi

# Test 6: Custom Expiry
echo "Test 6: Text Upload with Custom Expiry"
echo "--------------------------------------"
EXPIRY_DATE=$(date -u -d '+1 hour' +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -v+1H +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null)

if [ -n "$EXPIRY_DATE" ]; then
    response=$(curl -s -w "\n%{http_code}" -X POST $API_URL/api/upload \
      -F "type=text" \
      -F "content=This expires in 1 hour" \
      -F "expiryDate=$EXPIRY_DATE")
    
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✓ Custom expiry upload successful${NC}"
        if command -v jq &> /dev/null; then
            echo "$body" | jq '.'
        else
            echo "$body"
        fi
        ((PASSED++))
    else
        echo -e "${RED}✗ Custom expiry upload failed (HTTP $http_code)${NC}"
        echo "$body"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⚠ Skipping (date command not compatible)${NC}"
fi
echo ""

# Test 7: Invalid Content
echo "Test 7: Invalid Content ID (Should Return 403)"
echo "---------------------------------------------"
response=$(curl -s -w "\n%{http_code}" $API_URL/api/content/invalidid123)
http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "403" ] || [ "$http_code" = "400" ]; then
    echo -e "${GREEN}✓ Invalid content correctly rejected${NC}"
    if command -v jq &> /dev/null; then
        echo "$body" | jq '.'
    else
        echo "$body"
    fi
    ((PASSED++))
else
    echo -e "${RED}✗ Should have returned 403/400, got HTTP $http_code${NC}"
    echo "$body"
    ((FAILED++))
fi
echo ""

# Test 8: Validation - Empty Text
echo "Test 8: Validation - Empty Text (Should Fail)"
echo "--------------------------------------------"
response=$(curl -s -w "\n%{http_code}" -X POST $API_URL/api/upload \
  -F "type=text" \
  -F "content=")

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "400" ]; then
    echo -e "${GREEN}✓ Empty text correctly rejected${NC}"
    if command -v jq &> /dev/null; then
        echo "$body" | jq '.'
    else
        echo "$body"
    fi
    ((PASSED++))
else
    echo -e "${RED}✗ Should have returned 400, got HTTP $http_code${NC}"
    echo "$body"
    ((FAILED++))
fi
echo ""

# Test 9: Validation - Missing File
echo "Test 9: Validation - Missing File (Should Fail)"
echo "----------------------------------------------"
response=$(curl -s -w "\n%{http_code}" -X POST $API_URL/api/upload \
  -F "type=file")

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "400" ]; then
    echo -e "${GREEN}✓ Missing file correctly rejected${NC}"
    if command -v jq &> /dev/null; then
        echo "$body" | jq '.'
    else
        echo "$body"
    fi
    ((PASSED++))
else
    echo -e "${RED}✗ Should have returned 400, got HTTP $http_code${NC}"
    echo "$body"
    ((FAILED++))
fi
echo ""

# Cleanup
rm -f /tmp/vaultlink-test.txt

# Summary
echo "================================"
echo "Test Summary"
echo "================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed ✗${NC}"
    exit 1
fi
