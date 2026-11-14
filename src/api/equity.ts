import { BaseURL_TWO, getESubDomain, STORE_DATA_KEY } from '@/constants/routes';
import authAxios from './utils/axios';
import { BankAccount, Equity } from '@/types';

export const getESubDetails = async () => {
  const response = await authAxios.get(`${BaseURL_TWO}/billing/esub/domain/${encodeURIComponent(getESubDomain())}/`);
  const result = response.data;

  const storeDetail = { ...result.business, ...result.store };

  if (result?.store && typeof window !== 'undefined') {
    localStorage.setItem(STORE_DATA_KEY, JSON.stringify(storeDetail));
  }

  return result;
};

type EquityPaymentBody = {
  amount_to_pay: number;
  bundle_id: number;
  business_id: string;
  from_store: boolean;
  payment_option: 'virtual_bank';
  paymentplan_id?: number;
  redirect_url: string;
  store_name: string;
  type: 'WHOLE' | 'FRACTIONAL';
};

export async function makeEquityPayment(body: EquityPaymentBody) {
  return await authAxios.post(`${BaseURL_TWO}/investment/equity/?e_sub=true`, body);
}

export const getEquityDetails = async (equityId: string, userId: string): Promise<Equity> => {
  const response = await authAxios.get(`${BaseURL_TWO}/investment/portfolio/?equity_id=${equityId}${userId ? `&user_id=${userId}` : ''}`);
  return response.data?.data?.equity;
};

export const getEquityBankAccounts = async (
  equityId: string,
  params: { is_fractional?: boolean; email: string; user_id: string },
): Promise<BankAccount[]> => {
  const query: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (!value) query[key] = String(value);
  }

  const queryParam = new URLSearchParams(query).toString();

  const response = await authAxios.get(`${BaseURL_TWO}/investment/equity/${equityId}/bank-accounts/${queryParam ? `?${queryParam}` : ''}`);
  return response.data;
};

type BankPaymentParams = {
  equity_id: string;
  account_number?: string;
  bank_name?: string;
  feedback_message?: string;
  receipt_urls: string[];
};

export const makeBankPayment = async (equityId: string, body: BankPaymentParams) => {
  return authAxios.post(`${BaseURL_TWO}/investment/equity/${equityId}/bank-transfer/`, body);
};
