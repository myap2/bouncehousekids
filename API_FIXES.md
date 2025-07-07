# API Fixes - 404 and Authentication Issues

## Issues Fixed

### 1. Port Configuration Issue

**Problem**: API calls were going to `http://localhost:3000/api/companies` instead of `http://localhost:5000/api/companies`

**Solution**:

- Added proxy configuration to `client/package.json` to forward API requests from port 3000 to 5000
- Updated `client/src/services/api.ts` to use relative paths (`/api`) instead of absolute URLs

### 2. Authentication Issue

**Problem**: Company creation endpoint requires admin authentication, but no easy way to get admin tokens for testing

**Solutions**:

- Added temporary test endpoint `/api/companies/test` that doesn't require authentication
- Created `createAdminToken.ts` script to generate admin tokens for testing
- Added comprehensive test scripts

## How to Use

### Option 1: Test without authentication (Easiest)

```bash
curl "http://localhost:5000/api/companies/test" \
  -H "Content-Type: application/json" \
  --data-raw '{
    "name": "Test Company",
    "subdomain": "testcompany",
    "email": "test@example.com",
    "phone": "1234567890"
  }'
```

### Option 2: Get admin token and use authenticated endpoint

```bash
# 1. Seed the database (if not done already)
cd server && npm run seed

# 2. Generate admin token
cd server && npm run create-token

# 3. Use the token in your curl request
curl "http://localhost:5000/api/companies" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  --data-raw '{
    "name": "Test Company",
    "subdomain": "testcompany",
    "email": "test@example.com",
    "phone": "1234567890"
  }'
```

### Option 3: Run automated tests

```bash
# On Windows
.\test-api.ps1

# On Linux/Mac
./test-api.sh
```

## Files Modified

1. **client/package.json** - Added proxy configuration
2. **client/src/services/api.ts** - Updated API base URL
3. **server/src/routes/companyRoutes.ts** - Added test endpoint
4. **server/src/scripts/createAdminToken.ts** - New script for token generation
5. **server/package.json** - Added create-token script
6. **test-api.ps1** - Windows PowerShell test script
7. **test-api.sh** - Linux/Mac bash test script

## Next Steps

1. **For Development**: Use the test endpoint for quick testing
2. **For Production**: Remove the test endpoint and always use proper authentication
3. **For Frontend**: The proxy configuration will automatically handle API calls from the React app

## Default Admin Credentials

- **Email**: admin@bouncehousekids.com
- **Password**: password123

These are created when you run `npm run seed` in the server directory.
