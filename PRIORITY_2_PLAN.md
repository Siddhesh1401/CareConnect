# Priority 2 Implementation Plan 🚀

## 📋 **PRIORITY 2 FEATURES:**

### **2.1 Bulk Actions** ⚡
- [ ] Select multiple API keys
- [ ] Select multiple access requests
- [ ] Bulk approve requests
- [ ] Bulk reject requests
- [ ] Bulk revoke keys
- [ ] Bulk export

### **2.2 Key Management** 🔑
- [ ] Edit key permissions
- [ ] Extend expiration dates
- [ ] Add notes/tags to keys
- [ ] Pause/resume keys (without revoking)
- [ ] Key history/changelog

### **2.3 Audit Trail** 📝
- [ ] Log all admin actions
- [ ] Show who did what when
- [ ] Filterable audit log
- [ ] Export audit logs
- [ ] Audit log viewer

### **2.4 Real Analytics** 📊
- [ ] Usage over time (line chart)
- [ ] Requests by endpoint (bar chart)
- [ ] Top consumers (enhanced)
- [ ] Error rates tracking
- [ ] Response times
- [ ] Interactive charts

---

## 🎯 **RECOMMENDED ORDER:**

### **Phase 1: Bulk Actions (Most Requested)**
**Time Estimate:** 3-4 hours
**Impact:** High - saves lots of time

1. Add checkbox selection to tables
2. Implement bulk approve/reject
3. Implement bulk revoke
4. Add bulk export

### **Phase 2: Key Management (High Value)**
**Time Estimate:** 4-5 hours
**Impact:** High - more control

1. Edit permissions modal
2. Extend expiration
3. Add notes/tags
4. Pause/resume functionality

### **Phase 3: Audit Trail (Compliance)**
**Time Estimate:** 3-4 hours
**Impact:** Medium-High - important for compliance

1. Create audit log model
2. Log all actions
3. Audit log viewer
4. Export functionality

### **Phase 4: Real Analytics (Visual)**
**Time Estimate:** 5-6 hours
**Impact:** Medium - nice to have

1. Install chart library (recharts)
2. Usage over time chart
3. Endpoint usage chart
4. Enhanced top consumers

---

## 🚀 **LET'S START WITH PHASE 1: BULK ACTIONS**

### **What We'll Build:**

#### **1. Bulk Selection UI**
```
┌─────────────────────────────────────────────┐
│ ☑ Select All    [Bulk Actions ▼]           │
├─────────────────────────────────────────────┤
│ ☑ Government Access Key                     │
│ ☑ Health Department Key                     │
│ ☐ Education Portal Key                      │
└─────────────────────────────────────────────┘

Bulk Actions Menu:
- Approve Selected (3)
- Reject Selected (3)
- Revoke Selected (3)
- Export Selected (3)
```

#### **2. Features:**
- ✅ Checkbox on each row
- ✅ "Select All" checkbox
- ✅ Bulk actions dropdown
- ✅ Shows count of selected items
- ✅ Confirmation before bulk actions
- ✅ Progress indicator
- ✅ Success/error summary

---

## 📊 **IMPLEMENTATION DETAILS:**

### **State Management:**
```typescript
const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
const [bulkActionLoading, setBulkActionLoading] = useState(false);
```

### **Bulk Actions:**
```typescript
const bulkApprove = async () => {
  setBulkActionLoading(true);
  const results = await Promise.allSettled(
    selectedRequests.map(id => approveRequest(id))
  );
  // Show summary
  showToast.success(`Approved ${results.filter(r => r.status === 'fulfilled').length} requests`);
};
```

### **UI Components:**
```typescript
// Checkbox component
<input
  type="checkbox"
  checked={selectedKeys.includes(key.id)}
  onChange={() => toggleSelection(key.id)}
/>

// Bulk actions dropdown
<Dropdown>
  <DropdownItem onClick={bulkApprove}>
    Approve Selected ({selectedRequests.length})
  </DropdownItem>
</Dropdown>
```

