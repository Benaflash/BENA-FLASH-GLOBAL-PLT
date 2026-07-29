export enum UserRole {
  SUPER_ADMIN = "SUPER ADMIN",
  ADMIN = "ADMIN",
  PROJECT_MANAGER = "PROJECT MANAGER",
  TECHNICIAN = "TECHNICIAN",
  FINANCE = "FINANCE",
  HR = "HR",
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  aboutText: string;
  phone: string;
  email: string;
  address: string;
  ecommerceLink: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  experienceYears: number;
  completedProjects: number;
  customerSatisfaction: number;
  clientsCorporate: number;
  operatingStates: number;
  coreStaff: number;
  beforeAfterBeforeImg?: string;
  beforeAfterAfterImg?: string;
  isPromoActive?: boolean;
  promoText?: string;
  promoLink?: string;
  aboutImgUrl?: string; // Image for 'Profil Syarikat Bumiputera'
  orgChartImgUrl?: string; // Image/Logo for Organization schema if needed
}

export interface Project {
  id: string;
  title: string;
  client: string;
  location: string;
  value: string;
  completionDate: string;
  category:
    | "Electrical Installation"
    | "Aircond Installation"
    | "Testing & Commissioning"
    | "MSB & DB Installation"
    | "Solar Installation";
  status: "Completed" | "In Progress" | "Planning";
  img: string; // Current / After view
  imgBefore?: string; // Before view
  images?: string[]; // Multiple extra images
  documents?: string[]; // Report site diari URLs
  description: string;
  coordinates?: { lat: number; lng: number }; // For map preview
  milestones?: { id: string; title: string; date: string; status: 'Pending' | 'In Progress' | 'Completed' }[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface Certification {
  id: string;
  name: string;
  issuingBody: string;
  logoText: string;
  description: string;
  registrationNo?: string;
  validity?: string;
  specialties?: string[];
  imageUrl?: string;
  pdfUrl?: string;
}

export interface LeadQuote {
  id: string;
  date: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  serviceType: string;
  location: string;
  budget: string;
  message: string;
  status: "New" | "Reviewed" | "Contacted" | "Quoted" | "Completed";
  scheduledDate?: string; // e.g. '2026-06-25'
  scheduledTimeSlot?: string; // e.g. '09:00 AM - 11:00 AM'
  scheduledFollowUpDate?: string; // e.g. '2026-07-29 (10:00 AM)'
  scheduledFollowUpAgenda?: string; // Follow-up purpose or topic
  estimatedCompletionDate?: string; // e.g. '2026-07-15'
  adminFeedback?: string; // Remark or update from admin
  updatedAt?: string; // Timestamp of last update
  attachmentUrl?: string; // Reference / Photo file
  attachmentName?: string; // Filename
  assignedStaffId?: string; // ID of the assigned staff member/technician
  customerMessages?: { id: string; sender: "customer" | "admin"; text: string; timestamp: string; senderName?: string }[];
  reviewed?: boolean;
  tags?: string[];
  timeline?: {
    id: string;
    timestamp: string;
    title: string;
    note?: string;
    author?: string;
    type?: "status_change" | "note" | "tag" | "system";
  }[];
}

export interface AdminNotification {
  id: string;
  timestamp: string; // ISO string
  type: "booking" | "career" | "feedback" | "sys";
  title: string;
  message: string;
  read: boolean;
  senderName?: string;
  senderEmail?: string;
}

export interface Career {
  id: string;
  title: string;
  department: string;
  location: string;
  jobType: "Full-time" | "Part-time" | "Contract" | "Internship";
  salary: string;
  requirements: string[]; // listed requirements
  status: "Active" | "Closed";
}

export interface Application {
  id: string;
  date: string;
  careerId: string;
  careerTitle: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl?: string; // Base64 or Google Drive Link or direct URL
  resumeName?: string; // Name of resume file
  certificatesUrl?: string; // Base64 or Google Drive Link or direct URL
  certificatesName?: string; // Name of certificate file
  othersUrl?: string; // Base64 or Google Drive Link or direct URL
  othersName?: string; // Name of others file
  experienceSummary: string;
  status?: "New" | "Reviewed" | "Contacted" | "Rejected";
}

export interface BlogReaderLog {
  id: string;
  blogId: string;
  blogTitle: string;
  readerEmail: string;
  readerName?: string;
  action: "read" | "share";
  platform?: string;
  timestamp: string;
}

export interface Blog {
  id: string;
  title: string;
  category: string;
  snippet: string;
  content: string;
  date: string;
  readTime: string;
  author: string;
  img: string; // Primary image
  images?: string[]; // Multiple extra images
  websiteUrl?: string; // Pautan URL Website Rujukan / Sumber Artikel
  viewsCount?: number;
  sharesCount?: number;
}

export interface ClientLogo {
  id: string;
  name: string;
  logoUrl?: string; // Optional URL to actual logo image
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  qualification: string;
  experience: string;
  avatarText: string;
  avatarUrl?: string;
  reportsTo?: string | null;
}

export interface CorporateDocument {
  id: string;
  title: string;
  cat: string;
  desc: string;
  imgUrl: string;
  isDownload: boolean;
  link?: string;
}

export interface ServiceInfo {
  id: string;
  iconName: string;
  title: string;
  description: string;
  bullets: string[];
  imageUrl?: string;
}

export interface AircondRate {
  id: string;
  labelMs: string;
  labelEn: string;
  minPrice: number;
  maxPrice: number;
  order: number;
}

export interface Testimonial {
  id: string;
  projectId?: string; // Optional reference to the project
  clientName: string;
  clientCompany?: string;
  feedback: string;
  rating: number; // 1 to 5
  date: string;
  userId: string; // The User ID who submitted it (to verify past customer)
  verified: boolean; // Has it been approved/verified by the admin?
}

export interface AppState {
  companyInfo: CompanyInfo;
  projects: Project[];
  leads: LeadQuote[];
  careers: Career[];
  applications: Application[];
  blogs: Blog[];
  clientLogos: ClientLogo[];
  staff: StaffMember[];
  documents: CorporateDocument[];
  services: ServiceInfo[];
}
