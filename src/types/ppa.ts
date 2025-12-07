/**
 * PPA (Power Purchase Agreement) Types
 */

export interface PPAData {
  agreementDate: string;
  consumerId: string;
  prosumerName: string;
  fatherName: string;
  village: string;
  district: string;
  state: string;
  pinCode: string;
  plantCapacity: string;
}

export const defaultPPAData: PPAData = {
  agreementDate: new Date().toISOString().split('T')[0],
  consumerId: '',
  prosumerName: '',
  fatherName: '',
  village: '',
  district: '',
  state: 'CHHATTISGARH',
  pinCode: '',
  plantCapacity: '',
};
