'use client';

import { useMemo, useRef, useState } from 'react';
import { Camera, TickCircle } from '@/components/icons';
import { LoadingDots } from '@/components/ui/Button';
import { FieldShell, PillGroup } from '@/components/ui/Field';
import { errorMessage } from '@/lib/api';
import { shrinkImage } from '@/lib/image';
import styles from './Details.module.css';
import { UserDocument, UserDocumentVariant } from '@/types';
import { Box } from '@chakra-ui/react';
import { uploadFiles } from '@/api/store';

type Side = 'front' | 'back';

interface IdUploadProps {
  documents: UserDocument[];
  onChange: (documents: UserDocument[]) => void;
  invalid?: boolean;
  shakeKey?: number;
}

const DOC_TYPES: readonly { label: string; value: UserDocumentVariant }[] = [
  { label: 'NIN', value: 'national_id' },
  { label: 'Internation passport', value: 'passport' },
  { label: "Driver's license", value: 'driver_license' },
  { label: "Voter's card", value: 'id_document' },
];

const formatBase64 = (base64: string) => base64?.replace('data:', '')?.replace(/^.+,/, '');

const IMAGE_FILE_EXTENSIONS_RGX = /.(jpg|jpeg|webp|svg|png)$/i;

const isFileStringBase64 = (fileStr: string | null) => fileStr?.startsWith('data:');

const isFileImage = (file: File) => file.type.includes('image');
const isFileUrlImage = (fileString: string) => IMAGE_FILE_EXTENSIONS_RGX.test(fileString);
const isBase64FileImage = (fileString: string) => fileString?.startsWith('data:image/');

export function IdUpload({ documents, onChange, invalid, shakeKey }: IdUploadProps) {
  const input = useRef<HTMLInputElement>(null);
  const side = useRef<Side>('front');
  const [uploading, setUploading] = useState<Side | null>(null);
  const [error, setError] = useState('');
  const [selectedIdType, setSelectedIdType] = useState<UserDocumentVariant>('national_id');

  const selectIdType = (idType: UserDocumentVariant) => {
    setSelectedIdType(idType);
    onChange(documents.map((doc) => ({ ...doc, document_type: idType })));
  };

  const [front, back] = useMemo(() => documents ?? [], [documents]);

  const frontPreview = front?.image ?? front?.document;
  const backPreview = back?.image ?? back?.document;

  const isFrontFileImage = isFileStringBase64(frontPreview ?? '')
    ? isBase64FileImage(frontPreview ?? '')
    : isFileUrlImage(frontPreview ?? '');
  const isBackFileImage = isFileStringBase64(backPreview ?? '') ? isBase64FileImage(backPreview ?? '') : isFileUrlImage(backPreview ?? '');

  const pick = (s: Side) => {
    side.current = s;
    input.current?.click();
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const s = side.current;
    setUploading(s);
    setError('');
    try {
      const small = isFileImage(file) ? await shrinkImage(file, { maxSide: 900, quality: 0.8 }) : file;
      const uploadedFileRes = await uploadFiles([file]);
      const uploadedFile = uploadedFileRes[0];
      const documentIndex = s == 'back' ? 1 : 0;
      const documentsUpdate = [...documents];
      documentsUpdate[documentIndex] = {
        document: uploadedFile,
        image: URL.createObjectURL(small),
        document_name: file.name,
        document_type: selectedIdType,
        created_at: new Date().toISOString(),
      };

      onChange(documentsUpdate);
    } catch (e) {
      setError(errorMessage(e, 'Could not upload the file. Try again.'));
    } finally {
      setUploading(null);
    }
  };

  return (
    <FieldShell label="Your ID" as="div" invalid={invalid} shakeKey={shakeKey}>
      <div className={`${styles.idRow} ${invalid ? styles.idRowBad : ''}`}>
        {front ? (
          <>
            {isFrontFileImage ? <img className={styles.idThumb} alt="Your ID" src={frontPreview} /> : <Box className={styles.idThumb} />}
            <span className={styles.idDone}>
              <b>
                ID added <TickCircle />
              </b>
              <i>Front</i>
            </span>
            <button type="button" className={styles.redLink} onClick={() => pick('front')}>
              Change
            </button>
          </>
        ) : (
          <>
            <span className={styles.idEmpty}>
              {uploading === 'front' ? (
                <>
                  Uploading
                  <LoadingDots />
                </>
              ) : (
                'Not added yet'
              )}
            </span>
            <button type="button" className={styles.redLink} onClick={() => pick('front')} disabled={!!uploading}>
              <Camera size={17} />
              Add ID
            </button>
          </>
        )}
      </div>

      {/* {!front && (
        <div className={styles.idChips} aria-label="Accepted IDs">
          {
            DOC_TYPES.map(({ label, value }) => (
              <span key={label} style={{cursor: 'pointer'}} onClick={() => {}}>{label}</span>
            ))
          }
        </div>
      )} */}

      <PillGroup
        label="ID Type"
        options={DOC_TYPES}
        value={selectedIdType}
        onChange={(value) => selectIdType(value as UserDocumentVariant)}
      />

      {front && (
        <div className={styles.idBack}>
          {back ? (
            <>
              <span className={styles.idBackDone}>
                {isBackFileImage ? (
                  <img className={styles.idThumbSmall} alt="Back of your ID" src={backPreview} />
                ) : (
                  <Box className={styles.idThumbSmall} />
                )}
                <b>Back added</b>
                <TickCircle />
              </span>
              <button type="button" className={styles.redLink} onClick={() => pick('back')}>
                Change
              </button>
            </>
          ) : uploading === 'back' ? (
            <span className={styles.idEmpty}>
              Uploading
              <LoadingDots />
            </span>
          ) : (
            <button type="button" className={`${styles.redLink} ${styles.small}`} onClick={() => pick('back')}>
              + Add the back, if it has one
            </button>
          )}
        </div>
      )}

      {(invalid || error) && <span className={styles.idNote}>{error || 'Add a photo of your ID.'}</span>}
      <input
        ref={input}
        type="file"
        accept="image/*,application/pdf"
        hidden
        onChange={(e) => void onFile(e.target.files?.[0]).then(() => (e.target.value = ''))}
      />
    </FieldShell>
  );
}
