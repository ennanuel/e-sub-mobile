import { BaseURL_TWO, getStoreName } from '@/constants/routes';
import authAxios from './utils/axios';
import { NextOfKin, NextOfKinUpdateValues, User, UserUpdateValues } from '@/types';
import { AxiosError, isAxiosError } from 'axios';

const formatDobToBackend = (dob: string) => {
  const [year, month, day] = dob?.split(/[^0-9]/ig);
  return `${day}/${month}/${year}`
}

function formatBackendPayload<K>(value: K, field: string):K {
  if (field?.includes('phone') && typeof value === 'string') {
    return value?.replace(/[^0-9]/, '')?.trim() as K
  } if (field === 'date_of_birth' && typeof value === 'string') {
    return formatDobToBackend(value) as K
  } else {
    return value;
  }
}

export const attemptLogin = async (payload: { email: string }): Promise<{ userExists: boolean; errorMessage: string | null }> => {
  let errorMessage: string | null = null;
  let userExists = false;
  try {
    const storeName = getStoreName();
    const response = await authAxios.post(`${BaseURL_TWO}/store/login/?buyback=true`, {
      email: payload.email,
      otp_login: true,
      store_name: storeName,
    });
    userExists = response.data?.action === 'verify_otp';
  } catch (error) {
    if (isAxiosError(error) && (error?.status === 404 || error?.response?.data?.action === 'signup')) {
      userExists = false;
    } else {
      errorMessage =
        (error as AxiosError<{ message: string }>)?.response?.data?.message || 'Something went wrong,we are working to resolve it';
    }
  }

  return { errorMessage, userExists };
};

export const registerUser = async (payload: UserUpdateValues & { ref_id?: string }) => {
  const storeName = getStoreName();
  const body = Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, formatBackendPayload(value, key)]).filter((entry) => !!entry?.[1]?.length));
  const response = await authAxios.post(`${BaseURL_TWO}/store/customers/`, { ...body, store_name: storeName });
  return response.data;
};

export const requestOTPForExistingUser = (email: string) => {
  const storeName = getStoreName();
  return authAxios.post(`${BaseURL_TWO}/store/login/?buyback=true`, { email, otp_login: true, store_name: storeName });
};

export const validateOTPForExistingUser = async (
  email: string,
  otp: string,
): Promise<{ user: User | null; errorMessage: 'invalid' | 'expired' | string | null; authToken: string | null }> => {
  let errorMessage: 'invalid' | 'expired' | string | null = null;
  let user: User | null = null;
  let authToken: string | null = null;

  try {
    const storeName = getStoreName();
    const response = await authAxios.post(`${BaseURL_TWO}/store/verify-magic-token/`, { email: email, otp: otp, store_name: storeName });

    const userData = response?.data?.user?.user;
    const token = response?.data?.user_tokens?.token;

    if (!token || !userData) throw new Error('Something went wrong');

    authToken = token;
    user = userData;
  } catch (error) {
    if (isAxiosError(error)) {
      const message = Array.isArray(error?.response?.data?.message) ? error?.response?.data?.message?.[0] : error?.response?.data?.message;
      const isOTPInvalid = message?.toLowerCase()?.includes('invalid otp');
      const isOTPExpired = message?.toLowerCase()?.includes('expire');

      errorMessage = isOTPInvalid ? 'invalid' : isOTPExpired ? 'expired' : message;
    } else {
      errorMessage = (error as Error)?.message;
    }
  }

  return { user, authToken, errorMessage };
};

export const getUserDetails = async (fields: ('profile' | 'next_of_kin')[] = ['profile', 'next_of_kin']) => {
  const storeName = getStoreName();
  const result = await Promise.all(
    fields.map((field) =>
      authAxios.post(`${BaseURL_TWO}/store/store_settings?store_name=${storeName}`, { [field]: true }).then((res) => {
        const response = res.data?.data;
        return [field, response];
      }),
    ),
  );
  return Object.fromEntries(result) as {
    profile?: User;
    next_of_kin?: NextOfKin;
  };
};

export const updateUserDetails = async (
  fields: (['profile', Partial<UserUpdateValues>] | ['next_of_kin', Partial<NextOfKinUpdateValues>])[] = [
    ['profile', {}],
    ['next_of_kin', {}],
  ],
) => {
  const body = fields
    .filter((fieldPayload) => Object.values(fieldPayload[1]).some(Boolean))
    .map(([field, values]) => ({ [field]: values }));
  const storeName = getStoreName();
  await Promise.all(body.map((payload) => {
    const body = Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, formatBackendPayload(value, key)].filter((entry) => !!entry[1]?.length)));
    return authAxios.patch(`${BaseURL_TWO}/store/store_settings?store_name=${storeName}`, {...body})
  }));
  return;
};
