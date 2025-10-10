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
  const lines = body.split('\n').map(line => line.trim()).filter(line => line);
  const data: any = {};

  console.log('Parsing email lines:');
  for (const line of lines) {
    console.log('Line:', JSON.stringify(line));
    const [key, ...valueParts] = line.split(':');
    const value = valueParts.join(':').trim();
    if (!key || !value) continue;

    const cleanKey = key.toLowerCase().replace(/[^a-z]/g, '');
    console.log('Key:', cleanKey, 'Value:', value);

    switch (cleanKey) {
      case 'email':
        // Only set main email if not already set (prioritize first email field)
        if (!data.email) {
          data.email = value;
        }
        break;
      case 'contactperson':
        data.contactPerson = value;
        break;
      case 'email':
        data.email = value;
        break;
      case 'phone':
        data.phone = value;
        break;
      case 'purpose':
        data.purpose = value;
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
        data.justification = value;
        break;
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
        data.governmentLevel = value as any;
        break;
      case 'department':
        data.department = value;
        break;
      case 'authorizedofficials':
        // Parse multiple officials: Name, Title, Email; Name, Title, Email
        data.authorizedOfficials = value.split(';').map((official: string) => {
          const parts = official.split(',').map(s => s.trim());
          if (parts.length >= 3) {
            return { name: parts[0], title: parts[1], email: parts[2] };
          } else if (parts.length >= 2) {
            // Fallback: assume Name, Email format
            return { name: parts[0], title: 'Contact', email: parts[1] };
          } else {
            return { name: parts[0] || 'Unknown', title: 'Contact', email: '' };
          }
        });
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
      .filter(official => official.name && official.email) // Only keep officials with name and email
      .map(official => ({
        name: official.name,
        title: official.title || 'Contact',
        email: official.email,
        phone: official.phone || ''
      }));
  }

  // Must have at least one authorized official with email
  if (!data.authorizedOfficials || data.authorizedOfficials.length === 0) {
    console.log('No valid authorized officials found');
    return null;
  }

  // Validate required fields (email is now from sender, so don't check it in parsed data)
  if (!data.organization || !data.contactPerson || !data.purpose || !data.dataTypes || !data.justification) {
    return null;
  }

  return data as EmailData;
}

async function processMessage(message: any, connection: any) {
  const all = message.parts.find((part: any) => part.which === 'TEXT');
  if (!all) {
    console.log('No TEXT part found, skipping');
    return;
  }

  const parsed = await simpleParser(all.body);
  console.log('Parsed email body:', parsed.text?.substring(0, 200) + '...');
  
  // Use the sender's email address as the contact email (more reliable than parsing from body)
  const senderEmail = parsed.from?.value?.[0]?.address;
  if (!senderEmail) {
    console.log('No sender email found, skipping');
    return;
  }
  
  const emailData = parseEmailBody(parsed.text || '');
  if (!emailData) {
    console.log('Failed to parse email data');
    return;
  }

  // Override the email with the sender's email (more reliable)
  emailData.email = senderEmail;

  console.log('Checking for placeholder values...');
  console.log('Sender Email:', senderEmail);
  console.log('Organization:', emailData.organization);
  console.log('Contact:', emailData.contactPerson);

  // Skip emails with placeholder values
  if (emailData.organization?.includes('[Enter') ||
      emailData.contactPerson?.includes('[Your name]')) {
    console.log('Skipping email with placeholder values');
    return;
  }

  // Check if this request already exists (use sender email for duplicate check)
  const existingRequest = await AccessRequest.findOne({
    email: senderEmail,
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
      authTimeout: 3000
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
        const errorMsg = `Failed to process message: ${error.message}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    connection.end();
    console.log('Email monitoring completed');
    
    return results;
  } catch (error) {
    console.error('Email monitoring error:', error);
    results.errors.push(`Email monitoring failed: ${error.message}`);
    return results;
  }
}

// Run every 2 minutes
setInterval(monitorEmails, 2 * 60 * 1000);

// Initial run
monitorEmails();

// Export for API usage
export { monitorEmails };