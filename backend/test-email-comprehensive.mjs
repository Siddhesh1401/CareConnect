// Comprehensive email parsing test with MIME and HTML content

function parseEmailBody(body) {
  const rawLines = body.split('\n').map(line => line.trim());
  
  // First pass: identify lines that are field headers (contain ':')
  const fieldLines = [];
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (!line) continue; // Skip empty lines
    
    // Skip MIME boundary markers and other non-content lines
    if (line.startsWith('--') || line.startsWith('Content-') || line.includes('charset=')) {
      continue;
    }
    
    // Check if this line contains a field definition
    if (line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      const cleanKey = key.toLowerCase().replace(/[^a-z]/g, '');
      
      // Only treat as field if key is recognized (not HTML-like)
      const recognizedFields = ['organization', 'contactperson', 'email', 'phone', 'purpose', 'datatypes', 
                                'justification', 'estimatedrequests', 'duration', 'apiintegration', 
                                'dataprocessing', 'securitymeasures', 'governmentlevel', 'department', 
                                'authorizedofficials'];
      
      if (recognizedFields.some(f => cleanKey.includes(f))) {
        const value = valueParts.join(':').trim();
        if (value) {
          fieldLines.push(line);
        }
      }
    }
  }
  
  const data = {};

  console.log('Parsing email lines:');
  for (const line of fieldLines) {
    console.log('Line:', JSON.stringify(line.substring(0, 80)));
    const [key, ...valueParts] = line.split(':');
    const value = valueParts.join(':').trim();
    if (!key || !value) continue;

    const cleanKey = key.toLowerCase().replace(/[^a-z]/g, '');
    console.log('Key:', cleanKey);

    // Skip if we already have this field with a good value
    if (data[cleanKey] && data[cleanKey].toString().length > 3) {
      console.log('  Skipping duplicate field:', cleanKey);
      continue;
    }

    switch (cleanKey) {
      case 'email':
        if (!data.email) {
          data.email = value;
        }
        break;
      case 'organization':
        data.organization = value;
        break;
      case 'contactperson':
        data.contactPerson = value;
        break;
      case 'phone':
        data.phone = value;
        break;
      case 'purpose':
        data.purpose = value;
        break;
      case 'datatypes':
        const rawDataTypes = value.split(',').map((dt) => dt.trim().toLowerCase());
        data.dataTypes = rawDataTypes.map((dt) => {
          switch(dt) {
            case 'volunteers': return 'volunteer_data';
            case 'ngos': return 'ngo_data';
            case 'campaigns': return 'campaign_data';
            case 'events': return 'event_data';
            case 'stories': return 'story_data';
            case 'communities': return 'community_data';
            case 'analytics': return 'analytics_data';
            default: return dt.replace(/\s/g, '_') + '_data';
          }
        });
        break;
      case 'justification':
        data.justification = value;
        break;
      case 'estimatedrequestsmonth':
      case 'estimatedrequestspermonth':
        data.estimatedUsage = { requestsPerMonth: parseInt(value) || 1000, duration: '1 year' };
        break;
      case 'duration':
        if (data.estimatedUsage) data.estimatedUsage.duration = value;
        break;
      case 'apiintegrationmethod':
        data.technicalDetails = { apiIntegrationMethod: value, dataProcessingLocation: '', securityMeasures: '' };
        break;
      case 'dataprocessinglocation':
        if (data.technicalDetails) data.technicalDetails.dataProcessingLocation = value;
        break;
      case 'securitymeasures':
        if (data.technicalDetails) data.technicalDetails.securityMeasures = value;
        break;
      case 'governmentlevel':
        data.governmentLevel = value;
        break;
      case 'department':
        data.department = value;
        break;
      case 'authorizedofficials':
        // Parse multiple officials: Name, Title, Email; Name, Title, Email
        // Handle cases where officials may be formatted as "Name, Email; Name, Email" or "Name, Title, Email"
        data.authorizedOfficials = value.split(';').map((official) => {
          const trimmed = official.trim();
          if (!trimmed) return null;
          
          // Check if this contains an email address (has @)
          const emailMatch = trimmed.match(/[\w\.-]+@[\w\.-]+\.\w+/);
          const email = emailMatch ? emailMatch[0] : '';
          
          // Remove email from the string to get name and title
          let withoutEmail = trimmed.replace(email, '').replace(/[,;@]+/g, ',').trim();
          // Clean up extra commas
          withoutEmail = withoutEmail.replace(/,+/g, ',').replace(/^,|,$/, '').trim();
          
          const parts = withoutEmail.split(',').map(s => s.trim()).filter(s => s);
          
          if (parts.length >= 2) {
            return { name: parts[0], title: parts[1], email: email };
          } else if (parts.length >= 1 && email) {
            return { name: parts[0], title: 'Contact', email: email };
          } else if (parts.length >= 1) {
            return { name: parts[0], title: 'Contact', email: '' };
          }
          return null;
        }).filter((official) => official !== null);
        break;
    }
  }

  // Set default values for required fields that might be missing
  if (!data.estimatedUsage) {
    data.estimatedUsage = { requestsPerMonth: 1000, duration: '1 year' };
  }
  if (!data.estimatedUsage.requestsPerMonth) {
    data.estimatedUsage.requestsPerMonth = 1000;
  }
  if (!data.estimatedUsage.duration) {
    data.estimatedUsage.duration = '1 year';
  }

  // Ensure authorized officials have required fields and filter out incomplete ones
  if (data.authorizedOfficials) {
    data.authorizedOfficials = data.authorizedOfficials
      .filter((official) => official.name && official.email)
      .map((official) => ({
        name: official.name,
        title: official.title || 'Contact',
        email: official.email,
        phone: official.phone || ''
      }));
  }

  // Must have at least organization, email, and purpose
  if (!data.organization || !data.email || !data.purpose) {
    console.log('Missing required fields:', { organization: data.organization, email: data.email, purpose: data.purpose });
    return null;
  }

  // If no authorized officials, create default one from contact person
  if (!data.authorizedOfficials || data.authorizedOfficials.length === 0) {
    console.log('No authorized officials found, using contact person as default');
    data.authorizedOfficials = [{
      name: data.contactPerson || 'Contact Person',
      title: 'Contact',
      email: data.email || 'contact@unknown.com',
      phone: data.phone || ''
    }];
  }

  // Validate required fields
  if (!data.organization || !data.contactPerson || !data.purpose || !data.dataTypes || !data.justification) {
    return null;
  }

  return data;
}

