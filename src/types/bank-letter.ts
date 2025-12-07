/**
 * Bank Letter Types
 */

export interface BankLetterData {
  date: string;
  bankName: string;
  bankAddress: string;
  applicantName: string;
  solarCapacity: string;
  bpNumber: string;
  applicantAddress: string;
  district: string;
  stateAndPin: string;
  mobileNumber: string;
}

export const defaultBankLetterData: BankLetterData = {
  date: new Date().toLocaleDateString('en-GB'),
  bankName: '',
  bankAddress: '',
  applicantName: '',
  solarCapacity: '',
  bpNumber: '',
  applicantAddress: '',
  district: '',
  stateAndPin: '',
  mobileNumber: '',
};
