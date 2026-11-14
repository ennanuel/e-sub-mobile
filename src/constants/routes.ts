import { NextOfKin, StoreInfo, User } from '@/types';

const ENV_PREFIX =
  process.env.NEXT_PUBLIC_SERVER_ENV === 'development'
    ? 'dev'
    : process.env.NEXT_PUBLIC_SERVER_ENV === 'staging'
      ? 'staging'
      : process.env.NEXT_PUBLIC_SERVER_ENV === 'production'
        ? 'api'
        : 'dev';

// export const LOCAL_ESUB_DOMAIN = 'matador-dev.6787878.com';
export const LOCAL_ESUB_DOMAIN = 'manchester-2878-dev.6787878.com';

export const BaseURL = `https://${ENV_PREFIX}.matadortrust.com`;
export const BaseURL_ONE = `${BaseURL}/v1`;
export const BaseURL_TWO = `${BaseURL}/v2`;

export const AUTH_SESSION_KEY = 'auth_key_e_sub';
export const TOKEN_SESSION_KEY = 'token_key_e_sub';
/** Cookie key for ref_id/agent from URL; cleared with auth. */
export const REF_AGENT_COOKIE_KEY = 'e_sub_ref_agent';

export const STORE_DATA_KEY = 'e_sub_store_data';
export const STORE_BRAND_COOKIE = 'e_sub_store_brand';

export const isUsingDynamicStoreName = () => process.env.NEXT_PUBLIC_IS_USING_URL_FOR_DOMAIN === 'true';

export const getESubDomain = () =>
  isUsingDynamicStoreName() && typeof window !== 'undefined' ? window.location.origin : LOCAL_ESUB_DOMAIN;

export const getStoreName = () => {
  const eSubDomain = getStoreInfo()?.store_name ?? getESubDomain();
  return eSubDomain.split('.')[0];
};

export const getStoreInfo = (): StoreInfo | null => {
  try {
    const storedData = localStorage.getItem(STORE_DATA_KEY);
    return storedData ? JSON.parse(storedData) : null;
  } catch {
    return null;
  }
};

export const getBusinessId = () => {
  const storeInfo = getStoreInfo();
  return storeInfo?.business_id;
};

export const getStoreCurrency = () => {
  const storeInfo = getStoreInfo();
  return storeInfo?.currency || 'NGN';
};

export const getStoreCountry = () => {
  const storeInfo = getStoreInfo();
  return storeInfo?.country || 'Nigeria';
};

export const getStoredUserDetails = (): { profile: User | null; next_of_kin: NextOfKin | null } | null => {
  try {
    const storedData = localStorage.getItem(AUTH_SESSION_KEY);
    return storedData ? JSON.parse(storedData) : null;
  } catch {
    return null;
  }
};
