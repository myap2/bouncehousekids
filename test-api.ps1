Write-Host "🧪 Testing Bounce House Kids API" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Test 1: Health check
Write-Host ""
Write-Host "1. Testing health endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get
    Write-Host "✅ Health check successful: $($healthResponse | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Create company without auth (test endpoint)
Write-Host ""
Write-Host "2. Testing company creation (no auth required)..." -ForegroundColor Yellow
try {
    $testCompanyData = @{
        name = "Test Company"
        subdomain = "testcompany"
        email = "test@example.com"
        phone = "1234567890"
        address = @{
            street = "123 Test St"
            city = "Test City"
            state = "CA"
            zipCode = "12345"
        }
        branding = @{
            primaryColor = "#4F46E5"
            secondaryColor = "#10B981"
        }
        paymentConfig = @{
            stripePublicKey = "test_key"
            stripeSecretKey = "test_secret"
        }
        emailConfig = @{
            fromEmail = "test@example.com"
            fromName = "Test Company"
        }
    }

    $testResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/companies/test" -Method Post -Body ($testCompanyData | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ Test company creation successful: $($testResponse | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Test company creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Login to get token
Write-Host ""
Write-Host "3. Testing login to get admin token..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "admin@bouncehousekids.com"
        password = "password123"
    }

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/users/login" -Method Post -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
    
    if ($loginResponse.token) {
        Write-Host "✅ Login successful, token obtained" -ForegroundColor Green
        
        # Test 4: Create company with auth
        Write-Host ""
        Write-Host "4. Testing company creation with auth..." -ForegroundColor Yellow
        try {
            $authCompanyData = @{
                name = "Auth Test Company"
                subdomain = "authtest"
                email = "authtest@example.com"
                phone = "9876543210"
                address = @{
                    street = "456 Auth St"
                    city = "Auth City"
                    state = "TX"
                    zipCode = "54321"
                }
                branding = @{
                    primaryColor = "#DC2626"
                    secondaryColor = "#F59E0B"
                }
                paymentConfig = @{
                    stripePublicKey = "auth_test_key"
                    stripeSecretKey = "auth_test_secret"
                }
                emailConfig = @{
                    fromEmail = "auth@example.com"
                    fromName = "Auth Test Company"
                }
            }

            $headers = @{
                "Authorization" = "Bearer $($loginResponse.token)"
                "Content-Type" = "application/json"
            }

            $authResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/companies" -Method Post -Body ($authCompanyData | ConvertTo-Json) -Headers $headers
            Write-Host "✅ Authenticated company creation successful: $($authResponse | ConvertTo-Json)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Authenticated company creation failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Login failed - no token received" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure to run: cd server && npm run seed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 API testing complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To get an admin token for manual testing:" -ForegroundColor Cyan
Write-Host "cd server && npm run create-token" -ForegroundColor Cyan 