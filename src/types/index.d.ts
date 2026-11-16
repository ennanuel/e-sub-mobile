export type Amenity = {
  icon: {
    src: string;
    width: number;
    height: number;
  };
  name: string;
  label: string;
};

export type Photo = {
  photo: string;
};

export type ContactPerson = {
  id: number;
  img?: string;
  image?: string;
  avatar?: string;
  role?: string;
  name: string;
  phone: string;
};

export type ProjectBundleResponse = {
  total_data: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: ProjectBundle[];
};

export type PropertyDocument = {
  id: number;
  document_file: string;
  document_url: string;
  purpose: 'outright_offer' | 'outright' | 'brochure';
  created_at: string;
  project: number | null;
  plan: null;
  unit: number | null;
};

export type PaymentPlan = {
  id: number;
  bundle: number;
  contract: string[];
  bundle_price: number;
  purchase_price: string;
  interest_rate: string;
  max_duration_in_months: number;
  grace_period_in_months: number;
  payment_period_in_months: number;
  due_period_in_months: number;
  initial_deposit_in_percentage: number;
  initial_deposit_in_value: string;
  payment_frequency: string;
  plan_type: string;
  periodic_payment: string;
  cost_of_funds: string;
  unprocessed_paymentplan: boolean;
  defaulting_penalty_percentage: string;
  is_private: boolean;
  manual_offer_letter_url: string | null;
  manual_purchase_agreement_url: string | null;
  allow_virtual_account: boolean;
  offer_letter_template: string | null;
  purchase_agreement_template: string | null;
  coa_bank_accounts: number[];
};

export type ClosingCost = {
  name: string;
  amount: string;
};

export type ProjectBundle = {
  id: number;
  photos: Photo[];
  invested_users: [];
  project: ProjectDetail;
  has_allocations: boolean;
  property_document: PropertyDocument[];
  fees: ClosingCost[];
  payment_plans: PaymentPlan[];
  total_purchased_fractional_units: number;
  unit_packet: unknown[];
  is_pinned: boolean;
  purchase_url: string | null;
  payment_plan_available: boolean;
  fractionalized_by: unknown | null;
  unique_ref: string | null;
  unit_size: string;
  deed_title: string | null;
  photo_urls: string[];
  unit_description: string | null;
  deed_file: string | null;
  price: string;
  price_per_fraction: string;
  cash_on_cash_yield: string | null;
  rental_yield: string | null;
  status: boolean;
  display_price: boolean;
  purchased: boolean;
  on_sale_as_fractions: boolean;
  priority_level: string | number;
  display_order: string | number;
  total_fractions: number;
  total_investors: number;
  total_purchased_units: number;
  total_purchased_fractions: number;
  total_archive: number;
  total_fractionalized_units: number;
  note: string | null;
  unit_type: string;
  no_of_bedrooms: number;
  is_fraction_sale_available: boolean;
  dividend_payout_type: string | null;
  profile_image: string | null;
  holding_period_in_months: string | null;
  next_settlement_date: string | null;
  is_qualified_for_mortgage: boolean;
  unit_title: string;
  created_at: string;
  quantity: number;
  total_quantity: number;
  open_house_date: null;
  is_archive: boolean;
  is_private: boolean;
  strategy: string;
  holding_period: string;
  allow_insurance: boolean;
  allocation_type: string;
  allocation_milestone: string;
  youtube_url: string | null;
  manual_offer_letter_url: string | null;
  manual_terms_of_agreement_url: string | null;
  currency: string | null;
  allow_virtual_account: boolean;
  outright_offer_letter_template: string | null;
  terms_of_agreement_template: string | null;
  coa_bank_accounts: number[];
};

export type BundlePaymentPlanResponse = {
  message: string;
  results: BundlePaymentPlan[];
};

export type BundlePaymentPlan = {
  id: number;
  bundle: ProjectBundle;
  contract: string[];
  bundle_price: number;
  purchase_price: string;
  interest_rate: string;
  max_duration_in_months: number;
  grace_period_in_months: number;
  payment_period_in_months: number;
  due_period_in_months: number;
  initial_deposit_in_percentage: number;
  initial_deposit_in_value: string;
  payment_frequency: string;
  plan_type: string;
  periodic_payment: string;
  cost_of_funds: string;
  unprocessed_paymentplan: false;
  defaulting_penalty_percentage: string;
  is_private: boolean;
  manual_offer_letter_url: string | null;
  manual_purchase_agreement_url: string | null;
  allow_virtual_account: boolean;
  offer_letter_template: string | null;
  purchase_agreement_template: string | null;
  coa_bank_accounts: number[];
};

export type ProjectDetailResponse = {
  message: string;
  status: boolean;
  project: ProjectDetails;
};

