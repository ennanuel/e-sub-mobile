import { NextOfKin, NextOfKinUpdateValues, User, UserUpdateValues } from '@/types';
import { useEffect, useState } from 'react';
import { deleteCookies, getSession, setSession } from '../sessionmanager';
import { AUTH_SESSION_KEY, getStoredUserDetails, STORE_DATA_KEY, TOKEN_SESSION_KEY } from '@/constants/routes';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getUserDetails, loginWithOTP, registerUser, requestOTPForEmailVerification, updateUserDetails } from '@/api/auth';
import { AxiosError } from 'axios';

export default function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [nextOfKin, setNextOfKin] = useState<NextOfKin | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [hasCheckedAuthentication, setHasCheckedAuthentication] = useState(false);

  const logout = () => {
    deleteCookies([TOKEN_SESSION_KEY]);
    localStorage.removeItem(STORE_DATA_KEY);
    localStorage.removeItem(AUTH_SESSION_KEY);
    setUser(null);
    setNextOfKin(null);
    setAuthToken(null);
    location.reload();
  };

  const { mutate: checkEmailMutate, isPending: isAttemptingLogin } = useMutation({
    mutationFn: requestOTPForEmailVerification,
  });

  const { mutate: requestOtpMutate, isPending: isRequestingOTP } = useMutation({
    mutationFn: (payload: { email: string }) => requestOTPForEmailVerification({ email: payload.email, verify: true }),
  });

  const { mutate: validateOTPMutate, isPending: isValidatingOTP } = useMutation({
    mutationFn: (payload: { email: string; otp: string }) => loginWithOTP({ email: payload.email, code: payload.otp }),
  });

  const { mutate: signUpMutate, isPending: isSigningUp } = useMutation({
    mutationFn: (payload: {
      user: UserUpdateValues & { ref_id?: string };
      nextOfKin?: NextOfKinUpdateValues | null;
      onSuccess: () => void;
      onError: (errorMsg: string) => void;
    }) =>
      new Promise<void>(async (resolve, reject) => {
        try {
          const { first_name, last_name, middle_name, email } = payload.user;
          const registerResponse = await registerUser({ first_name, last_name, middle_name, email } as UserUpdateValues);

          const userToken = registerResponse?.token;
          setAuthToken(userToken);

          const expires = new Date();
          expires.setDate(expires.getDate() + 7);
          await setSession(userToken, TOKEN_SESSION_KEY, expires);

          resolve();
          payload.onSuccess();
        } catch (error) {
          payload?.onError((error as Error)?.message);
          reject(error);
        }
      }),
  });

  const { isPending: isUpdatingUserDetail, mutate: updateUserDetail } = useMutation({
    mutationFn: updateUserDetails,
    onSuccess: () => {
      refetch();
    },
  });

  const checkEmailStatus = (payload: { email: string; onSuccess: () => void; onError: (errorMsg: string) => void }) => {
    checkEmailMutate(
      { email: payload.email?.trim(), verify: true },
      { onSuccess: payload.onSuccess, onError: (error: Error) => [payload.onError(error?.message)] },
    );
  };

  const validateOTP = (payload: {
    email: string;
    otp: string;
    onSuccess: () => void;
    onError: (msg: string) => void;
    onSignUp: () => void;
  }) => {
    validateOTPMutate(payload, {
      onSuccess: async (res) => {
        const loginToken = res?.data?.token;
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);

        if (loginToken) {
          setAuthToken(loginToken);
          await setSession(loginToken, TOKEN_SESSION_KEY, expires);
          await refetch();
          payload.onSuccess();
        } else payload.onError('Something went wrong');
      },
      onError: (error: AxiosError<{ message: string; status: boolean }>) => {
        if (error?.response?.status == 404) {
          payload.onSignUp();
        } else {
          const errorMessage = error?.response?.data?.message ?? error?.message;
          const isOTPInvalid = errorMessage?.toLowerCase()?.includes('invalid otp');
          const isOTPExpired = errorMessage?.toLowerCase()?.includes('expire');

          const message = isOTPInvalid ? 'OTP is invalid' : isOTPExpired ? 'OTP has expired' : errorMessage;

          payload.onError(message);
        }
      },
    });
  };

  const { isLoading: isLoadingUserDetails, refetch } = useQuery({
    queryKey: ['user_details'],
    enabled: !!authToken,
    queryFn: async () => {
      const { profile: initialProfile, next_of_kin } = await getUserDetails();
      const profile = initialProfile ? { ...initialProfile, id: (initialProfile as unknown as { user: User })?.user?.id } : initialProfile;
      setUser(profile ?? null);
      setNextOfKin(next_of_kin ?? null);

      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ profile, next_of_kin }));

      return { profile, next_of_kin };
    },
  });

  useEffect(() => {
    getSession<string>(TOKEN_SESSION_KEY).then((data) => {
      setAuthToken(data);
      const { profile, next_of_kin } = getStoredUserDetails() ?? {};
      setUser(profile ?? null);
      setNextOfKin(next_of_kin ?? null);

      if (!hasCheckedAuthentication) {
        setHasCheckedAuthentication(true);
      }
    });
  }, []);

  return {
    user,
    nextOfKin,
    token: authToken,
    logout,
    checkEmailStatus,
    isLoggingIn: isAttemptingLogin,
    requestOtp: requestOtpMutate,
    validateOtp: validateOTP,
    isRequestingOtp: isRequestingOTP,
    isValidatingOtp: isValidatingOTP,
    signUp: signUpMutate,
    isSigningUp,
    updateUserDetail,
    isUpdatingUserDetail,
    isLoadingUserDetails,
    refetch,
  };
}
