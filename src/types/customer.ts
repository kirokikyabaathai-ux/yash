/**
 * Customer Profile Types
 */

export type Gender = 'male' | 'female' | 'other';

export interface CustomerProfile {
  id: string;
  user_id: string | null;
  lead_id: string | null;
  
  // Personal Information
  name: string;
  gender: Gender | null;
  
  // Address Information
  address_line_1: string;
  address_line_2: string | null;
  pin_code: string;
  state: string;
  district: string;
  
  // Bank Account Details
  account_holder_name: string;
  bank_account_number: string;
  bank_name: string;
  ifsc_code: string;
  
  // Document References
  aadhaar_front_path: string | null;
  aadhaar_back_path: string | null;
  electricity_bill_path: string | null;
  bank_passbook_path: string | null;
  cancelled_cheque_path: string | null;
  pan_card_path: string | null;
  itr_documents_path: string | null;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerProfileRequest {
  user_id?: string;
  lead_id?: string;
  name: string;
  gender?: Gender;
  address_line_1: string;
  address_line_2?: string;
  pin_code: string;
  state: string;
  district: string;
  account_holder_name: string;
  bank_account_number: string;
  bank_name: string;
  ifsc_code: string;
}

export interface CustomerProfileFormData extends CreateCustomerProfileRequest {
  // Document files (to be uploaded)
  aadhaar_front?: File;
  aadhaar_back?: File;
  electricity_bill?: File;
  bank_passbook?: File;
  cancelled_cheque?: File;
  pan_card?: File;
  itr_documents?: File;
}
