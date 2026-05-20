export type GlpiTicketStatus = string;

export type GlpiTicket = {
  id: number;
  name?: string;
  content?: string;
  status?: string;
  priority?: string;
  urgency?: string;
  category?: string;
  location?: string;
  requester?: string;
  assignedToTechnician?: string;
  assignedToTechnicianGroup?: string;
  openingDate?: string;
  lastUpdate?: string;
  closingDate?: string;
  description?: string;
};
