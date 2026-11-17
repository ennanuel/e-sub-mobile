'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import styles from './PhotoViewer.module.css';
import { Photo } from '@/types';
import {
  Grid,
  GridItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import Image from 'next/image';

interface PhotoViewerProps {
  photos: Photo[];
  listingName: string;
  listingLocation: string;
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}

/** Full-screen photos. Tap the sides or swipe to move, Escape or Close to leave. */
export function PhotoViewer({ photos, listingName, listingLocation, index, onIndex, onClose }: PhotoViewerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const startX = useRef<number | null>(null);
  const photo = photos[index];
  const go = (step: number) => onIndex((index + step + photos.length) % photos.length);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndex((index + 1) % photos.length);
      if (e.key === 'ArrowLeft') onIndex((index - 1 + photos.length) % photos.length);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [index, photos.length, onClose, onIndex]);

  return (
    <div
      className={styles.viewer}
      role="dialog"
      aria-modal="true"
      aria-label="Photos"
      onPointerDown={(e) => (startX.current = e.clientX)}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const d = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(d) > 40) go(d < 0 ? 1 : -1);
      }}
    >
      <div className={styles.top}>
        <span className={styles.count}>
          {index + 1} of {photos.length}
        </span>
        <button ref={closeRef} type="button" className={styles.close} onClick={onClose}>
          Close
        </button>
      </div>
      <button type="button" className={`${styles.side} ${styles.prev}`} aria-label="Previous photo" onClick={() => go(-1)} />
      <button type="button" className={`${styles.side} ${styles.next}`} aria-label="Next photo" onClick={() => go(1)} />
      <div className={styles.image}>
        <img src={photo.photo} alt={'Listing image'} />
      </div>
      <div className={styles.caption}>
        <b>{listingName}</b>
        <span>{listingLocation}</span>
      </div>
    </div>
  );
}

export type PhotoViewerModalRef = {
  open: (index?: number) => void;
};
export const PhotoViewerModal = forwardRef<PhotoViewerModalRef, Omit<PhotoViewerProps, 'index' | 'onIndex' | 'onClose'>>(
  function PhotoViewerModalWRef({ photos, listingName, listingLocation }, photoViewerRef) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [activePhotoIndex, setActivePhotoIndex] = useState(0);

    const handleScroll: React.UIEventHandler<HTMLDivElement> = (event) => {
      const newIndex = Math.round(photos?.length * (event.currentTarget?.scrollLeft / event.currentTarget?.scrollWidth));
      setActivePhotoIndex(newIndex);
    };

    useImperativeHandle(photoViewerRef, () => ({
      open: (index) => {
        onOpen();
        setTimeout(() => {
          const children = containerRef.current?.children;
          const child = children?.[index];
          setActivePhotoIndex(index ?? 0);
          child?.scrollIntoView({ behavior: 'instant' });
        }, 50);
      },
    }));

    return (
      <Modal
        isCentered
        isOpen={isOpen}
        onClose={onClose}
        onCloseComplete={() => {
          containerRef.current?.scrollTo(0, 0);
        }}
        size="full"
      >
        <ModalOverlay bg="#05052a" />
        <ModalContent width="100%" maxWidth="min(440px, 100%)" height="100dvh" rounded="none" p="0" m="0" bg="#05052a" color="#FFFFFF">
          <ModalHeader
            width="100%"
            m="0"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            p="calc(22px + env(safe-area-inset-top, 0px)) 20px"
          >
            <Text as="span" fontFamily="'JetBrains Mono', 'Inter', Arial" fontSize="12px" letterSpacing="0.1em">
              {activePhotoIndex + 1} of {photos.length}
            </Text>
            <button
              type="button"
              onClick={onClose}
              style={{
                height: '40px',
                padding: '0 16px',
                border: '0',
                borderRadius: '99px',
                background: 'rgba(255, 255, 255, 0.14)',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Close
            </button>
          </ModalHeader>
          <ModalBody width="100%" height="100%" display="flex" flexDirection="column" gap="0">
            <Grid
              flex="1"
              width="100%"
              gap="0"
              overflowY="hidden"
              overflowX="auto"
              scrollSnapType="x mandatory"
              gridTemplateColumns={`repeat(${photos?.length ?? 1}, 100%)`}
              ref={containerRef}
              onScroll={handleScroll}
              sx={{
                msOverflowStyle: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
              }}
            >
              {photos?.map((photo, index) => (
                <GridItem key={index} position="relative" scrollSnapAlign="start">
                  <Image src={photo?.photo} alt="Listing Image" fill objectFit="contain" />
                </GridItem>
              ))}
            </Grid>
          </ModalBody>
          <ModalFooter width="100%" p="24px" m="0" display="flex" flexDirection="column" alignItems="flex-start" gap="3px">
            <Text as="b" display="block" fontSize="18px">
              {listingName}
            </Text>
            <Text as="span" display="block" fontSize="14px" color="rgba(255, 255, 255, 0.7)">
              {listingLocation}
            </Text>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  },
);
