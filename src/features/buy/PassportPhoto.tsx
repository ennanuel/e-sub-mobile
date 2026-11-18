'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera } from '@/components/icons';
import { LoadingDots } from '@/components/ui/Button';
import { errorMessage } from '@/lib/api';
import { shrinkImage } from '@/lib/image';
import styles from './Details.module.css';
import { uploadFiles } from '@/api/store';

interface PassportPhotoProps {
  value: string | null;
  handleIsUploading: (isUploading: boolean) => void;
  onChange: (value: string) => void;
  invalid: boolean;
}

/** Round passport photo with a camera badge. Picking a photo shrinks it to 360px square and uploads it. */
export function PassportPhoto({ value, invalid, onChange, handleIsUploading }: PassportPhotoProps) {
  const input = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const pick = () => input.current?.click();

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setIsUploading(true);
    setError('');
    try {
      const small = await shrinkImage(file, { maxSide: 360, square: true });
      const result = await uploadFiles([small]);
      const avatarUrl = result[0];
      onChange(avatarUrl);
    } catch (e) {
      setError(errorMessage(e, 'Could not upload the photo. Try again.'));
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    handleIsUploading(isUploading);
  }, [isUploading]);

  return (
    <div className={styles.passport}>
      <button
        type="button"
        className={styles.passportCircle}
        aria-label={value ? 'Change your passport photograph' : 'Add your passport photograph'}
        onClick={pick}
        disabled={isUploading}
      >
        <span className={styles.passportImage}>
          {value ? (
            <img src={value} alt="Your passport photograph" />
          ) : (
            <svg width="84" height="84" viewBox="0 0 70 70" aria-hidden="true">
              <rect width="70" height="70" fill={invalid ? '#F8EEEE' : '#EEF0F8'} />
              <circle cx="35" cy="28" r="12.5" fill={invalid ? 'rgba(59, 11, 11, .22)' : 'rgba(11,11,59,.22)'} />
              <path d="M10 70c2-15 12-23 25-23s23 8 25 23z" fill={invalid ? 'rgba(59, 11, 11, .22)' : 'rgba(11,11,59,.22)'} />
            </svg>
          )}
        </span>
        <span className={styles.passportBadge}>
          <Camera size={15} />
        </span>
      </button>
      <span className={styles.passportText}>
        <b>Passport photograph</b>
        {isUploading ? (
          <span>
            Uploading
            <LoadingDots />
          </span>
        ) : error ? (
          <span className={styles.bad}>{error}</span>
        ) : value ? (
          <span className={styles.ok}>Added</span>
        ) : (
          <span>A clear, recent photo of your face on a plain background</span>
        )}
        <button type="button" className={styles.redLink} onClick={pick} disabled={isUploading}>
          {value ? 'Change photo' : 'Add photo'}
        </button>
      </span>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => void onFile(e.target.files?.[0]).then(() => (e.target.value = ''))}
      />
    </div>
  );
}
