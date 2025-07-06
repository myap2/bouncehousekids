#!/bin/bash

echo "🧪 Testing Bounce House Kids API"
echo "=================================="

# Test 1: Health check
echo ""
echo "1. Testing health endpoint..."
curl -s http://localhost:5000/health | jq . || echo "Health check failed"

# Test 2: Create company without auth (test endpoint)
echo ""
echo "2. Testing company creation (no auth required)..."
curl -s -X POST http://localhost:5000/api/companies/test \
  -H "Content-Type: application/json" \
  --data-raw '{
    "name": "Test Company",
    "subdomain": "testcompany",
    "email": "test@example.com",
    "phone": "1234567890",
    "address": {
      "street": "123 Test St",
      "city": "Test City",
      "state": "CA",
      "zipCode": "12345"
    },
    "branding": {
      "primaryColor": "#4F46E5",
      "secondaryColor": "#10B981"
    },
    "paymentConfig": {
      "stripePublicKey": "test_key",
      "stripeSecretKey": "test_secret"
    },
    "emailConfig": {
      "fromEmail": "test@example.com",
      "fromName": "Test Company"
    }
  }' | jq . || echo "Company creation failed"

# Test 3: Login to get token
echo ""
echo "3. Testing login to get admin token..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  --data-raw '{
    "email": "admin@bouncehousekids.com",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token // empty')

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo "✅ Login successful, token obtained"
    
    # Test 4: Create company with auth
    echo ""
    echo "4. Testing company creation with auth..."
    curl -s -X POST http://localhost:5000/api/companies \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      --data-raw '{
        "name": "Auth Test Company",
        "subdomain": "authtest",
        "email": "authtest@example.com",
        "phone": "9876543210",
        "address": {
          "street": "456 Auth St",
          "city": "Auth City",
          "state": "TX",
          "zipCode": "54321"
        },
        "branding": {
          "primaryColor": "#DC2626",
          "secondaryColor": "#F59E0B"
        },
        "paymentConfig": {
          "stripePublicKey": "auth_test_key",
          "stripeSecretKey": "auth_test_secret"
        },
        "emailConfig": {
          "fromEmail": "auth@example.com",
          "fromName": "Auth Test Company"
        }
      }' | jq . || echo "Authenticated company creation failed"
else
    echo "❌ Login failed. Make sure to run: cd server && npm run seed"
fi

echo ""
echo "🎉 API testing complete!"
echo ""
echo "To get an admin token for manual testing:"
echo "cd server && npm run create-token" 