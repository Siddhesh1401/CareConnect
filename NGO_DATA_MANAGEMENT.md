# 📊 NGO Data Management - Multi-NGO System Explained

**Question:** If there are multiple NGOs on my site, is their data stored separately? What happens when we delete an NGO?

**Answer:** YES - Each NGO's data is stored separately and connected via their User ID (organizerId). When an NGO is deleted, their data handling depends on how the deletion is implemented.

---

## 🏗️ Database Architecture - How NGO Data is Organized

### 1. **User Collection** (NGO Admin Account)

```typescript
{
  _id: ObjectId,
  name: "Helping Hands NGO",
  email: "admin@helpinghands.com",
  role: "ngo_admin",
  
  // NGO-specific fields
  organizationName: "Helping Hands",
  organizationType: "Relief",
  registrationNumber: "NGO123456",
  description: "We help underprivileged children",
  website: "https://helpinghands.com",
  
  // Verification Status
  verificationStatus: "approved",
  isNGOVerified: true,
  
  // Account Status
  accountStatus: "active",
  isActive: true,
  
  joinedDate: "2024-01-01"
}
```

### 2. **Events Collection** (Created by NGO)

```typescript
{
  _id: ObjectId,
  title: "Community Cleanup Drive",
  organizerId: ObjectId,  // ← Links to NGO's User._id
  organizerName: "Helping Hands",
  organizationName: "Helping Hands NGO",
  
  status: "published",
  registeredVolunteers: [
    { userId: ObjectId, userName: "John", status: "confirmed" },
    { userId: ObjectId, userName: "Jane", status: "confirmed" }
  ]
}
```

### 3. **Campaigns Collection** (Created by NGO)

```typescript
{
  _id: ObjectId,
  title: "Education Fund Campaign",
  ngoId: ObjectId,  // ← Links to NGO's User._id
  ngoName: "Helping Hands",
  
  status: "active",
  target: 100000,
  raised: 50000,
  donations: [
    { donorId: ObjectId, amount: 5000, ... },
    { donorId: ObjectId, amount: 2000, ... }
  ]
}
```

### 4. **Stories Collection** (Created by NGO)

```typescript
{
  _id: ObjectId,
  title: "Success Story - Village Education",
  authorId: ObjectId,  // ← Links to NGO's User._id
  authorName: "Helping Hands",
  
  impact: "We educated 200 children",
  images: ["story1.jpg", "story2.jpg"]
}
```

### 5. **Reports Collection** (Filed by NGO)

```typescript
{
  _id: ObjectId,
  title: "Monthly Activity Report",
  reportedBy: ObjectId,  // ← Links to NGO's User._id
  organizationName: "Helping Hands"
}
```

---

## 🔗 Data Relationships (Foreign Keys)

**Each NGO's data is linked via their User ID:**

```
User (ngo_admin)
  ↓
  ├─ organizerId in Events
  ├─ ngoId in Campaigns
  ├─ authorId/creatorId in Stories & Communities
  └─ reportedBy in Reports
```

**Multiple NGOs Example:**

```
Database
├── Users Collection
│   ├─ NGO1 (id: 111) - "Helping Hands"
│   ├─ NGO2 (id: 222) - "Save Children"
│   └─ NGO3 (id: 333) - "Medical Aid"
│
├── Events Collection
│   ├─ Event A (organizerId: 111) - belongs to NGO1
│   ├─ Event B (organizerId: 222) - belongs to NGO2
│   └─ Event C (organizerId: 111) - belongs to NGO1
│
├── Campaigns Collection
│   ├─ Campaign X (ngoId: 111) - belongs to NGO1
│   ├─ Campaign Y (ngoId: 222) - belongs to NGO2
│   └─ Campaign Z (ngoId: 333) - belongs to NGO3
```

**Each NGO can ONLY see and manage their own data!** ✅

---

## ❌ What Happens When NGO is Deleted?

### Current Implementation

The system does **NOT have an explicit NGO deletion feature** yet. Instead, it supports:

