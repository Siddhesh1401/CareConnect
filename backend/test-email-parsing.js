"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// COPY OF THE UPDATED FUNCTION from emailMonitor.ts
function parseEmailBody(body) {
    const rawLines = body.split('\n').map(line => line.trim());
    // Reconstruct multi-line fields by joining lines that don't start with a key
    const reconstructedLines = [];
    for (const line of rawLines) {
        if (!line)
            continue; // Skip empty lines
        if (line.includes(':')) {
            // This line has a key, add it as a new line
            reconstructedLines.push(line);
        }
        else if (reconstructedLines.length > 0) {
            // This line doesn't have a key, append to previous line
            reconstructedLines[reconstructedLines.length - 1] += ' ' + line;
        }
    }
    const lines = reconstructedLines.filter(line => line);
    const data = {};
    console.log('Parsing email lines:');
    for (const line of lines) {
        console.log('Line:', JSON.stringify(line));
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        if (!key || !value)
            continue;
        const cleanKey = key.toLowerCase().replace(/[^a-z]/g, '');
        console.log('Key:', cleanKey, 'Value:', value);
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
                    switch (dt) {
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
            case 'estimatedrequestspermonth':
                data.estimatedUsage = { requestsPerMonth: parseInt(value) || 1000, duration: '1 year' };
                break;
            case 'duration':
                if (data.estimatedUsage)
                    data.estimatedUsage.duration = value;
                break;
            case 'apiintegrationmethod':
                data.technicalDetails = { apiIntegrationMethod: value, dataProcessingLocation: '', securityMeasures: '' };
                break;
            case 'dataprocessinglocation':
                if (data.technicalDetails)
                    data.technicalDetails.dataProcessingLocation = value;
                break;
            case 'securitymeasures':
                if (data.technicalDetails)
                    data.technicalDetails.securityMeasures = value;
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
                    if (!trimmed)
                        return null;
                    // Check if this contains an email address (has @)
                    const emailMatch = trimmed.match(/[\w\.-]+@[\w\.-]+\.\w+/);
                    const email = emailMatch ? emailMatch[0] : '';
                    // Remove email from the string to get name and title
                    const withoutEmail = trimmed.replace(email, '').replace(/[,;]/g, ' ').trim();
                    const parts = withoutEmail.split(/[,]+/).map(s => s.trim()).filter(s => s);
                    if (parts.length >= 2) {
                        return { name: parts[0], title: parts[1], email: email };
                    }
                    else if (parts.length >= 1 && email) {
                        return { name: parts[0], title: 'Contact', email: email };
                    }
                    else if (parts.length >= 1) {
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
// Test cases
const testEmail1 = `Organization: Ministry of Social Development
Contact Person: Rajesh Kumar
Email: rajesh.kumar@govsocial.gov.in
Phone: +91-11-1234-5678
Purpose: Research on NGO effectiveness
Data Types: NGOs, Communities, Analytics
Justification: We need to analyze NGO distribution and effectiveness across different regions
Estimated Requests Per Month: 500
Duration: 2 years
API Integration Method: REST API
Data Processing Location: Government Data Center, New Delhi
Security Measures: AES-256 encryption, VPN, IP whitelisting
Government Level: National
Department: Social Development
Authorized Officials: John Doe, Senior Official, john.doe@govmail.in; Jane Smith, Coordinator,
jane.smith@govmail.in`;
const testEmail2 = `Organization: Department of Health
Contact Person: Dr. Priya Sharma
Email: priya.sharma@govhealth.gov.in
Phone: +91-22-9876-5432
Purpose: Public health data analysis
Data Types: Communities, Campaigns, Events
Justification: Essential for epidemiological studies
Estimated Requests Per Month: 1000
Duration: 1 year
API Integration Method: GraphQL
Data Processing Location: Health Ministry Server
Security Measures: End-to-end encryption, OAuth 2.0
Government Level: State
Department: Health Services
Authorized Officials: Dr. Amit Patel, Chief, amit.patel@govhealth.gov.in; Ms. Neha Verma, Deputy Chief, neha.verma@govhealth.gov.in`;
console.log('\n=== TEST 1: Multi-line Authorized Officials ===');
const result1 = parseEmailBody(testEmail1);
console.log('\nParsed Result 1:');
console.log(JSON.stringify(result1, null, 2));
console.log('\n\n=== TEST 2: Normal Authorized Officials ===');
const result2 = parseEmailBody(testEmail2);
console.log('\nParsed Result 2:');
console.log(JSON.stringify(result2, null, 2));
// Summary
console.log('\n\n=== TEST SUMMARY ===');
console.log('Test 1 (Multi-line):', result1 ? '✅ PASSED' : '❌ FAILED');
if (result1) {
    console.log('  - Authorized Officials Count:', result1.authorizedOfficials.length);
    console.log('  - Officials:', result1.authorizedOfficials.map(o => `${o.name} (${o.email})`).join(', '));
}
console.log('Test 2 (Normal):', result2 ? '✅ PASSED' : '❌ FAILED');
if (result2) {
    console.log('  - Authorized Officials Count:', result2.authorizedOfficials.length);
    console.log('  - Officials:', result2.authorizedOfficials.map(o => `${o.name} (${o.email})`).join(', '));
}