// Extract clean text from HTML
function extractTextFromHtml(html) {
  // First, decode quoted-printable line breaks (= at end of line)
  let text = html.replace(/=\n/g, '');
  
  // Remove MIME boundary markers
  text = text.replace(/--[0-9a-f]+(--)?\s*$/gm, '');
  text = text.replace(/^--[0-9a-f]+/gm, '');
  
  // Remove Content-Type and other headers
  text = text.replace(/^Content-[^\n]*\n/gm, '');
  
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, ' ');
  
  // Decode quoted-printable encoded characters
  text = text.replace(/=3D/g, '=');
  text = text.replace(/=C2=A0/g, ' '); // Non-breaking space
  text = text.replace(/=[0-9A-Fa-f]{2}/g, (match) => {
    try {
      return String.fromCharCode(parseInt(match.slice(1), 16));
    } catch (e) {
      return match;
    }
  });
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

// Test 1: Plain text email (working)
const plainTextEmail = `Organization: Test Government Agency
Contact Person: John Doe
Email: bug75297@gmail.com
Purpose: Research on NGO activities
Data Types: volunteers, ngos, campaigns
Justification: Public research project
Estimated Requests/Month: 1000
Duration: 1 year
API Integration Method: REST API
Data Processing Location: United States
Security Measures: SSL encryption, access controls
Government Level: federal
Department: Research Department
Authorized Officials: John Doe, john.doe@govtmail.com; Jane Smith, jane.smith@govtmail.com`;

// Test 2: HTML email with MIME boundaries and encoded characters
const htmlEmailRaw = `Organization: Test Government Agency
Content-Type: text/html; charset="UTF-8"
Content-Transfer-Encoding: quoted-printable
<div dir=3D"ltr">Organization: Test Government Agency<br>Contact Person: Jo=
hn Doe<br>Email: <a href=3D"mailto:bug75297@gmail.com">bug75297@gmail.com</=
a><div>Purpose: Research on NGO activities<br>Data Types: volunteers, ngos,=
campaigns<br>Justification: Public research project<br>Estimated Requests/=
Month: 1000<br>Duration: 1 year<br>API Integration Method: REST API<br>Data=
Processing Location: United States<br>Security Measures: SSL encryption, a=
ccess controls<br>Government Level: federal<br>Department: Research Departm=
ent<br>Authorized Officials: John Doe,=C2=A0<a href=3D"mailto:john.doe@govt=
mail.com" target=3D"_blank">john.doe@govtmail.com</a>; Jane Smith,=C2=A0<a =
href=3D"mailto:jane.smith@govtmail.com" target=3D"_blank">jane.smith@govtma=
il.com</a></div></div> --000000000000e5a01f06424a21fa--`;

console.log('\n=== TEST 1: Plain Text Email ===');
const result1 = parseEmailBody(plainTextEmail);
console.log('\nParsed Result 1:');
if (result1) {
  console.log('✅ Organization:', result1.organization);
  console.log('✅ Contact Person:', result1.contactPerson);
  console.log('✅ Email:', result1.email);
  console.log('✅ Purpose:', result1.purpose);
  console.log('✅ Data Types:', result1.dataTypes);
  console.log('✅ Authorized Officials:', result1.authorizedOfficials.map(o => `${o.name} (${o.email})`).join(', '));
} else {
  console.log('❌ FAILED TO PARSE');
}

console.log('\n=== TEST 2: HTML Email with MIME Boundaries ===');
// First extract clean text from HTML
const cleanHtml = extractTextFromHtml(htmlEmailRaw);
console.log('Extracted clean text preview:', cleanHtml.substring(0, 150) + '...');

const result2 = parseEmailBody(cleanHtml);
console.log('\nParsed Result 2:');
if (result2) {
  console.log('✅ Organization:', result2.organization);
  console.log('✅ Contact Person:', result2.contactPerson);
  console.log('✅ Email:', result2.email);
  console.log('✅ Purpose:', result2.purpose);
  console.log('✅ Data Types:', result2.dataTypes);
  console.log('✅ Authorized Officials:', result2.authorizedOfficials.map(o => `${o.name} (${o.email})`).join(', '));
} else {
  console.log('❌ FAILED TO PARSE');
}

// Summary
console.log('\n\n=== TEST SUMMARY ===');
console.log('Test 1 (Plain Text):', result1 ? '✅ PASSED' : '❌ FAILED');
console.log('Test 2 (HTML with MIME):', result2 ? '✅ PASSED' : '❌ FAILED');
