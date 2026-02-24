# Route Testing Guide

## Test the groups/:id/members endpoint

### 1. Restart Backend Server
```bash
cd backend
npm run dev
```

### 2. Test with curl or Postman
```bash
# Replace TOKEN with your actual JWT token
# Replace GROUP_ID with actual group ID from your database

curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5001/api/groups/GROUP_ID/members
```

### 3. Check Backend Console
Look for these log messages:
- "getGroupMembers called for groupId: ..."
- "Returning students: X"

## Common Issues

1. **404 Not Found** - Backend server not restarted
2. **500 Internal Server Error** - Check backend console for error details
3. **401 Unauthorized** - Token missing or invalid

## Route Order (IMPORTANT)
More specific routes MUST come before generic routes:
```javascript
// ✅ CORRECT ORDER
router.get("/:id/members", ...);  // Specific route first
router.get("/:id", ...);           // Generic route after

// ❌ WRONG ORDER  
router.get("/:id", ...);           // This catches everything!
router.get("/:id/members", ...);  // Never reached
```
