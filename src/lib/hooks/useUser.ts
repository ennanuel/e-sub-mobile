import { NextOfKin, NextOfKinUpdateValues, User, UserUpdateValues } from '@/types';
import { useEffect, useState } from 'react';
import { deleteCookies, getSession, setSession } from '../sessionmanager';
import { AUTH_SESSION_KEY, getStoredUserDetails, STORE_DATA_KEY, TOKEN_SESSION_KEY } from '@/constants/routes';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  attemptLogin,
  getUserDetails,
  registerUser,
  requestOTPForExistingUser,
  updateUserDetails,
  validateOTPForExistingUser,
} from '@/api/auth';

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

  const { mutate: attemptLoginMutate, isPending: isAttemptingLogin } = useMutation({
    mutationFn: attemptLogin,
  });

  const { mutate: requestOtpMutate, isPending: isRequestingOTP } = useMutation({
    mutationFn: (payload: { email: string }) => requestOTPForExistingUser(payload.email),
  });

  const { mutate: validateOTPMutate, isPending: isValidatingOTP } = useMutation({
    mutationFn: (payload: { email: string; otp: string }) => validateOTPForExistingUser(payload.email, payload.otp),
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
          const {first_name, last_name, middle_name, email} = payload.user;
          await registerUser({first_name, last_name, middle_name, email} as UserUpdateValues);
          const onEmailCheckSuccess = () => {
            payload.onSuccess();
            resolve();
          };
          const errorHandler = (msg: string) => {
            payload?.onError(msg);
            reject(new Error(msg));
          };
          checkEmailStatus({ email: payload.user.email, onChecked: onEmailCheckSuccess, onError: errorHandler });
        } catch (error) {
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

  const checkEmailStatus = (payload: {
    email: string;
    onChecked: (res: { userExists: boolean }) => void;
    onError: (errorMsg: string) => void;
  }) => {
    attemptLoginMutate(
      { email: payload.email },
      {
        onSettled: (res) => {
          if (res?.errorMessage) payload.onError(res?.errorMessage);
          if (typeof res?.userExists === 'boolean') payload.onChecked({ userExists: !!res?.userExists });
        },
      },
    );
  };

  const validateOTP = (payload: { email: string; otp: string; onSuccess: () => void; onError: (errorMsg: string) => void }) => {
    validateOTPMutate(payload, {
      onSettled: async (res) => {
        if (res?.user && res?.authToken) {
          setUser(res?.user);
          setAuthToken(res?.authToken);

          localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ profile: res?.user, next_of_kin: {} }));

          const expires = new Date();
          expires.setDate(expires.getDate() + 7);
          await setSession(res?.authToken, TOKEN_SESSION_KEY, expires);

          payload.onSuccess();
        }
        if (res?.errorMessage) payload.onError(res?.errorMessage);
        if (res?.authToken) setAuthToken(res?.authToken);
      },
    });
  };

  const { isLoading: isLoadingUserDetails, refetch } = useQuery({
    queryKey: ['user_details'],
    enabled: !!authToken,
    queryFn: async () => {
      const { profile: initialProfile, next_of_kin } = await getUserDetails();
      const profile = initialProfile ? {...initialProfile, id: (initialProfile as unknown as {user: User})?.user?.id}  : initialProfile
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