export type ProjectDetails = {
  id: number;
  photos: Photo[];
  land_size: string;
  created_by: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    metadata: unknown | null;
  };
  last_updated_by: unknown | null;
  total_units: number;
  rejected_by: unknown | null;
  units_available: number;
  units_sold: number;
  is_sold_out: boolean;
  unit_id: number | null;
  contact_persons: ContactPerson[];
  display_price: boolean;
  starting_from: number;
  is_watchlist: boolean;
  amenities: Amenity[];
  is_fractionalized: boolean;
  project_display_price: boolean;
  country: null;
  property_document: PropertyDocument[];
  payment_plan_is_available: boolean;
  pinned: boolean;
  project_packet: [];
  external_commission_rate: string;
  listing_timezone: string;
  purchase_url: string | null;
  inspection_url: string;
  account_available: boolean;
  has_allocations: boolean;
  sales_agent_access: boolean;
  youtube_url: string;
  start_period: string;
  start_year: string;
  currency: string;
  allocation_url: string;
  name: string;
  is_unit: false;
  property_class: string | null;
  project_start_date: string | null;
  completed_timestamp: string | null;
  fractions_progress_bar: boolean;
  maps_view: boolean;
  constructed_by: string;
  land_title: string;
  description: string;
  address: string;
  city: string | null;
  state: string | null;
  profile: string;
  landmark: string;
  nearby_landmarks: Record<string, { longitude: number | null; latitude: number | null }> | null;
  building_type: string;
  inspection_enabled: boolean;
  income_start_timestamp: null;
  validation_reminders: boolean;
  spatial_metadata: unknown;
  status: string;
  year_built: string | null;
  end_period: string;
  end_year: string;
  inspection_types: ('Virtual' | 'In-Person')[];
  inspection_days: string[];
  inspection_start_time: string | null;
  inspection_end_time: string | null;
  location_description: string | null;
  longitude: number;
  latitude: number;
  created_at: string;
  updated_at: string;
  publish: boolean;
  rejected: boolean;
  request_for_publish: boolean;
  publish_to_store: boolean;
  rejection_reason: string | null;
  photo_urls: string[];
  open_to_subscription: boolean;
  star_rating: number;
  fraction_is_available: boolean;
  open_house_date: string | null;
  is_private: boolean;
  project_archived: boolean;
  total_archive: null;
  internal_commission_rate: string;
  current_fraction_price: string;
  starting_from_price: string;
  starting_from_currency: string;
  business: number;
  reels: string;
};

export type StoreInfoResponse = {
  data: StoreInfo;
  business: string;
};

export type StoreInfo = {
  requested_call: boolean;
  demo_link?: string;
  business_id: string;
  business_name: string;
  store_name: string;
  store_link: string;
  theme_name: string;
  theme_mode: string;
  theme_color: string;
  agent_active: boolean;
  auto_pay_enabled: boolean;
  gateway_disabled: boolean;
  service_down: boolean;
  currency: string;
  country: string;
  offset: string;
  co_ownership_active: boolean;
  company_image?: string;
  dark_logo?: string;
  light_logo?: string;
  favicon_light?: string;
  favicon_dark?: string;
  agent_privacy_policy?: string;
  customer_privacy_policy?: string;
  fractions_enabled: boolean;
  about_us?: string;
  whatsapp_url?: string;
  agent_status: boolean;
  co_ownership: boolean;
  secondary_market: boolean;
  wallet_features: boolean;
  realtor_repoId?: string;
  realtor_projectId?: string;
  realtor_url: string;
  sub_theme: string;
  web_app_template: {
    id: number;
    name: string;
    theme_name: string;
    sub_theme: string;
    thumbnail?: string;
    large_image?: string;
    description?: string;
    vercel_project_id: string;
    dev_branch: string;
    prod_branch: string;
    is_active: boolean;
    is_coming_soon: boolean;
    price: string;
    created_at: string;
    updated_at: string;
  };
  social_links: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  email: string;
  company_address: string;
  smart_plan: boolean;
  agent_document?: string;
  customer_document?: string;
};

export type PaperworkResponse = {
  paperwork: Paperwork;
};

export type Paperwork = {
  summary: string;
  documents: PaperworkDocument[];
};

export type PaperworkDocument = { id: PaperworkDocumentID; label: string; title: string };

export type PaperworkDocumentID = 'rofo' | 'survey' | 'cofo';

export type BaseUser = {
  id: number;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  avatar: string | null;
  phone?: string;
  email?: string;
  role?: string;
};

export type UserDocumentVariant = 'national_id' | 'passport' | 'driver_license' | 'utility_bill' | 'id_document';

export type UserDocument = {
  document_name: string;
  document_type: UserDocumentVariant;
  image?: string;
  document?: string;
  created_at: string;
};

export type User = BaseUser & {
  email: string;
  country: string;
  nationality: string;
  phone: string;
  gender: string;
  alternate_phone: string;
  date_of_birth: string;
  marital_status: string;
  address: string;
  occupation: string;
  company_name: string;
  company_address: string;
  documents: UserDocument[];
};

export type UserUpdateValues = Omit<User, 'id'>;

export type NextOfKinRelationshipType = 'spouse' | 'parent' | 'sibling' | 'child' | 'friend';

export type NextOfKin = BaseUser & {
  relationship: NextOfKinRelationshipType | '';
  phone: string;
  alternate_phone: string;
  email: string;
  address: string;
};

export type NextOfKinUpdateValues = Omit<NextOfKin, 'id'>;

export type Equity = {
  type: 'WHOLE' | 'FRACTIONAL';
  purchase_date: string;
  next_due_date: string;
  next_due_balance: string;
  created_at: string;
  initial_deposit_in_value: string;
  offer_price: number;
  total_unit_price: number;
  price_per_fraction: number | null;
  project: ProjectDetails;
  fractions_amount_paid: number | null;
  amount_paid: number;
  fractions_left: number;
  total_due_balance: number;
  current_outstanding_balance: number;
  custom_payments: ClosingCost[];
  equity_fees: ClosingCost[];
  offer_expires: string;
  unit: ProjectBundle;
  currency: string | null;
  payment_plan: BundlePaymentPlan;
};

export type BankAccount = {
  account_bank_name: string;
  bank_name?: string;
  account_name: string;
  account_number: string;
};
