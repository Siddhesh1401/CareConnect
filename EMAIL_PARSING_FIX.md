# Email Parsing Fix - Multi-line Field Handling

## Problem Solved ✅
The email monitoring system was failing to parse government access request emails that had authorized officials spanning multiple lines.

### Original Issue
When an email contained:
```
Authorized Officials: John Doe, Senior Official, john.doe@govmail.in; Jane Smith, Coordinator,
jane.smith@govmail.in
```

The parser would:
1. Split by newlines first
2. Treat "jane.smith@govmail.in" as a separate line without a key
3. Skip it during parsing
4. Result: authorizedOfficials array becomes empty or incomplete
5. Email fails validation and is not saved

## Solution Implemented 🔧

### 1. **Multi-line Field Reconstruction**
Before parsing key-value pairs, the parser now reconstructs multi-line fields:

```typescript
const reconstructedLines: string[] = [];
for (const line of rawLines) {
  if (!line) continue; // Skip empty lines
  
  if (line.includes(':')) {
    // This line has a key, add it as a new line
    reconstructedLines.push(line);
  } else if (reconstructedLines.length > 0) {
    // This line doesn't have a key, append to previous line
    reconstructedLines[reconstructedLines.length - 1] += ' ' + line;
  }
}
```

**Result**: `"Authorized Officials: John Doe, Senior Official, john.doe@govmail.in; Jane Smith, Coordinator, jane.smith@govmail.in"` (single line)

### 2. **Improved Authorized Officials Parsing**
The parser now extracts emails from the text reliably:

```typescript
case 'authorizedofficials':
  data.authorizedOfficials = value.split(';').map((official: string) => {
    const trimmed = official.trim();
    if (!trimmed) return null;
    
    // Extract email using regex
    const emailMatch = trimmed.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    const email = emailMatch ? emailMatch[0] : '';
    
    // Clean remaining text and split by commas
    let withoutEmail = trimmed.replace(email, '').replace(/[,;@]+/g, ',').trim();
    withoutEmail = withoutEmail.replace(/,+/g, ',').replace(/^,|,$/, '').trim();
    
    const parts = withoutEmail.split(',').map(s => s.trim()).filter(s => s);
    
    if (parts.length >= 2) {
      return { name: parts[0], title: parts[1], email: email };
    } else if (parts.length >= 1 && email) {
      return { name: parts[0], title: 'Contact', email: email };
    }
    return null;
  }).filter((official: any) => official !== null);
```

### 3. **Robust Sender Email Extraction**
Fixed type safety in sender email extraction:

```typescript
let senderEmail: string = '';
if (typeof parsed.from === 'string') {
  senderEmail = parsed.from;
} else if (parsed.from?.value?.[0]?.address) {
  senderEmail = parsed.from.value[0].address;
} else if (parsed.from?.text) {
  const match = parsed.from.text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
  senderEmail = match ? match[0] : '';
}
```

## Test Results ✅

### Test Case 1: Multi-line Authorized Officials
```
Input: Authorized Officials: John Doe, Senior Official, john.doe@govmail.in; Jane Smith, Coordinator,
jane.smith@govmail.in

Output:
[
  {
    "name": "John Doe",
    "title": "Senior Official",
    "email": "john.doe@govmail.in"
  },
  {
    "name": "Jane Smith",
    "title": "Coordinator",
    "email": "jane.smith@govmail.in"
  }
]
Status: ✅ PASSED
```

### Test Case 2: Normal Format Authorized Officials
```
Input: Dr. Amit Patel, Chief, amit.patel@govhealth.gov.in; Ms. Neha Verma, Deputy Chief, neha.verma@govhealth.gov.in

Output:
[
  {
    "name": "Dr. Amit Patel",
    "title": "Chief",
    "email": "amit.patel@govhealth.gov.in"
  },
  {
    "name": "Ms. Neha Verma",
    "title": "Deputy Chief",
    "email": "neha.verma@govhealth.gov.in"
  }
]
Status: ✅ PASSED
```

## Expected Workflow After Fix

1. **Email Arrives** → IMAP receives government access request email
2. **Parsing** → parseEmailBody() now correctly handles multi-line fields ✅
3. **Authorization** → Authorized officials extracted with correct names, titles, and emails ✅
4. **Validation** → Email passes validation and is saved to database ✅
5. **Display** → Admin dashboard displays the complete request ✅

## Files Modified

- `backend/src/scripts/emailMonitor.ts`:
  - Lines 35-51: Added multi-line field reconstruction logic
  - Lines 115-131: Improved authorized officials parsing with regex email extraction
  - Lines 208-218: Fixed sender email extraction with proper type handling

## How to Test

1. Submit a government access request email with authorized officials spanning multiple lines
2. Check backend logs for parsing output
3. Verify the email appears in the admin dashboard with all fields correctly populated
4. Confirm authorized officials are displayed with names, titles, and emails

## Next Steps

1. ✅ Fix email parsing for multi-line fields → **COMPLETED**
2. → Run end-to-end test with sample email
3. → Verify emails display in admin dashboard
4. → Monitor production for any parsing edge cases
