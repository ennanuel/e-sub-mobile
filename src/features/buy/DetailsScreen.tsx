'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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
import { useBuyGuard, usePurchaseKicker } from './useBuyGuard';
import { type NextOfKinUpdateValues, type ProjectDetails, type UserDocument, type UserUpdateValues } from '@/types';
import countries, { getCountry, getCountryByName } from '@/constants/country';
import { useFormik } from 'formik';

import styles from './Details.module.css';
import { DEFAULT_NOK_DATA, DEFAULT_USER_DATA } from '@/constants/fields';
import { Grid } from '@chakra-ui/react';
import { getCountryDetailsByName } from '@/lib/format';

const TABS: readonly string[] = ['Basic info', 'More info', 'Next of kin'];
const NEXT_LABEL: readonly string[] = ['Next: More info', 'Next: Next of kin', 'Continue'];
const GENDERS: readonly Gender[] = ['Male', 'Female'];
const MARITAL: readonly MaritalStatus[] = ['Single', 'Married', 'Other'];
const RELATIONSHIPS: readonly Relationship[] = ['Spouse', 'Parent', 'Sibling', 'Child', 'Friend'];
const NATIONALITIES: readonly string[] = ['Nigerian', 'Ghanaian', 'British', 'American', 'Canadian', 'South African'];
const COUNTRIES = countries.map((country) => country.name);

type Key = `user.${keyof UserUpdateValues}` | `nextOfKin.${keyof NextOfKinUpdateValues}`;

/** Which fields are wrong on a tab. */
function problems(tab: number, d: DetailsDraft): Key[] {
  const bad: Key[] = [];
  const { user, nextOfKin } = d;
  if (tab === 0) {
    if (!isFilled(user?.first_name)) bad.push('user.first_name');
    if (!isFilled(user?.last_name)) bad.push('user.last_name');
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

export function DetailsScreen({ listing }: { listing: ProjectDetails }) {
  const slug = listing.id?.toString();
  const ready = useBuyGuard(slug, { terms: true, session: true });

  const kicker = usePurchaseKicker(listing);

  const router = useRouter();
  const purchase = usePurchase();

  const { user, nextOfKin } = useSession();

  const formik = useFormik<{ user: UserUpdateValues; nextOfKin: NextOfKinUpdateValues }>({
    initialValues: { user: { ...DEFAULT_USER_DATA }, nextOfKin: { ...DEFAULT_NOK_DATA } },
    onSubmit: () => {
      purchase.createSubscription();
    },
  });

  const isSubmitting = formik.isSubmitting || purchase.isSubmitting;

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const countryCode = useMemo(() => {
    const storedCountry = getCountry();
    const country = getCountryDetailsByName(formik.values.user.country || storedCountry.name);
    return `+${country?.dialCode ?? '234'}`;
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
    saveDraft(formik.values);
  }, [formik.values, saveDraft]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab]);
  // After a failed try, put the cursor in the first field that needs fixing.
  useEffect(() => {
    if (tries) document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus({ preventScroll: false });
  }, [tries]);

  useEffect(() => {
    if (!Object.values(formik.values.user).some(Boolean) && user) {
      formik.setValues((prev) => ({ ...prev, user: { ...prev.user, ...user }, nextOfKing: { ...prev.nextOfKin, ...nextOfKin } }));
    }
  }, [user, nextOfKin, formik]);

  if (!ready || !user) return null;

  const invalid = (key: Key) => bad.includes(key);

  /** Check a tab; on failure mark the fields, shake them and focus the first. */
  const passes = (t: number) => {
    const p = problems(t, formik.values);
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

  return (
    <Screen
      label="Your details"
      back={tab > 0 ? () => setTab(tab - 1) : () => router.back()}
      footer={
        <>
          {error && <p className={text.footerError}>{error}</p>}
          <Button loading={isSubmitting} disabled={isUploadingAvatar} loadingText="Preparing your offer" onClick={() => void next()}>
            {NEXT_LABEL[tab]}
          </Button>
        </>
      }
    >
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
          />
          <TextField
            label="First name"
            placeholder="Type your first name"
            autoComplete="given-name"
            value={formik.values.user.first_name}
            onChange={setFieldValue('user.first_name')}
            invalid={invalid('user.first_name')}
            shakeKey={tries}
          />
          <TextField
            label="Middle name"
            placeholder="Optional"
            autoComplete="additional-name"
            value={formik.values.user.middle_name ?? ''}
            onChange={setFieldValue('user.middle_name')}
          />
          <TextField
            label="Last name"
            placeholder="Type your last name"
            autoComplete="family-name"
            value={formik.values.user.last_name}
            onChange={setFieldValue('user.last_name')}
            invalid={invalid('user.last_name')}
            shakeKey={tries}
          />
          <PillGroup
            label="Gender"
            options={GENDERS}
            value={formik.values.user.gender}
            onChange={(gender) => setFieldValue('user.gender')(gender as string)}
          />
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
            value={formik.values.user.nationality}
            onChange={setFieldValue('user.nationality')}
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
          <TextField
            label="Date of birth"
            type="date"
            value={formik.values.user.date_of_birth}
            onChange={setFieldValue('user.date_of_birth')}
          />
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
          <IdUpload documents={formik.values.user.documents} onChange={setFieldValue('user.documents')} shakeKey={tries} />
        </div>
      )}

      {tab === 2 && (
        <div role="tabpanel" aria-label="Next of kin">
          <Grid gridTemplateColumns="1fr 1fr" width="100%" gap="20px">
            <TextField
              label="Their first name"
              placeholder="John"
              value={formik.values.nextOfKin.first_name}
              onChange={setFieldValue('nextOfKin.first_name')}
              invalid={invalid('nextOfKin.first_name')}
              shakeKey={tries}
            />

            <TextField
              label="Their last name"
              placeholder="Doe"
              value={formik.values.nextOfKin.last_name}
              onChange={setFieldValue('nextOfKin.last_name')}
              invalid={invalid('nextOfKin.last_name')}
              shakeKey={tries}
            />
          </Grid>
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