#### **Option 1: Account Suspension** (Current)
```
UPDATE users SET accountStatus = 'suspended' WHERE _id = ngoId
```
- NGO account becomes inaccessible
- All their events, campaigns, stories REMAIN in database
- Data is preserved (safe for auditing)
- NGO can be reactivated if needed

#### **Option 2: Account Deactivation** (Current)
```
UPDATE users SET isActive = false WHERE _id = ngoId
```
- NGO cannot login
- Events become hidden from public view
- Campaigns stop accepting donations
- Stories are archived
- Data is preserved

#### **Option 3: Account Soft Delete** (Current)
```
UPDATE users SET accountStatus = 'deleted' WHERE _id = ngoId
```
- Marks user as deleted but doesn't remove from database
- All linked data remains
- NGO info is hidden from listings
- Can be restored if needed

---

## 📋 What SHOULD Happen (Recommended Approach)

If you want to implement true NGO deletion, here's what should happen:

### **Cascade Delete Strategy** ✅ RECOMMENDED
When NGO is deleted:
1. ✅ Delete NGO's User account
2. ✅ Delete all Events created by this NGO
3. ✅ Delete all Campaigns created by this NGO
4. ✅ Delete all Stories posted by this NGO
5. ✅ Delete all Reports filed by this NGO
6. ✅ Delete all Communities created by this NGO
7. ✅ Notify all registered volunteers about cancelled events
8. ✅ Refund all donors for active campaigns

### **Archive Strategy** ✅ ALSO GOOD
When NGO is deleted:
1. ✅ Mark NGO account as deleted
2. ✅ Keep all their data for records/audits
3. ✅ Hide data from public view
4. ✅ Preserve donor/volunteer history
5. ✅ Generate compliance report

### **Hybrid Strategy** ✅ BEST FOR COMPLIANCE
When NGO is deleted:
1. ✅ Archive NGO's user account
2. ✅ Keep campaign/donation records (legal requirement)
3. ✅ Delete personal data (GDPR/privacy compliance)
4. ✅ Keep public stories (historical record)
5. ✅ Cancel future events with notifications

---

## 🔍 Real World Example

**Scenario:** You have 3 NGOs on your site:

### **Database State - BEFORE Deletion**

```
NGO 1: "Hope Foundation"
├─ 5 Events (with 50 registered volunteers total)
├─ 3 Campaigns (raised ₹200,000 from donors)
└─ 10 Stories

NGO 2: "Care Initiative"
├─ 3 Events
├─ 2 Campaigns (raised ₹100,000)
└─ 5 Stories

NGO 3: "Community Support"
├─ 8 Events
├─ 5 Campaigns (raised ₹500,000)
└─ 20 Stories

TOTAL: 16 Events, 10 Campaigns, 35 Stories
```

### **If You Delete NGO 1 (Hope Foundation):**

**With Current Implementation (Suspension):**
```
✅ NGO 1 account becomes suspended
✅ NGO 1's 5 events remain in database (hidden)
✅ NGO 1's 3 campaigns remain (donations kept)
✅ NGO 1's 10 stories remain (archived)
✅ All volunteer registrations preserved
✅ All donation records preserved

Database State:
- NGO 1: Suspended (data still there)
- NGO 2: Active (unaffected)
- NGO 3: Active (unaffected)
```

**If We Implement Cascade Delete:**
```
❌ NGO 1 account deleted
❌ NGO 1's 5 events deleted
❌ NGO 1's 3 campaigns deleted
❌ NGO 1's 10 stories deleted
✅ All volunteers notified
✅ All donors refunded

Database State:
- 11 Events remaining (16 - 5)
- 7 Campaigns remaining (10 - 3)
- 25 Stories remaining (35 - 10)
- NGO 2 & 3: Unaffected
```

---

## ✅ Data Isolation Verification

### Multi-NGO Queries Example

