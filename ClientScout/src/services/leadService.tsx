import api from "./api";

export interface Lead {
  _id: string;
  businessName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  source?: string;
  status: "New" | "Contacted" | "FollowUp" | "Interested" | "Converted" | "Lost";
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
  source?: string;
  status: "New" | "Contacted" | "FollowUp" | "Interested" | "Converted" | "Lost";
  notes?: string;
  nextFollowUp?: string;
}

export const getLeads = async (): Promise<Lead[]> => {
  const res = await api.get("/leads");
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

export const getFollowUps = async (): Promise<Lead[]> => {
  const res = await api.get("/leads/followups");
  return res.data;
};