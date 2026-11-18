'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PhoneField, PillGroup, TextField } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import text from '@/components/ui/text.module.css';
import type { Gender, MaritalStatus, Relationship } from '@/lib/api/types';
import { usePurchase, type DetailsDraft } from '@/lib/purchase';
import { useSession } from '@/lib/session';
import { isEmail, isFilled, isLocalPhone } from '@/lib/validation';
import { IdUpload } from './IdUpload';
import { PassportPhoto } from './PassportPhoto';
import { usePurchaseKicker } from './useBuyGuard';
import {
  NextOfKin,
  User,
  UserDocumentVariant,
  type NextOfKinUpdateValues,
  type ProjectDetails,
  type UserDocument,
  type UserUpdateValues,
} from '@/types';
import countries, { getCountry } from '@/constants/country';
import { useFormik } from 'formik';

import styles from './Details.module.css';
import { DEFAULT_NOK_DATA, DEFAULT_USER_DATA } from '@/constants/fields';
import { formatLocalPhone, getCountryDetailsByName } from '@/lib/format';
import { routes } from '@/lib/routes';
import { useBuyEmail } from './BuyEmailContext';
import { Box, Center, Spinner } from '@chakra-ui/react';

const TABS: readonly string[] = ['Basic info', 'More info', 'Next of kin'];
const NEXT_LABEL: readonly string[] = ['Next: More info', 'Next: Next of kin', 'Continue'];
const GENDERS: readonly Gender[] = ['Male', 'Female'];
const MARITAL: readonly MaritalStatus[] = ['Single', 'Married', 'Other'];
const RELATIONSHIPS: readonly Relationship[] = ['Spouse', 'Parent', 'Sibling', 'Child', 'Friend'];
const NATIONALITIES: readonly string[] = ['Nigerian', 'Ghanaian', 'British', 'American', 'Canadian', 'South African'];
const COUNTRIES = countries.map((country) => country.name);

type Key = `user.${keyof UserUpdateValues}` | `nextOfKin.${keyof NextOfKinUpdateValues}`;

const formatBase64 = (base64: string) => base64?.replace('data:', '')?.replace(/^.+,/, '');

/** Which fields are wrong on a tab. */
function problems(tab: number, d: DetailsDraft, storeData: { user: User; nextOfKin: NextOfKin } | null): Key[] {
  const bad: Key[] = [];
  const { user, nextOfKin } = d;
  if (tab === 0) {
    if (!isFilled(user?.avatar) && !isFilled(storeData?.user?.avatar)) bad.push('user.avatar');
    if (!isFilled(user?.first_name) && !isFilled(storeData.user.first_name)) bad.push('user.first_name');
    if (!isFilled(user?.last_name) && !isFilled(storeData?.user?.last_name)) bad.push('user.last_name');
    if (!isLocalPhone(user?.phone ?? '')) bad.push('user.phone');
  } else if (tab === 1) {
    if (!isFilled(user?.address)) bad.push('user.address');
    if (!user?.documents?.length) bad.push('user.documents');
  } else {
    if (!isFilled(nextOfKin?.first_name)) bad.push('nextOfKin.first_name');
    if (!isFilled(nextOfKin?.last_name)) bad.push('nextOfKin.last_name');
    if (!nextOfKin?.relationship) bad.push('nextOfKin.relationship');
    if (!isLocalPhone(nextOfKin.phone ?? '')) bad.push('nextOfKin.phone');
    if (isFilled(nextOfKin.email) && !isEmail(nextOfKin.email!)) bad.push('nextOfKin.email');
  }
  return bad;
}

const USER_FIELDS_TO_POPULATE = [
  'avatar',
  'phone',
  'alternate_phone',
  'nationality',
  'country',
  'marital_status',
  'address',
  'occupation',
  'company_name',
  'company_address',
  'documents',
];
const NEXT_OF_KIN_FIELDS_TO_POPULATE = ['first_name', 'last_name', 'relationship', 'phone', 'alternate_phone', 'email', 'phone'];