---

## 🎨 **UI MOCKUP:**

### **Keys Tab with Bulk Actions:**

```
API Keys Management                    [+ Generate New Key]

☑ Select All (3 selected)    [Bulk Actions ▼]

┌────────────────────────────────────────────────────┐
│ ☑  Government Access Key                           │
│    Government Agency                    [View] [×] │
├────────────────────────────────────────────────────┤
│ ☑  Health Department Key                           │
│    Health Department                    [View] [×] │
├────────────────────────────────────────────────────┤
│ ☑  Education Portal Key                            │
│    Education Ministry                   [View] [×] │
└────────────────────────────────────────────────────┘

Bulk Actions Menu:
┌─────────────────────────┐
│ Revoke Selected (3)     │
│ Export Selected (3)     │
│ Add Tags (3)            │
└─────────────────────────┘
```

### **Requests Tab with Bulk Actions:**

```
Access Requests                        [Export CSV ▼]

☑ Select All (2 selected)    [Bulk Actions ▼]

┌────────────────────────────────────────────────────┐
│ ☑  Government Agency                               │
│    Requesting: volunteers, reports                 │
│    Status: Pending              [Approve] [Reject] │
├────────────────────────────────────────────────────┤
│ ☑  Health Department                               │
│    Requesting: ngos, events                        │
│    Status: Pending              [Approve] [Reject] │
└────────────────────────────────────────────────────┘

Bulk Actions Menu:
┌─────────────────────────┐
│ Approve Selected (2)    │
│ Reject Selected (2)     │
│ Export Selected (2)     │
└─────────────────────────┘
```

---

## ✅ **TESTING CHECKLIST:**

### **Bulk Selection:**
- [ ] Click checkbox selects item
- [ ] Select All selects all items
- [ ] Deselect All clears selection
- [ ] Selection persists across actions
- [ ] Count updates correctly

### **Bulk Actions:**
- [ ] Bulk approve works
- [ ] Bulk reject works
- [ ] Bulk revoke works
- [ ] Bulk export works
- [ ] Confirmation dialog shows
- [ ] Progress indicator shows
- [ ] Success/error summary shows

### **Edge Cases:**
- [ ] No items selected (disable actions)
- [ ] All items selected
- [ ] Mixed selection
- [ ] Action fails for some items
- [ ] Network error handling

---

## 📦 **DEPENDENCIES:**

### **No New Libraries Needed!**
We can build this with existing tools:
- React state for selection
- Existing toast notifications
- Existing confirmation dialogs
- Promise.allSettled for bulk operations

---

## 🎯 **DELIVERABLES:**

### **Phase 1 (Bulk Actions):**
1. ✅ Checkbox selection UI
2. ✅ Select All functionality
3. ✅ Bulk actions dropdown
4. ✅ Bulk approve/reject
5. ✅ Bulk revoke
6. ✅ Bulk export
7. ✅ Progress indicators
8. ✅ Success/error summaries

---

## 📊 **ESTIMATED TIME:**

- **Checkbox UI:** 30 minutes
- **Selection logic:** 30 minutes
- **Bulk actions dropdown:** 30 minutes
- **Bulk approve/reject:** 1 hour
- **Bulk revoke:** 30 minutes
- **Bulk export:** 30 minutes
- **Testing & polish:** 1 hour

**Total:** ~4 hours

---

## 🚀 **READY TO START?**

**Let me know if you want to:**

1. **Start with Bulk Actions** (recommended)
   - Most impactful
   - Saves lots of time
   - Users will love it

2. **Start with Key Management**
   - More control over keys
   - Edit permissions
   - Add notes/tags

3. **Start with Audit Trail**
   - Important for compliance
   - Track all actions
   - Export logs

4. **Start with Real Analytics**
   - Visual charts
   - Better insights
   - Interactive dashboards

**Which would you like to implement first?** 🎯
