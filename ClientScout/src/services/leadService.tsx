import api from "./api";
import { ThemeKey, LegacyTemplateKey, HeroVariant } from "./templateEngine";

export interface DesignRecipe {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  layout: {
    sections: string[];
    heroVariant: string;
    cardStyle: string;
    spacing: string;
  };
  aesthetic: string;
}

export interface LayoutVersion {
  id: string;
  name: string;
  description: string;
  templateKey: LegacyTemplateKey;
  themeKey?: ThemeKey;
  heroVariant?: HeroVariant;
  design?: DesignRecipe;
  content: {
    hero: {
      headline: string;
      tagline: string;
      primaryCta: string;
      secondaryCta: string;
    };
    about: {
      title: string;
      description: string;
    };
    services: Array<{
      name: string;
      description: string;
    }>;
    testimonials: Array<{
      name: string;
      quote: string;
    }>;
    contact: {
      phone: string;
      address: string;
      ctaText: string;
    };
  };
  pitchMessage?: string;
  previewUrl?: string;
  generatedAt: string;
  isRecommended: boolean;
}

export interface Lead {
  _id: string;
  businessName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  businessType?: string;
  websiteObservations?: {
    performanceIssues: string[];
    trustIssues: string[];
    conversionIssues: string[];
  };
  painPoints?: string[];
  aiSummary?: string;
  leadScore?: number;
  leadScoreReason?: string;
  aiGeneratedAt?: string;
  emailDraft?: {
    subject: string;
    body: string;
    generatedAt: string;
  };
  whatsappDraft?: {
    body: string;
    generatedAt: string;
  };
  designsPreparedAt?: string;
  generatedLayout?: {
    templateKey: LegacyTemplateKey;
    themeKey?: ThemeKey;
    heroVariant?: HeroVariant;
    content: {
      hero: {
        headline: string;
        tagline: string;
        primaryCta: string;
        secondaryCta: string;
      };
      about: {
        title: string;
        description: string;
      };
      services: Array<{
        name: string;
        description: string;
      }>;
      testimonials: Array<{
        name: string;
        quote: string;
      }>;
      contact: {
        phone: string;
        address: string;
        ctaText: string;
      };
    };
    pitchMessage?: string;
    previewUrl?: string;
    generatedAt: string;
  };
  layoutVersions?: LayoutVersion[];
  selectedLayoutId?: string;
  clientApproved?: boolean;
  clientApprovedAt?: string;
  clientApprovedLayoutId?: string;
  clientApprovedLayoutName?: string;
  clientChangeRequest?: string;
  clientChangeRequestedAt?: string;
  lastContactedAt?: string;
  source?: string;
  status: "New" | "Contacted" | "FollowUp" | "Interested" | "Converted" | "Lost";
  calculatedScore?: number;
  scoreCategory?: "Hot" | "Warm" | "Cold";
  notes?: string;
  nextFollowUp?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadFormData {
  businessName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  businessType?: string;
  websiteObservations?: {
    performanceIssues: string[];
    trustIssues: string[];
    conversionIssues: string[];
  };
  painPoints?: string[];
  aiSummary?: string;
  leadScore?: number;
  leadScoreReason?: string;
  aiGeneratedAt?: string;
  source?: string;
  status: "New" | "Contacted" | "FollowUp" | "Interested" | "Converted" | "Lost";
  notes?: string;
  nextFollowUp?: string;
  emailDraft?: {
    subject: string;
    body: string;
    generatedAt: string;
  };
  whatsappDraft?: {
    body: string;
    generatedAt: string;
  };
  generatedLayout?: Lead["generatedLayout"];
  layoutVersions?: Lead["layoutVersions"];
  selectedLayoutId?: Lead["selectedLayoutId"];
  clientApproved?: boolean;
  clientApprovedAt?: string;
  clientApprovedLayoutId?: string;
  clientApprovedLayoutName?: string;
  clientChangeRequest?: string;
  clientChangeRequestedAt?: string;
}

export interface PaginatedLeads {
  leads: Lead[];
  currentPage: number;
  totalPages: number;
  totalLeads: number;
}

export const getLeads = async (page = 1, limit = 10, search = ""): Promise<PaginatedLeads | Lead[]> => {
  const res = await api.get(`/leads?page=${page}&limit=${limit}${search ? `&search=${search}` : ""}`);
  return res.data;
};

export const getLeadById = async (id: string): Promise<Lead> => {
  const res = await api.get(`/leads/${id}`);
  return res.data;
};

export const createLead = async (lead: LeadFormData): Promise<Lead> => {
  const res = await api.post("/leads", lead);
  return res.data;
};

export const updateLead = async (id: string, lead: Partial<LeadFormData>): Promise<Lead> => {
  const res = await api.put(`/leads/${id}`, lead);
  return res.data;
};

export const deleteLead = async (id: string): Promise<void> => {
  await api.delete(`/leads/${id}`);
};

export const updateLeadStatus = async (id: string, status: Lead["status"]): Promise<Lead> => {
  const res = await api.put(`/leads/${id}/status`, { status });
  return res.data;
};

export const getLeadStats = async () => {
  const res = await api.get("/leads/stats");
  return res.data;
};

export const getFollowUps = async (search = ""): Promise<Lead[]> => {
  const res = await api.get(`/leads/followups${search ? `?search=${search}` : ""}`);
  return res.data;
};

export const analyzeLead = async (id: string): Promise<Lead> => {
  const res = await api.post(`/leads/${id}/analyze`);
  return res.data;
};

export const generateEmailDraft = async (id: string): Promise<Lead> => {
  const res = await api.post(`/leads/${id}/generate-email`);
  return res.data;
};

export const sendLeadEmail = async (
  id: string,
  subject: string,
  body: string,
  designPreviewUrl?: string
): Promise<any> => {
  const res = await api.post(`/leads/${id}/send-email`, { subject, body, designPreviewUrl });
  return res.data;
};

export const generateWhatsAppDraft = async (id: string): Promise<Lead> => {
  const res = await api.post(`/leads/${id}/generate-whatsapp`);
  return res.data;
};

export const generateLayout = async (id: string): Promise<Lead> => {
  const res = await api.post(`/leads/${id}/generate-layout`);
  return res.data;
};

export const logContact = async (id: string): Promise<Lead> => {
  const res = await api.post(`/leads/${id}/log-contact`);
  return res.data;
};

export const getDashboardStats = async () => {
  const res = await api.get("/leads/stats");
  return res.data;
};

/* PUBLIC LEAD ENDPOINTS - No authentication required */
export const getLeadByIdPublic = async (id: string): Promise<Lead> => {
  const res = await api.get(`/leads/public/${id}`);
  return res.data;
};

export const updateLeadPublic = async (id: string, updates: Partial<LeadFormData>): Promise<Lead> => {
  const res = await api.put(`/leads/public/${id}`, updates);
  return res.data;
};
