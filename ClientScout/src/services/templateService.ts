// Template Service for Email and WhatsApp Outreach
// Templates are stored in localStorage for V1

export interface Template {
  id: string;
  name: string;
  subject?: string; // For email templates
  body: string;
  type: 'email' | 'whatsapp';
}

export interface TemplateVariables {
  BusinessName?: string;
  ContactName?: string;
  YourService?: string;
  Website?: string;
}

// Default templates
const DEFAULT_EMAIL_TEMPLATES: Template[] = [
  {
    id: 'email-cold',
    name: 'Cold Outreach',
    type: 'email',
    subject: 'Partnership opportunity with {{BusinessName}}',
    body: `Hi {{ContactName}},

I came across {{BusinessName}} and was impressed by your work. I'd love to explore how we can help you grow your business.

We specialize in {{YourService}} and have helped similar businesses achieve significant results.

Would you be open to a quick conversation this week?

Best regards`
  },
  {
    id: 'email-followup',
    name: 'Follow-up',
    type: 'email',
    subject: 'Following up on my previous message',
    body: `Hi {{ContactName}},

I wanted to follow up on my previous message about {{YourService}} for {{BusinessName}}.

I understand you're busy, but I believe we could provide real value to your business.

Would you be available for a brief call this week?

Best regards`
  },
  {
    id: 'email-second-followup',
    name: 'Second Follow-up',
    type: 'email',
    subject: 'Quick check-in',
    body: `Hi {{ContactName}},

Just wanted to check in one more time about {{YourService}} for {{BusinessName}}.

If now isn't the right time, I completely understand. Feel free to reach out when you're ready.

Best regards`
  }
];

const DEFAULT_WHATSAPP_TEMPLATES: Template[] = [
  {
    id: 'whatsapp-first',
    name: 'First Contact',
    type: 'whatsapp',
    body: `Hi {{ContactName}}! 👋

I came across {{BusinessName}} and thought you might be interested in {{YourService}}.

Would you be open to a quick chat?`
  },
  {
    id: 'whatsapp-followup',
    name: 'Follow-up Nudge',
    type: 'whatsapp',
    body: `Hi {{ContactName}}!

Just following up on my previous message about {{YourService}} for {{BusinessName}}.

Are you available for a quick call this week?`
  }
];

// Get all templates
export const getTemplates = (type?: 'email' | 'whatsapp'): Template[] => {
  const stored = localStorage.getItem('clientScout_templates');
  let templates: Template[] = [];
  
  if (stored) {
    try {
      templates = JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing templates from localStorage', e);
      templates = [...DEFAULT_EMAIL_TEMPLATES, ...DEFAULT_WHATSAPP_TEMPLATES];
    }
  } else {
    templates = [...DEFAULT_EMAIL_TEMPLATES, ...DEFAULT_WHATSAPP_TEMPLATES];
    saveTemplates(templates);
  }
  
  if (type) {
    return templates.filter(t => t.type === type);
  }
  
  return templates;
};

// Save templates
export const saveTemplates = (templates: Template[]): void => {
  localStorage.setItem('clientScout_templates', JSON.stringify(templates));
};

// Get a specific template by ID
export const getTemplate = (id: string): Template | null => {
  const templates = getTemplates();
  return templates.find(t => t.id === id) || null;
};

// Save/Update a template
export const saveTemplate = (template: Template): void => {
  const templates = getTemplates();
  const index = templates.findIndex(t => t.id === template.id);
  
  if (index >= 0) {
    templates[index] = template;
  } else {
    templates.push(template);
  }
  
  saveTemplates(templates);
};

// Delete a template
export const deleteTemplate = (id: string): void => {
  const templates = getTemplates();
  const filtered = templates.filter(t => t.id !== id);
  saveTemplates(filtered);
};

// Personalize template with variables
export const personalizeTemplate = (
  template: Template,
  variables: TemplateVariables
): { subject?: string; body: string } => {
  let subject = template.subject || '';
  let body = template.body;
  
  // Default service if not provided
  const yourService = variables.YourService || 'our services';
  
  // Replace variables
  const replacements: Record<string, string> = {
    '{{BusinessName}}': variables.BusinessName || 'their business',
    '{{ContactName}}': variables.ContactName || 'there',
    '{{YourService}}': yourService,
    '{{Website}}': variables.Website || '',
  };
  
  Object.entries(replacements).forEach(([key, value]) => {
    const regex = new RegExp(key.replace(/[{}]/g, '\\$&'), 'g');
    subject = subject.replace(regex, value);
    body = body.replace(regex, value);
  });
  
  return { subject: subject || undefined, body };
};

// Reset to default templates
export const resetToDefaults = (): void => {
  saveTemplates([...DEFAULT_EMAIL_TEMPLATES, ...DEFAULT_WHATSAPP_TEMPLATES]);
};