export function DetailsScreen({ listing }: { listing: ProjectDetails }) {
  const slug = listing.id?.toString();
  const kicker = usePurchaseKicker(listing);
  const [isRouting, setIsRouting] = useState(false);

  const isChangingDocument = useRef(false);

  const router = useRouter();
  const purchase = usePurchase();
  const { email } = useBuyEmail();

  const { user, nextOfKin, isLoadingUserDetails, isSigningUp, isRequestingOtp, agent, signUp } = useSession();

  const [idType, setIdType] = useState<UserDocumentVariant>('national_id');

  const selectIdType = (idType: UserDocumentVariant) => {
    formik.setFieldValue(
      'user.documents',
      formik.values.user.documents?.map((doc) => ({ ...doc, document_type: idType })),
    );
  };

  const formik = useFormik<{ user: UserUpdateValues; nextOfKin: NextOfKinUpdateValues }>({
    initialValues: { user: { ...DEFAULT_USER_DATA }, nextOfKin: { ...DEFAULT_NOK_DATA } },
    onSubmit: () => {
      const createEquityOffer = () => {
        purchase
          .createSubscription()
          .then((res) => {
            const equityId = res?.equityId;
            setIsRouting(true);
            router.push(routes.buy.offer(slug, equityId));
          })
          .catch((err) => {
            setError((err as Error)?.message);
          });
      };
      if (user) {
        createEquityOffer();
      } else {
        signUp({
          user: { ...formik.values.user, email, ref_id: agent?.ref_id },
          nextOfKin: formik.values.nextOfKin,
          onError: (msg) => {
            setError(msg);
          },
          onSuccess: () => {
            createEquityOffer();
          },
        });
      }
    },
  });

  const isSubmitting = formik.isSubmitting || purchase.isSubmitting;

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);

  const countryCode = useMemo(() => {
    const storedCountry = getCountry();
    const country = getCountryDetailsByName(formik.values.user.country || storedCountry.name);
    return country?.dialCode ?? '234';
  }, [formik.values.user.country]);

  const setFieldValue = (key: Key) => (value: string | UserDocument[]) => {
    formik.setFieldValue(key, value);
  };

  const [tab, setTab] = useState(0);
  const [bad, setBad] = useState<Key[]>([]);
  const [tries, setTries] = useState(0);
  const [error, setError] = useState('');

  const { saveDraft } = purchase;

  useEffect(() => {
    if (!purchase?.unitId) {
      router.push(routes.listing(slug));
    } else if (!purchase.termsVersion) {
      router.push(routes.buy.terms(slug));
    } else if (!user && !isLoadingUserDetails && !email) router.replace(routes.buy.email(slug));
  }, [isLoadingUserDetails, user, email, purchase]);

  useEffect(() => {
    return () => {
      setIsRouting(false);
    };
  }, []);

  useEffect(() => {
    const documents =
      isChangingDocument.current && formik.values?.user?.documents?.length
        ? formik.values.user.documents?.map((doc) => ({ ...doc, document: formatBase64(doc.document) }))
        : [];
    const valuesToSave = {
      user: {
        ...formik.values.user,
        documents,
      },
      nextOfKin: {
        ...formik.values.nextOfKin,
        phone: `${countryCode}${formik.values.nextOfKin.phone}`,
        alternate_phone: `${countryCode}${formik.values.nextOfKin.alternate_phone}`,
      },
    };
    saveDraft(valuesToSave);
  }, [formik.values, countryCode, saveDraft]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab]);
  useEffect(() => {
    if (tries) document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus({ preventScroll: false });
  }, [tries]);

  useEffect(() => {
    const userToUpdate: Partial<UserUpdateValues> = {};
    const nextOfKinUpdate: Partial<NextOfKinUpdateValues> = {};

    const storedCountry = getCountry();
    const country = getCountryDetailsByName(storedCountry.name);
    const defaultCountryCode = country?.dialCode ?? '234';

    if (user) {
      for (const [key, initialValue] of Object.entries(user)) {
        if (USER_FIELDS_TO_POPULATE.includes(key) && initialValue) {
          const value =
            key.includes('phone') && initialValue
              ? formatLocalPhone(initialValue?.toString()?.replace(new RegExp(`^\\+{0,1}${defaultCountryCode}`, 'ig'), ''))
              : initialValue;
          userToUpdate[key] = value;
        }
      }
    }
    if (nextOfKin) {
      for (const [key, initialValue] of Object.entries(nextOfKin)) {
        if (NEXT_OF_KIN_FIELDS_TO_POPULATE.includes(key) && initialValue) {
          const value =
            key.includes('phone') && initialValue
              ? formatLocalPhone(initialValue?.toString()?.replace(new RegExp(`^\\+{0,1}${defaultCountryCode}`, 'ig'), ''))
              : initialValue;
          nextOfKinUpdate[key] = value;
        }
      }
    }

    formik.setValues((prev) => ({ user: { ...prev.user, ...userToUpdate }, nextOfKin: { ...prev.nextOfKin, ...nextOfKinUpdate } }));
  }, [user, nextOfKin]);

  useEffect(() => {
    const documentType = formik?.values?.user?.documents?.find((doc) => doc?.document_type)?.document_type ?? 'national_id';
    if (documentType !== idType) setIdType(documentType);
  }, [formik?.values?.user?.documents, idType]);

  const invalid = (key: Key) => bad.includes(key);

  /** Check a tab; on failure mark the fields, shake them and focus the first. */
  const passes = (t: number) => {
    const p = problems(t, formik.values, { user, nextOfKin });
    if (p.length) {
      setTab(t);
      setBad(p);
      setTries((n) => n + 1);
      return false;
    }
    return true;
  };

  const next = async () => {
    if (tab < 2) {
      if (passes(tab)) setTab(tab + 1);
      return;
    }
    if (!passes(2) || !passes(0) || !passes(1)) return;
    formik.handleSubmit();
    setError('');
  };

  if (!purchase?.unitId || !purchase.termsVersion || (!user && !isLoadingUserDetails && !email)) {
    return (
      <Center width="100%" height="100dvh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Screen
      label="Your details"
      back={
        tab > 0
          ? () => {
              setTab(tab - 1);
              return { isRerouting: false };
            }
          : () => router.back()
      }
      footer={
        <>
          {error && <p className={text.footerError}>{error}</p>}
          <Button
            loading={isSubmitting || isRouting || isSigningUp || isRequestingOtp}
            disabled={isUploadingAvatar || isUploadingDocs}
            loadingText="Preparing your offer"
            onClick={() => void next()}
          >
            {NEXT_LABEL[tab]}
          </Button>
        </>
      }
    >
      {isRouting && (
        <Box position="absolute" top="0" left="0" width="100%" height="100%" zIndex={9999} background="rgba(255, 255, 255, 0.3)" />
      )}
      <div className={text.kicker}>{kicker}</div>
      <h1 className={text.heading}>Your details</h1>

      <div className={styles.tabs} role="tablist">
        {TABS.map((t, i) => (
          <button key={t} type="button" role="tab" aria-selected={tab === i} onClick={() => setTab(i)}>
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div role="tabpanel" aria-label="Basic info">
          <PassportPhoto
            value={formik.values.user.avatar}
            handleIsUploading={setIsUploadingAvatar}
            onChange={setFieldValue('user.avatar')}
            invalid={invalid('user.avatar')}
          />
          {!user?.first_name && (
            <TextField
              label="First name"
              placeholder="Type your first name"
              autoComplete="given-name"
              value={formik.values.user.first_name}
              onChange={setFieldValue('user.first_name')}
              invalid={invalid('user.first_name')}
              shakeKey={tries}
            />
          )}
          {Boolean(!user?.first_name && !user?.last_name) && (
            <TextField
              label="Middle name"
              placeholder="Optional"
              autoComplete="additional-name"
              value={formik.values.user.middle_name ?? ''}
              onChange={setFieldValue('user.middle_name')}
            />
          )}
          {!user?.last_name && (
            <TextField
              label="Last name"
              placeholder="Type your last name"
              autoComplete="family-name"
              value={formik.values.user.last_name}
              onChange={setFieldValue('user.last_name')}
              invalid={invalid('user.last_name')}
              shakeKey={tries}
            />
          )}
          {!user?.gender && (
            <PillGroup
              label="Gender"
              options={GENDERS}
              value={formik.values.user.gender}
              onChange={(gender) => setFieldValue('user.gender')(gender as string)}
            />
          )}
          <PhoneField
            label="Phone"
            autoComplete="tel-national"
            countryCode={countryCode}
            value={formik.values.user.phone}
            onChange={setFieldValue('user.phone')}
            invalid={invalid('user.phone')}
            shakeKey={tries}
          />
          <PhoneField
            label="Alternative phone number"
            placeholder="Optional"
            countryCode={countryCode}
            value={formik.values.user.alternate_phone}
            onChange={setFieldValue('user.alternate_phone')}
          />
          <TextField
            label="Nationality"
            list="nationalities"
            placeholder="e.g. Nigerian"
            autoComplete="off"
            value={formik.values.user.nationality}
            onChange={setFieldValue('user.nationality')}
          />
          <TextField
            label="Country of residence"
            list="countries"
            placeholder="e.g. Nigeria"
            autoComplete="country-name"
            value={formik.values.user.country}
            onChange={setFieldValue('user.country')}
          />
          <datalist id="nationalities">
            {NATIONALITIES.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
          <datalist id="countries">
            {COUNTRIES.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
          {!user?.date_of_birth && (
            <TextField
              label="Date of birth"
              type="date"
              value={formik.values.user.date_of_birth}
              onChange={setFieldValue('user.date_of_birth')}
            />
          )}
          <PillGroup
            label="Marital status"
            options={MARITAL}
            value={formik.values.user.marital_status}
            onChange={(maritalStatus) => setFieldValue('user.marital_status')(maritalStatus as string)}
          />
        </div>
      )}

      {tab === 1 && (
        <div role="tabpanel" aria-label="More info">
          <TextField
            label="Home address"
            placeholder="Type the address"
            autoComplete="street-address"
            value={formik.values.user.address}
            onChange={setFieldValue('user.address')}
            invalid={invalid('user.address')}
            shakeKey={tries}
          />
          <TextField
            label="What you do"
            placeholder="Your job"
            value={formik.values.user.occupation}
            onChange={setFieldValue('user.occupation')}
          />
          <TextField
            label="Where you work"
            placeholder="Company name"
            value={formik.values.user.company_name}
            onChange={setFieldValue('user.company_name')}
          />
          <TextField
            label="Work address"
            placeholder="Type the address"
            value={formik.values.user.company_address}
            onChange={setFieldValue('user.company_address')}
          />
          <IdUpload
            idType={idType}
            selectIdType={selectIdType}
            handleIsUploading={setIsUploadingDocs}
            documents={formik.values.user.documents}
            onChange={(docs) => {
              isChangingDocument.current = true;
              setFieldValue('user.documents')(docs);
            }}
            shakeKey={tries}
          />
        </div>
      )}

      {tab === 2 && (
        <div role="tabpanel" aria-label="Next of kin">
          <TextField
            label="Their full name"
            placeholder="Type their full name"
            value={`${formik.values.nextOfKin.first_name ?? ''}${formik.values.nextOfKin.last_name ? ` ${formik.values.nextOfKin.last_name}` : ''}`}
            onChange={(fullName) => {
              const [initialFirstName, lastName] = fullName?.split(/\s+/);
              const firstName = /\s/.test(fullName) && !lastName ? `${initialFirstName} ` : initialFirstName;
              setFieldValue('nextOfKin.first_name')(firstName);
              setFieldValue('nextOfKin.last_name')(lastName);
            }}
            invalid={invalid('nextOfKin.first_name')}
            shakeKey={tries}
          />
          <PillGroup
            label="How they are related to you"
            options={RELATIONSHIPS}
            value={formik.values.nextOfKin.relationship}
            onChange={(value) => setFieldValue('nextOfKin.relationship')(value as string)}
            invalid={invalid('nextOfKin.relationship')}
            shakeKey={tries}
          />
          <PhoneField
            countryCode={countryCode}
            label="Their phone"
            value={formik.values.nextOfKin.phone}
            onChange={setFieldValue('nextOfKin.phone')}
            invalid={invalid('nextOfKin.phone')}
            shakeKey={tries}
          />
          <PhoneField
            countryCode={countryCode}
            label="Their alternative phone number"
            placeholder="Optional"
            value={formik.values.nextOfKin.alternate_phone}
            onChange={setFieldValue('nextOfKin.alternate_phone')}
          />
          <TextField
            label="Their email"
            type="email"
            placeholder="Optional"
            value={formik.values.nextOfKin.email ?? ''}
            onChange={setFieldValue('nextOfKin.email')}
            invalid={invalid('nextOfKin.email')}
            shakeKey={tries}
          />
          <TextField
            label="Their address"
            placeholder="Optional"
            value={formik.values.nextOfKin.address}
            onChange={setFieldValue('nextOfKin.address')}
          />
        </div>
      )}
    </Screen>
  );
}
