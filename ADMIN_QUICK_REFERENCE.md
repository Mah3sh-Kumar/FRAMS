# Admin Quick Reference Card

## User Management Screen

### Statistics Dashboard
- **Total Users**: All users in the system
- **Admins**: Number of admin users
- **Teachers**: Number of teacher users
- **Students**: Number of student users
- **Unverified**: Users waiting for verification ⚠️

### User Status Indicators
- 🟢 **Green "Verified" Badge**: User is verified and has full access
- 🟠 **Orange "Pending" Badge**: User needs verification
- ⚠️ **Warning Icon (!)**: Appears next to unverified user names

### Action Buttons

| Icon | Action | Description |
|------|--------|-------------|
| ✅ Green Checkmark | Verify User | Grant user full access to the system |
| ❌ Orange X | Unverify User | Revoke user access (non-admins only) |
| ✏️ Pencil | Edit User | Modify user details, role, or info |
| 🗑️ Red Trash | Delete User | Permanently remove user (non-admins only) |

### Filters
1. **Search Bar**: Search by name, email, or enrollment number
2. **Role Filter**: All / Admins / Teachers / Students
3. **Verification Filter**: All / Verified / Unverified

### Creating New Users
1. Click **"Create"** button
2. Select role (Student or Teacher)
3. Fill in required fields:
   - Full Name *
   - Email *
   - Password *
   - Role-specific info (enrollment number for students, department for teachers)
4. Click **"Create"**
5. **Remember**: New users are unverified by default - verify them after creation!

### Editing Users
1. Click the **pencil icon** on a user card
2. Modify:
   - Full Name
   - Role (Student/Teacher/Admin)
   - Department (for teachers)
   - Enrollment Number, Class Level, Branch (for students)
3. Click **"Save"**

**Note**: Changing roles will automatically migrate user data

### Verifying Users
1. Find unverified users (orange "Pending" badge)
2. Click the **green checkmark icon**
3. User immediately gets full access

### Unverifying Users
1. Find verified user (green "Verified" badge)
2. Click the **orange X icon**
3. User loses access until re-verified
4. **Cannot unverify admins**

### Deleting Users
1. Click the **red trash icon**
2. Confirm deletion
3. User and all related data are permanently removed
4. **Cannot delete admins**

### Exporting Data
1. Click the **export icon** (top right)
2. CSV file is generated with all user data
3. Share the file as needed

## Common Workflows

### New User Signup
```
1. User signs up via app
2. User appears in User Management as "Pending"
3. Admin reviews user details
4. Admin clicks verify button
5. User can now access the system
```

### Suspending a User
```
1. Find the user in User Management
2. Click the orange X icon (unverify)
3. User loses access immediately
4. To restore: Click green checkmark
```

### Changing User Role
```
1. Click pencil icon on user
2. Change role in dropdown
3. Update role-specific information
4. Click Save
5. Old role data is removed, new role data is created
```

### Bulk User Import
```
1. Click import icon
2. Select CSV file with user data
3. Users are created with default password
4. Remember to verify all imported users!
```

## Tips & Best Practices

✅ **DO**:
- Review new users promptly
- Verify legitimate users quickly
- Check user details before verifying
- Use unverify for temporary suspension
- Keep the unverified count low
- Export data regularly for backups

❌ **DON'T**:
- Verify users without checking their details
- Delete users unless absolutely necessary
- Unverify admins (system prevents this)
- Forget to verify newly created users

## Keyboard Shortcuts
- **Search**: Click search bar and type
- **Refresh**: Pull down on the list

## Troubleshooting

| Problem | Solution |
|---------|----------|
| User can't access features | Check if they're verified |
| Verify button doesn't work | Refresh the page, check your admin status |
| Can't delete a user | Make sure they're not an admin |
| User not in list | Check filters, use search |
| Changes not saving | Check internet connection, try again |

## Quick Stats Interpretation

- **High Unverified Count**: Many users waiting - review and verify
- **Low Student/Teacher Ratio**: May need more teachers
- **Many Admins**: Review if all need admin access

## Security Reminders

🔒 **Remember**:
- Only verify users you trust
- Admins have full system access
- Deleted users cannot be recovered
- All actions are logged
- Unverified users can log in but have limited access

## Need Help?

1. Check ADMIN_USER_VERIFICATION_GUIDE.md for detailed instructions
2. Check ADMIN_FIXES_SUMMARY.md for technical details
3. Contact system administrator

---

**Quick Access**: User Management → Admin Dashboard → User Management
