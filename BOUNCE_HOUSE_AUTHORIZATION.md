# Bounce House Authorization System

## Overview
The bounce house management system now has proper role-based authorization to ensure only authorized users can create, update, and delete bounce houses.

## User Roles

### 1. Customer (`customer`)
- **Permissions**: Can view bounce houses and create reviews
- **Cannot**: Create, update, or delete bounce houses

### 2. Company Admin (`company-admin`)
- **Permissions**: 
  - Create bounce houses for their own company
  - Update bounce houses that belong to their company
  - Delete bounce houses that belong to their company
  - View all bounce houses from their company
- **Cannot**: Access bounce houses from other companies

### 3. Super Admin (`admin`)
- **Permissions**: 
  - Create bounce houses for any company
  - Update any bounce house
  - Delete any bounce house
  - View all bounce houses from all companies
- **Full Access**: Complete system administration

## API Endpoints & Authorization

### Public Endpoints (No Authentication Required)
```
GET /api/bounce-houses          # Get all active bounce houses
GET /api/bounce-houses/:id      # Get specific bounce house details
```

### Customer Endpoints (Authentication Required)
```
POST /api/bounce-houses/:id/reviews  # Add review (auth middleware)
```

### Company Admin & Super Admin Endpoints (Enhanced Authorization)
```
POST /api/bounce-houses                # Create bounce house (bounceHouseAuth)
PATCH /api/bounce-houses/:id          # Update bounce house (bounceHouseAuth)
DELETE /api/bounce-houses/:id         # Delete bounce house (bounceHouseAuth)
GET /api/bounce-houses/my-company     # Get company bounce houses (bounceHouseAuth)
```

## Authorization Logic

### Creating Bounce Houses
- **Company Admins**: Automatically associates bounce house with their company
- **Super Admins**: Must specify company ID in request body
- **Validation**: Company admins must have a company associated with their account

### Updating Bounce Houses
- **Company Admins**: Can only update bounce houses from their own company
- **Super Admins**: Can update any bounce house and change company assignment
- **Validation**: Company ownership verified before allowing updates

### Deleting Bounce Houses
- **Company Admins**: Can only delete bounce houses from their own company
- **Super Admins**: Can delete any bounce house
- **Soft Delete**: Sets `isActive: false` instead of permanent deletion

## Security Features

### 1. Role-Based Access Control
- Three distinct permission levels with proper separation
- Company admins cannot access other companies' data
- Customers cannot perform administrative actions

### 2. Company Isolation
- Company admins are restricted to their own company's bounce houses
- Automatic company association prevents data mixing
- Company ID validation for all operations

### 3. Input Validation
- Company admin accounts must have associated company
- Super admin requests require company ID for bounce house creation
- All update operations validate allowed fields

## Error Messages

### Authentication Errors
- `401`: "User not authenticated"
- `401`: "Please authenticate."

### Authorization Errors
- `403`: "Access denied. Only administrators and company administrators can manage bounce houses."
- `403`: "Access denied. Company administrators must be associated with a company."
- `403`: "Access denied. You can only update bounce houses from your own company."
- `403`: "Access denied. You can only delete bounce houses from your own company."

### Validation Errors
- `400`: "Company ID is required for creating bounce houses"
- `400`: "Invalid updates"
- `404`: "Bounce house not found"

## Database Schema

### User Model
```typescript
{
  role: 'customer' | 'admin' | 'company-admin',
  company: ObjectId,  // Required for company-admin role
  // ... other fields
}
```

### BounceHouse Model
```typescript
{
  company: ObjectId,  // Required - references Company model
  // ... other fields
}
```

## Implementation Details

### New Middleware: `bounceHouseAuth`
- Validates user is authenticated
- Checks user has admin or company-admin role
- Ensures company-admin users have associated company
- Replaces generic `adminAuth` for bounce house operations

### Controller Updates
- All bounce house operations now check company ownership
- Automatic company association for company admins
- Enhanced error handling and validation
- Proper TypeScript typing with `AuthRequest` interface

### Route Protection
- Uses `bounceHouseAuth` middleware for all administrative operations
- Maintains public access for viewing bounce houses
- Adds company-specific endpoint for admin dashboards

## Usage Examples

### Company Admin Creating Bounce House
```javascript
// POST /api/bounce-houses
// Headers: Authorization: Bearer <company-admin-token>
{
  "name": "Super Slide Castle",
  "description": "Amazing castle bounce house",
  "theme": "castle",
  // ... other fields
  // company field automatically set to user's company
}
```

### Super Admin Creating Bounce House
```javascript
// POST /api/bounce-houses  
// Headers: Authorization: Bearer <admin-token>
{
  "name": "Pirate Ship Adventure",
  "description": "Pirate themed bounce house",
  "theme": "pirate",
  "company": "60f4b2b1c8f4b2b1c8f4b2b1",  // Required
  // ... other fields
}
```

### Getting Company Bounce Houses
```javascript
// GET /api/bounce-houses/my-company
// Headers: Authorization: Bearer <company-admin-token>
// Returns only bounce houses from user's company
```

## Benefits

1. **Multi-Tenant Security**: Companies can only manage their own bounce houses
2. **Scalable Authorization**: System supports multiple companies without data leakage
3. **Flexible Admin Access**: Super admins can manage all companies
4. **User-Friendly**: Company admins don't need to specify company ID manually
5. **Audit Trail**: All operations are properly logged and traceable

## Testing Authorization

### Test Company Admin Access
1. Create company-admin user with associated company
2. Verify they can create bounce houses (auto-assigned to their company)
3. Verify they cannot update bounce houses from other companies
4. Verify they can only see their company's bounce houses

### Test Super Admin Access
1. Create admin user
2. Verify they can create bounce houses for any company
3. Verify they can update any bounce house
4. Verify they can view all bounce houses

### Test Customer Restrictions
1. Create customer user
2. Verify they cannot create bounce houses
3. Verify they cannot update bounce houses
4. Verify they can only view and review bounce houses

This authorization system ensures that only authorized users can manage bounce houses while maintaining proper company isolation and security.