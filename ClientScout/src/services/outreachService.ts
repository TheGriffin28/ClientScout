// Outreach Service - Opens user's tools with pre-filled content
// ClientScout does NOT send emails or WhatsApp messages
// It only opens the user's tools (Gmail, Outlook, WhatsApp, etc.)

import { Lead } from './leadService';
import { getTemplate, personalizeTemplate, TemplateVariables } from './templateService';
import { updateLead, updateLeadStatus } from './leadService';

export interface OutreachOptions {
  lead: Lead;
  templateId?: string;
  customMessage?: string;
  customSubject?: string;
}

// Format phone number for WhatsApp (remove non-digits except +)
export const formatPhoneForWhatsApp = (phone: string): string => {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it doesn't start with +, assume it's a local number
  // For India, add +91 if it's a 10-digit number
  if (!cleaned.startsWith('+')) {
    // Check if it's a 10-digit Indian number
    if (cleaned.length === 10) {
      cleaned = '+91' + cleaned;
    }
  }
  
  return cleaned;
};

// Open email client with pre-filled content
export const openEmail = async (options: OutreachOptions): Promise<void> => {
  const { lead, templateId, customMessage, customSubject } = options;
  
  if (!lead.email) {
    alert('No email address available for this lead.');
    return;
  }
  
  let subject = customSubject || '';
  let body = customMessage || '';
  
  // Use template if provided
  if (templateId && !customMessage) {
    const template = getTemplate(templateId);
    if (template && template.type === 'email') {
      const variables: TemplateVariables = {
        BusinessName: lead.businessName,
        ContactName: lead.contactName,
        Website: lead.website,
      };
      const personalized = personalizeTemplate(template, variables);
      subject = personalized.subject || '';
      body = personalized.body;
    }
  }
  
  // If no template and no custom message, use a simple default
  if (!body) {
    body = `Hi ${lead.contactName || 'there'},

I wanted to reach out about ${lead.businessName}.

Best regards`;
  }
  
  // Encode for mailto link
  const mailtoLink = `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  // Open email client
  window.location.href = mailtoLink;
  
  // Track outreach
  await trackOutreach(lead._id, 'email', subject || 'Email opened');
};

// Open WhatsApp with pre-filled message
export const openWhatsApp = async (options: OutreachOptions): Promise<void> => {
  const { lead, templateId, customMessage } = options;
  
  if (!lead.phone) {
    alert('No phone number available for this lead.');
    return;
  }
  
  let message = customMessage || '';
  
  // Use template if provided
  if (templateId && !customMessage) {
    const template = getTemplate(templateId);
    if (template && template.type === 'whatsapp') {
      const variables: TemplateVariables = {
        BusinessName: lead.businessName,
        ContactName: lead.contactName,
        Website: lead.website,
      };
      const personalized = personalizeTemplate(template, variables);
      message = personalized.body;
    }
  }
  
  // If no template and no custom message, use a simple default
  if (!message) {
    message = `Hi ${lead.contactName || 'there'}! 👋\n\nI wanted to reach out about ${lead.businessName}.`;
  }
  
  // Format phone number
  const phone = formatPhoneForWhatsApp(lead.phone);
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Open WhatsApp Web (desktop) or WhatsApp app (mobile)
  const whatsappLink = `https://wa.me/${phone}?text=${encodedMessage}`;
  
  // Open in new tab
  window.open(whatsappLink, '_blank');
  
  // Track outreach
  await trackOutreach(lead._id, 'whatsapp', message);
};

// Open phone dialer
export const openCall = (phone: string): void => {
  if (!phone) {
    alert('No phone number available for this lead.');
    return;
  }
  
  // Use tel: protocol to open phone dialer
  window.location.href = `tel:${phone}`;
};

// Track outreach - update lead status and add note
const trackOutreach = async (
  leadId: string,
  method: 'email' | 'whatsapp',
  content: string
): Promise<void> => {
  try {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    
    // Import getLeadById to fetch current notes
    const { getLeadById } = await import('./leadService');
    
    // Get current lead to preserve existing notes
    const currentLead = await getLeadById(leadId);
    const existingNotes = currentLead.notes || '';
    
    // Create new note entry
    const newNote = `[${dateStr}] ${method === 'email' ? 'Email' : 'WhatsApp'} opened: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`;
    
    // Append to existing notes
    const updatedNotes = existingNotes 
      ? `${existingNotes}\n${newNote}`
      : newNote;
    
    // Update lead status to Contacted (don't await to avoid blocking)
    updateLeadStatus(leadId, 'Contacted').catch(console.error);
    
    // Update notes
    await updateLead(leadId, {
      notes: updatedNotes,
    });
  } catch (error) {
    console.error('Error tracking outreach:', error);
    // Don't show error to user - tracking is secondary
  }
};