```typescript
// Get all events for NGO 1
const ngo1Events = await Event.find({ organizerId: ngo1._id });

// Get all events for NGO 2 (completely separate)
const ngo2Events = await Event.find({ organizerId: ngo2._id });

// NGO 1's events and NGO 2's events NEVER mix ✅

// Get all campaigns for specific NGO
const ngo1Campaigns = await Campaign.find({ ngoId: ngo1._id });
```

### Privacy & Security ✅

```
✅ Each NGO can only see their own data
✅ Volunteers for NGO 1 events don't see NGO 2's events
✅ NGO 1's donation records are separate from NGO 2's
✅ NGO 1's stories don't affect NGO 2's listings
```

---

## 🚨 Important Considerations

### **Legal/Compliance**
- ❌ Should NOT delete donation records (tax/audit)
- ❌ Should NOT delete volunteer participation records
- ✅ Should delete personal contact info (GDPR)
- ✅ Should archive organization info (for audits)

### **Business Impact**
- ⚠️ Deleting events cancels all registrations
- ⚠️ Deleting campaigns stops fundraising
- ⚠️ Volunteers lose history of events they participated in
- ⚠️ Donors lose history of their donations

### **Recommendation**
- ✅ Use **Suspension** for temporary removal
- ✅ Use **Archive** for compliance
- ✅ Use **Cascade Delete** only if explicitly requested
- ✅ Always keep audit logs

---

## 💻 Code Implementation (Recommendation)

If you want to add deletion functionality, here's what to implement:

```typescript
export const deleteNGO = async (req: AuthRequest, res: Response) => {
  try {
    const { ngoId } = req.params;
    const deletionStrategy = req.body.strategy; // 'suspend', 'archive', 'delete'

    if (deletionStrategy === 'suspend') {
      // Option 1: Just suspend
      await User.findByIdAndUpdate(ngoId, { accountStatus: 'suspended' });
      // Data remains, NGO can't login
    } 
    else if (deletionStrategy === 'archive') {
      // Option 2: Archive
      await User.findByIdAndUpdate(ngoId, { isActive: false });
      // Data remains, hidden from public
    }
    else if (deletionStrategy === 'cascade') {
      // Option 3: Full deletion (with caution)
      // Delete NGO
      await User.findByIdAndDelete(ngoId);
      // Delete all events
      await Event.deleteMany({ organizerId: ngoId });
      // Delete all campaigns
      await Campaign.deleteMany({ ngoId: ngoId });
      // Delete all stories
      await Story.deleteMany({ authorId: ngoId });
      // Delete all reports
      await Report.deleteMany({ reportedBy: ngoId });
      // Notify volunteers & refund donors...
    }
  } catch (error) {
    res.status(500).json({ error: 'Deletion failed' });
  }
};
```

---

## ✨ Summary

| Question | Answer |
|----------|--------|
| **Is NGO data stored separately?** | ✅ YES - via organizerId/ngoId |
| **Can multiple NGOs coexist?** | ✅ YES - completely isolated |
| **Can NGO A see NGO B's data?** | ❌ NO - data access is restricted |
| **What happens when NGO is deleted?** | Currently: Suspended. Can be archived or fully deleted |
| **Are donations/volunteer records safe?** | ✅ YES - data remains unless explicitly deleted |
| **Can we recover deleted NGO data?** | Depends on strategy (suspension: YES, cascade delete: NO) |
| **Is it GDPR compliant?** | ⚠️ Need to implement proper data deletion policies |

---

## 🎯 Next Steps (If You Need Deletion)

1. **Decide on Strategy**
   - Suspension (safest)
   - Archive (balanced)
   - Cascade Delete (most aggressive)

2. **Implement Cascade Delete** (if needed)
   - Add deletion endpoint
   - Handle all related data
   - Notify users
   - Keep audit logs

3. **Add UI Controls**
   - Admin panel delete button
   - Confirmation dialog
   - Strategy selection
   - Audit logging

Would you like me to implement a proper NGO deletion endpoint with cascade delete?
