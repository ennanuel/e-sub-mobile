import { NextOfKinUpdateValues, UserUpdateValues } from '@/types';

export const DEFAULT_USER_DATA: UserUpdateValues = {
  avatar: '',
  first_name: '',
  last_name: '',
  middle_name: '',
  alternate_phone: '',
  date_of_birth: '',
  marital_status: '',
  occupation: '',
  company_name: '',
  company_address: '',
  email: '',
  phone: '',
  address: '',
  country: '',
  nationality: '',
  gender: '',
  documents: [],
};

export const DEFAULT_NOK_DATA: NextOfKinUpdateValues = {
  avatar: '',
  first_name: '',
  last_name: '',
  middle_name: '',
  phone: '',
  alternate_phone: '',
  email: '',
  relationship: '',
  address: '',
};
