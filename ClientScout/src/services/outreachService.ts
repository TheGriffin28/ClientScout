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
    const { getLeadById } = await import('./leadService');
    const lead = await getLeadById(leadId);
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    
    const newNote = `[${dateStr}] ${method === 'email' ? 'Email' : 'WhatsApp'} opened: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`;
    const existingNotes = lead.notes || '';
    const updatedNotes = existingNotes 
      ? `${existingNotes}\n${newNote}`
      : newNote;
    
    updateLeadStatus(leadId, 'Contacted').catch(console.error);
    await updateLead(leadId, { notes: updatedNotes });
  } catch (error) {
    console.error('Error tracking outreach:', error);
  }
};

export const generateEmailDraft = async (lead: Lead): Promise<{ subject: string; body: string }> => {
  // Mock AI generation
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    subject: `Quick question regarding ${lead.businessName}`,
    body: `Hi ${lead.contactName || "Team"},\n\nI came across ${lead.businessName} and noticed some great potential for growth. I'd love to discuss how we can help you scale.\n\nBest regards,\n[Your Name]`
  };
};

export const sendEmail = async (leadId: string, { subject, body }: { subject: string; body: string }) => {
  const { getLeadById } = await import('./leadService');
  const lead = await getLeadById(leadId);
  
  if (!lead.email) {
    throw new Error("No email address available");
  }
  
  const mailtoLink = `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoLink;
  
  await trackOutreach(leadId, 'email', subject);
};

export const generateWhatsAppDraft = async (lead: Lead): Promise<{ body: string }> => {
  // Mock AI generation
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    body: `Hi ${lead.contactName || "there"}, I saw ${lead.businessName} and wanted to connect. Are you open to a quick chat?`
  };
};

export const sendWhatsApp = async (leadId: string, { body }: { body: string }) => {
  const { getLeadById } = await import('./leadService');
  const lead = await getLeadById(leadId);
  
  if (!lead.phone) {
    throw new Error("No phone number available");
  }
  
  const phone = formatPhoneForWhatsApp(lead.phone);
  const whatsappLink = `https://wa.me/${phone}?text=${encodeURIComponent(body)}`;
  window.open(whatsappLink, '_blank');
  
  await trackOutreach(leadId, 'whatsapp', body);
};

