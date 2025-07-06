# Admin Dashboard Test Guide

## What Was Fixed

✅ **Port Configuration**: Admin dashboard now uses the configured API service with proxy
✅ **Authentication**: Proper token handling and error messages for auth failures
✅ **Error Handling**: Better error display and user feedback
✅ **API Organization**: Using dedicated company API service

## How to Test

### 1. Start the Application
```bash
# Start both servers
./start.sh
# or
npm run start  # in both client and server directories
```

### 2. Login as Admin
1. Go to `http://localhost:3000/login`
2. Use admin credentials:
   - Email: `admin@bouncehousekids.com`
   - Password: `password123`

### 3. Access Admin Dashboard
1. After login, navigate to `http://localhost:3000/admin`
2. You should see the admin dashboard with:
   - Overview tab with stats
   - Companies tab with company list
   - Users tab with user list

### 4. Test Company Creation
1. Click "Add New Company" button
2. Fill out the form with test data:
   - Company Name: "Test Company"
   - Subdomain: "testcompany"
   - Email: "test@example.com"
   - Phone: "1234567890"
3. Click "Create Company"
4. Should see success message and company appears in list

### 5. Test Company Management
1. **Toggle Status**: Click the Active/Inactive button on any company
2. **Delete Company**: Click "Delete" button (with confirmation)
3. **View Details**: Check that company information displays correctly

### 6. Test Error Handling
1. **Without Authentication**: 
   - Clear localStorage: `localStorage.clear()`
   - Refresh page - should show auth error
2. **With Wrong Token**:
   - Set invalid token: `localStorage.setItem('token', 'invalid')`
   - Try to create company - should show auth error

## Expected Behavior

### ✅ Success Cases
- Dashboard loads with company and user data
- Company creation works with proper form validation
- Company status toggle works
- Company deletion works with confirmation
- Error messages are clear and helpful

### ❌ Error Cases
- Authentication errors show proper messages
- Network errors show user-friendly messages
- Form validation prevents invalid submissions

## API Endpoints Used

- `GET /api/companies` - List all companies
- `POST /api/companies` - Create new company
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company
- `GET /api/users` - List all users

## Troubleshooting

### If Dashboard Doesn't Load
1. Check browser console for errors
2. Verify both servers are running (ports 3000 and 5000)
3. Check that you're logged in as admin user
4. Verify database is seeded: `cd server && npm run seed`

### If Company Creation Fails
1. Check authentication token is valid
2. Verify all required fields are filled
3. Check server logs for detailed error messages
4. Try the test endpoint: `POST /api/companies/test`

### If API Calls Fail
1. Check proxy configuration in `client/package.json`
2. Verify API base URL in `client/src/services/api.ts`
3. Check that backend server is running on port 5000
4. Test health endpoint: `http://localhost:5000/health` 