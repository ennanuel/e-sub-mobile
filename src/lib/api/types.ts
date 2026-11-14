/**
 * Shapes the frontend expects from the API. Money is in naira (whole numbers), dates are ISO 8601 strings.
 * docs/API.md lists the endpoint that returns each one.
 */

export type PlotUse = 'Residential' | 'Commercial';

export type PlanMonths = 6 | 12 | 18;

export interface PaymentPlan {
  months: PlanMonths;
  /** The full amount for this plan, deposit included. */
  total: number;
}

export interface Plot {
  id: string;
  sizeSqm: number;
  use: PlotUse;
  outrightPrice: number;
  /** Initial deposit, the same for every plan length. */
  deposit: number;
  plans: PaymentPlan[];
}

export interface ClosingCosts {
  surveyFee: number;
  legalFee: number;
}

export type AmenityIcon = 'gate' | 'shield' | 'road' | 'lamp' | 'drain' | 'leaf';

export interface Amenity {
  label: string;
  icon: AmenityIcon;
}

export interface Photo {
  url: string;
  title: string;
  caption: string;
}

export interface Realtor {
  name: string;
  role: string;
  phone: string;
  photoUrl: string;
}

export interface Development {
  slug: string;
  /** Short name, e.g. "CityView". */
  name: string;
  /** Full name, e.g. "CityView Park & Resort" (map card). */
  fullName: string;
  /** e.g. "Apo, Abuja" */
  area: string;
  /** e.g. "Apo Wasa, Abuja" */
  address: string;
  description: string;
  startingPrice: number;
  realtor: Realtor;
  amenities: Amenity[];
  photos: Photo[];
  /** Public names of the title papers (the scans themselves need a session: getPapers). */
  paperwork: { summary: string; documents: { id: PaperId; label: string; title: string }[] };
  plots: Plot[];
  closingCosts: ClosingCosts;
  mapsUrl: string;
}

/* FAQ: answers are structured blocks, so the frontend never renders HTML from the API. */
export type FaqBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; head?: string[]; rows: string[][] }
  | { type: 'note'; text: string }
  | { type: 'map' };

export type FaqCategory = 'Prices' | 'Papers' | 'Building' | 'The estate';

export interface FaqItem {
  id: string;
  category: FaqCategory;
  question: string;
  answer: FaqBlock[];
}

export interface Faq {
  /** The first `featuredCount` items are shown on the listing. */
  featuredCount: number;
  items: FaqItem[];
}

export interface TermsSection {
  title: string;
  clauses: string[];
}

export interface Terms {
  version: string;
  sections: TermsSection[];
}

/* Email check (one-time code) */
export interface CodeSent {
  /** Seconds before "Resend code" may be used. */
  resendAfterSeconds: number;
}

export interface Session {
  token: string;
  email: string;
}

/* Title papers (need a session) */
export interface PaperPage {
  plotNumber: string;
  /** e.g. "19.65 ha" */
  area: string;
  imageUrl: string;
}

export type PaperId = 'rofo' | 'survey' | 'cofo';

export interface Paper {
  id: PaperId;
  /** Small caps line, e.g. "CERTIFICATE OF OCCUPANCY" */
  label: string;
  title: string;
  pages: PaperPage[];
}

/* Buying */
export interface UploadedFile {
  fileId: string;
}

export type Gender = 'Male' | 'Female';
export type MaritalStatus = 'Single' | 'Married' | 'Other';
export type Relationship = 'Spouse' | 'Parent' | 'Sibling' | 'Child' | 'Friend';

export interface BuyerDetails {
  passportPhotoFileId?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender?: Gender;
  /** E.164, e.g. +2348031234567 */
  phone: string;
  altPhone?: string;
  nationality?: string;
  countryOfResidence?: string;
  /** YYYY-MM-DD */
  dateOfBirth?: string;
  maritalStatus?: MaritalStatus;
  homeAddress: string;
  occupation?: string;
  employer?: string;
  workAddress?: string;
  idFrontFileId: string;
  idBackFileId?: string;
  nextOfKin: {
    fullName: string;
    relationship: Relationship;
    phone: string;
    altPhone?: string;
    email?: string;
    address?: string;
  };
}

export interface ApplicationRequest {
  developmentSlug: string;
  plotId: string;
  /** 0 for outright */
  months: 0 | PlanMonths;
  termsVersion: string;
  buyer: BuyerDetails;
}

export interface BankAccount {
  bank: string;
  accountNumber: string;
}

export interface Offer {
  applicationId: string;
  emailedTo: string;
  plot: { sizeSqm: number; use: PlotUse };
  months: 0 | PlanMonths;
  /** Pay by this date (ISO). */
  payBy: string;
  /** Plan: the initial deposit. Outright: the purchase price. */
  firstPayment: number;
  /** Plan only: what is left after the deposit. */
  balance?: number;
  /** Plan only: when the balance must be paid (ISO). */
  balanceDueBy?: string;
  /** Outright only: price plus closing costs. */
  totalWithClosingCosts?: number;
  /** What to transfer now, shown on the account page. */
  amountDue: number;
  accountName: string;
  accounts: BankAccount[];
}

export interface TransferNotice {
  status: 'awaiting_confirmation';
}
