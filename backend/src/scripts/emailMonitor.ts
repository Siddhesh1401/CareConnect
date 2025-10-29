import { connect } from 'imap-simple';
import { simpleParser } from 'mailparser';
import { AccessRequest } from '../models/AccessRequest';
import dotenv from 'dotenv';

dotenv.config();

interface EmailData {
  organization: string;
  contactPerson: string;
  email: string;
  phone?: string;
  purpose: string;
  dataTypes: string[];
  justification: string;
  estimatedUsage: {
    requestsPerMonth: number;
    duration: string;
  };
  technicalDetails: {
    apiIntegrationMethod: string;
    dataProcessingLocation: string;
    securityMeasures: string;
  };
  governmentLevel: 'federal' | 'state' | 'local' | 'municipal';
  department: string;
  authorizedOfficials: Array<{
    name: string;
    title: string;
    email: string;
    phone?: string;
  }>;
}

function parseEmailBody(body: string): EmailData | null {
  const rawLines = body.split('\n').map(line => line.trim());
  
  // First pass: identify lines that are valid field definitions
  const fieldLines: string[] = [];
  for (const line of rawLines) {
    if (!line) continue; // Skip empty lines
    
    // Skip MIME boundary markers and other non-content lines
    if (line.startsWith('--') || line.startsWith('Content-') || line.includes('charset=')) {
      continue;
    }
    
    if (line.includes(':')) {
      const [key] = line.split(':');
      const cleanKey = key.toLowerCase().replace(/[^a-z]/g, '');
      
      // Only treat as field if key is a recognized field name
      const recognizedFields = ['organization', 'contactperson', 'email', 'phone', 'purpose', 'datatypes', 
                                'justification', 'estimatedrequests', 'duration', 'apiintegration', 
                                'dataprocessing', 'securitymeasures', 'governmentlevel', 'department', 
                                'authorizedofficials'];
      
      if (recognizedFields.some(f => cleanKey.includes(f))) {
        fieldLines.push(line);
      }
    } else if (fieldLines.length > 0) {
      // This line doesn't have a key, append to previous line (for multi-line fields)
      fieldLines[fieldLines.length - 1] += ' ' + line;
    }
  }
  
  const data: any = {};

  console.log('Parsing email lines:');
  for (const line of fieldLines) {
    console.log('Line:', JSON.stringify(line.substring(0, 100)));
    const [key, ...valueParts] = line.split(':');
    const value = valueParts.join(':').trim();
    if (!key || !value) continue;

    const cleanKey = key.toLowerCase().replace(/[^a-z]/g, '');
    console.log('Key:', cleanKey);
    
    // Skip if we already have this field with good data (avoid duplicates from multi-part emails)
    if (data[cleanKey] && Object.keys(data).length > 3) {
      console.log('  Skipping duplicate field:', cleanKey);
      continue;
    }

    switch (cleanKey) {
      case 'email':
        // Only set main email if not already set (prioritize first email field)
        if (!data.email) {
          data.email = value;
        }
        break;
      case 'organization':
        if (!data.organization) {
          data.organization = value;
        }
        break;
      case 'contactperson':
        if (!data.contactPerson) {
          data.contactPerson = value;
        }
        break;
      case 'phone':
        if (!data.phone) {
          data.phone = value;
        }
        break;
      case 'purpose':
        if (!data.purpose) {
          data.purpose = value;
        }
        break;
      case 'datatypes':
        // Map email data types to schema enum values
        const rawDataTypes = value.split(',').map((dt: string) => dt.trim().toLowerCase());
        data.dataTypes = rawDataTypes.map((dt: string) => {
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
        if (!data.justification) {
          data.justification = value;
        }
        break;
      case 'estimatedrequestspermonth':
      case 'estimatedrequestsmonth':
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
        data.governmentLevel = value as any;
        break;
      case 'department':
        if (!data.department) {
          data.department = value;
        }
        break;
      case 'authorizedofficials':
        // Parse multiple officials: Name, Title, Email; Name, Title, Email
        // Handle cases where officials may be formatted as "Name, Email; Name, Email" or "Name, Title, Email"
        data.authorizedOfficials = value.split(';').map((official: string) => {
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
        }).filter((official: any) => official !== null);
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
      .filter((official: any) => official.name && official.email) // Only keep officials with name and email
      .map((official: any) => ({
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

  // Validate required fields (email is now from sender, so don't check it in parsed data)
  if (!data.organization || !data.contactPerson || !data.purpose || !data.dataTypes || !data.justification) {
    return null;
  }

  return data as EmailData;
}

async function processMessage(message: any, connection: any) {
  // Get sender from message headers (more reliable)
  let senderEmail: string = '';
  
  const headerPart = message.parts.find((part: any) => part.which === 'HEADER');
  if (headerPart) {
    const headerText = typeof headerPart.body === 'string' ? headerPart.body : '';
    // Extract From header
    const fromMatch = headerText.match(/From:\s*([^\n]*)/i);
    if (fromMatch) {
      const fromHeader = fromMatch[1];
      // Try to extract email from "Name <email@domain.com>" format
      const emailMatch = fromHeader.match(/[\w\.-]+@[\w\.-]+\.\w+/);
      if (emailMatch) {
        senderEmail = emailMatch[0];
      }
    }
  }
  
  console.log('Sender email from headers:', senderEmail);

  const all = message.parts.find((part: any) => part.which === 'TEXT');
  if (!all) {
    console.log('No TEXT part found, skipping');
    return;
  }

  // Parse the entire message to get text and html separately
  const parsed = await simpleParser(all.body);
  
  // Prefer plain text over HTML - simpleParser handles this conversion automatically
  let emailBody = parsed.text || '';
  
  // If HTML is present but no text, it means the email is HTML-only
  // In this case, we should get plain text from the parsed.text property
  // but if that's empty, we need to extract from HTML manually
  if (!emailBody && parsed.html) {
    console.log('No plain text found, extracting from HTML...');
    emailBody = parsed.html
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/=3D/g, '=') // Decode quoted-printable
      .replace(/=C2=A0/g, ' ') // Non-breaking space
      .replace(/=[0-9A-Fa-f]{2}/g, (match) => {
        try {
          return String.fromCharCode(parseInt(match.slice(1), 16));
        } catch (e) {
          return match;
        }
      })
      .replace(/\s+/g, ' ') // Collapse whitespace
      .trim();
  }
  
  console.log('Parsed email body:', emailBody.substring(0, 200) + '...');
  
  if (!senderEmail) {
    console.log('⚠️ No sender email found from headers, trying to extract from parsed message');
    // Fallback: Try multiple formats to get sender email from parsed message
    if (typeof parsed.from === 'string') {
      senderEmail = parsed.from;
    } else if (parsed.from?.value?.[0]?.address) {
      senderEmail = parsed.from.value[0].address;
    } else if (parsed.from?.text) {
      const match = parsed.from.text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
      senderEmail = match ? match[0] : '';
    }
  }
  
  console.log('Final sender email:', senderEmail);
  
  const emailData = parseEmailBody(emailBody);
  if (!emailData) {
    console.log('Failed to parse email data');
    return;
  }

  // Override the email with the sender's email (more reliable), but fallback to body email if not found
  if (senderEmail) {
    emailData.email = senderEmail;
  } else {
    console.log('⚠️ No sender email extracted, using email from body:', emailData.email);
  }

  console.log('Checking for placeholder values...');
  console.log('Sender Email:', senderEmail);
  console.log('Contact Email:', emailData.email);
  console.log('Organization:', emailData.organization);
  console.log('Contact:', emailData.contactPerson);

  // Require at least a valid email from either sender or body
  if (!emailData.email) {
    console.log('❌ No email found - skipping this request');
    return;
  }

  // Skip emails with placeholder values
  if (emailData.organization?.includes('[Enter') ||
      emailData.contactPerson?.includes('[Your name]')) {
    console.log('Skipping email with placeholder values');
    return;
  }

  // Check if this request already exists (use sender email or body email for duplicate check)
  const contactEmail = senderEmail || emailData.email;
  const existingRequest = await AccessRequest.findOne({
    email: contactEmail,
    organization: emailData.organization,
    status: 'email_submitted'
  });

  if (existingRequest) {
    console.log('Access request already exists for this email/organization, skipping');
    return;
  }

  console.log('Parsed email data:', emailData);
  const newRequest = await AccessRequest.create({
    ...emailData,
    status: 'email_submitted',
    requestedAt: new Date(),
    priority: 'medium'
  });
  console.log('AccessRequest created from email');

  // Mark as read
  await connection.addFlags(message.attributes.uid, ['\\Seen']);

  // Return the created request data for reporting
  return {
    id: newRequest._id,
    organization: newRequest.organization,
    contactPerson: newRequest.contactPerson,
    email: newRequest.email
  };
}

async function monitorEmails() {
  console.log('Starting email monitoring...');

  const results = {
    emailsFound: 0,
    emailsProcessed: 0,
    newRequests: 0,
    errors: [] as string[],
    processedRequests: [] as any[]
  };

  const config = {
    imap: {
      user: process.env.EMAIL_USER!,
      password: process.env.EMAIL_PASSWORD!,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }, // For development - allows self-signed certs
      authTimeout: 10000, // Increased from 3000ms to 10000ms for slower connections
      connectionTimeout: 10000 // Added connection timeout
    }
  };

  try {
    console.log('Connecting to IMAP...');
    const connection = await connect(config);
    await connection.openBox('INBOX');
    console.log('Connected to inbox');

    const searchCriteria = [
      ['SINCE', new Date().toISOString().split('T')[0]], // Today's date
      ['SUBJECT', 'Government Data Access Request'], // Only emails with this subject
      ['UNSEEN'] // Only unread emails
    ];
    const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: false };

    console.log('Searching for government access request emails from today...');
    const messages = await connection.search(searchCriteria, fetchOptions);
    results.emailsFound = messages.length;
    console.log(`Found ${messages.length} government access request emails`);

    for (const message of messages) {
      try {
        console.log('Processing message...');
        const requestData = await processMessage(message, connection);
        if (requestData) {
          results.processedRequests.push(requestData);
          results.newRequests++;
        }
        results.emailsProcessed++;
      } catch (error) {
        const errorMsg = `Failed to process message: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    connection.end();
    console.log('Email monitoring completed');
    
    return results;
  } catch (error) {
    console.error('Email monitoring error:', error);
    results.errors.push(`Email monitoring failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return results;
  }
}

// Run every 2 minutes
setInterval(monitorEmails, 2 * 60 * 1000);

// Initial run
monitorEmails();

// Export for API usage
export { monitorEmails };