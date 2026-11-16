'use client';

import Link from 'next/link';
import { forwardRef, useEffect, useMemo, useRef, useState, type Ref } from 'react';
import { RoadScene } from '@/components/art/RoadScene';
import { BrandName } from '@/components/BrandName';
import { ChevronLeft, ChevronRight, Phone, Share } from '@/components/icons';
import { IconButton } from '@/components/ui/IconButton';
import { useShareLink } from '@/components/ui/useShareLink';
import type { Faq } from '@/lib/api/types';
import { currencyShort } from '@/lib/format';
import { routes } from '@/lib/routes';
import type { SkyLook } from '@/lib/sky';
import { FaqSection } from '../faq/FaqSection';
import { PhotoViewer } from './PhotoViewer';
import styles from './Listing.module.css';
import { BaseUser, ProjectDetails } from '@/types';
import { Avatar, Box, List, ListItem, Spinner, Stack } from '@chakra-ui/react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getProjectDetails, loadListingPaperwork, loadProjectUnits } from '@/lib/load';
import { NavProgress } from '@/components/ui/Screen';
import { getAmenityIcon } from '@/lib/amenity';

interface ListingProps {
  detail: ProjectDetails;
  isLoadingAgentDetails: boolean;
  agentDetails: BaseUser | null;
  faq: Faq;
  sky: SkyLook;
  morphing: boolean;
  onBack: () => void;
  sheetRef: Ref<HTMLDivElement>;
}

/** Page 2: the development. The white sheet scrolls up over the road scene. */
export const Listing = forwardRef<HTMLDivElement, ListingProps>(function Listing({ detail, isLoadingAgentDetails, agentDetails, faq, sky, morphing, onBack, sheetRef }, ref) {
  const unitsContainerRef = useRef<HTMLDivElement>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const [photo, setPhoto] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { share, toast } = useShareLink();

  const startNavigation = () => {
    setIsNavigating(true);
  }

  useQuery({
    queryKey: ['listingdetail'],
    queryFn:async () => {
      try {
        const res = await getProjectDetails(detail?.id?.toString());
        console.warn(res);
        return res;
      } catch (error) {
        console.log('error', error)
      }
    }
  })

  const { isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, data } = useInfiniteQuery({
    initialPageParam: 1,
    enabled: !!detail?.id?.toString(),
    queryKey: [detail?.id, 'project_info'],
    queryFn: ({ pageParam }: { pageParam?: number }) => loadProjectUnits(detail?.id?.toString(), { page: pageParam }),
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage?.next?.match(/page=\d+/)?.[0]?.replace('page=', '');
      const nextPageNumber = Number(nextPage);
      return isNaN(nextPageNumber) ? undefined : nextPageNumber;
    },
  });

  const { data: paperworkData } = useQuery({
    queryKey: [detail?.id, 'paperwork'],
    queryFn: () => loadListingPaperwork(detail?.id?.toString() ?? ''),
  });

  const paperwork = paperworkData?.paperwork;
  const units = useMemo(() => data?.pages?.flatMap((page) => page?.results ?? []), [data]);

  useEffect(() => {
    if (morphing) return;
    const onScroll = () => {
      setScrolled(window.scrollY > 440);

      if (!unitsContainerRef.current) return;

      const parentRect = document.documentElement.getBoundingClientRect();
      const childRect = unitsContainerRef.current?.getBoundingClientRect();

      // True when the bottom of the child is visible or scrolled past
      const hasScrolledPastBottom = (childRect?.bottom ?? 0) <= parentRect.bottom;

      if (hasScrolledPastBottom && !isFetchingNextPage && hasNextPage) fetchNextPage();
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [morphing, isFetchingNextPage, hasNextPage, fetchNextPage]);

  const photos = detail?.photo_urls?.map((photo) => ({ photo })) ?? [];
  const extraPhotos = (photos?.length ?? 0) - 3;

  useEffect(() => {return () => {
    setIsNavigating(false)
  }}, [])

  return (
    <div ref={ref} className={`${styles.listing} ${morphing ? styles.morphing : ''}`} aria-hidden={morphing || undefined}>
      <div className={`${styles.topBar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.topButtons}>
          <IconButton label="Back" look="raised" onClick={onBack}>
            <ChevronLeft size={19} />
          </IconButton>
          <IconButton label="Share" look="raised" onClick={() => void share(detail.name)}>
            <Share size={19} />
          </IconButton>
        </div>
        <NavProgress isShowing={isNavigating} />
      </div>

      <div className={styles.scene}>
        <RoadScene sky={sky} variant="listing" />
      </div>

      <div ref={sheetRef} className={styles.sheet}>
        {isNavigating && <Box position="absolute" top="0" left="0" width="100%" height="100%" zIndex={9999} bg='rgba(255, 255, 255, 0.3)' />}
        <span className={styles.grab} />
        <div className={`label ${styles.muted}`}>
          {detail?.constructed_by}
          {detail?.constructed_by && detail?.address ? ' · ' : ''}
          {detail.address}
        </div>
        <h1 className={styles.name}>
          <BrandName name={detail.name} />
        </h1>

        {detail?.starting_from && <div className={styles.price}>
          <div className={`label ${styles.muted}`}>Starting from</div>
          <div className={styles.priceValue}>{currencyShort(detail?.starting_from, detail?.starting_from_currency ?? detail?.currency)}</div>
        </div>}

        {Boolean(!isLoadingAgentDetails && agentDetails) && (
          <List width="100%">
              <ListItem width="100%">
                <div className={styles.realtor}>
                  <Avatar src={agentDetails?.avatar} name={agentDetails?.first_name ?? agentDetails?.last_name} size="sm" boxSize="44px" minWidth='44px' />
                  <div className={styles.realtorText}>
                    <b>{`${agentDetails?.first_name ?? ''} ${agentDetails?.last_name ?? ''}`.trim()}</b>
                    <span>{`Realtor · shared this with you`}</span>
                  </div>
                  <a className={styles.call} href={agentDetails?.phone ? `tel:${agentDetails?.phone}` : `mailto:${agentDetails?.email}`} aria-label={`${agentDetails?.phone ? 'Call'  :'Send an email to'} ${agentDetails?.first_name}`}>
                    <Phone size={18} />
                  </a>
                </div>
              </ListItem>
          </List>
        )}

        <p className={styles.description}>{detail.description}</p>

        <h2 className={`label ${styles.sectionLabel}`}>Amenities</h2>
        <ul className={styles.amenities}>
          {detail.amenities.map((a, i) => (
            <li key={a.label}>
              <span className={styles.amenityNo}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.amenityLabel}>{a.name}</span>
              <span className={styles.amenityIcon}>
                <img
                  src={getAmenityIcon(a.name)}
                  width={20}
                  height={20}
                  alt=""
                  style={{ filter: 'gray-scale(100%) sepia(100%) hue-rotate(190deg) saturate(300%)' }}
                />
              </span>
            </li>
          ))}
        </ul>

        {!!photos?.length && (
          <>
            <h2 className={`label ${styles.sectionLabel}`}>Photos</h2>
            <div className={styles.photos}>
              {photos.slice(0, 3).map((p, i) => (
                <button
                  key={i}
                  type="button"
                  className={styles.photo}
                  onClick={() => setPhoto(i)}
                  aria-label={`Open photo ${i + 1} of ${photos?.length ?? 0}: ${detail?.name}`}
                >
                  <img src={p.photo} alt="" />
                  {i === 2 && extraPhotos > 0 && <span className={styles.more}>+{extraPhotos}</span>}
                </button>
              ))}
            </div>
          </>
        )}

        <h2 className={`label ${styles.sectionLabel}`}>Paperwork</h2>
        <Link className={styles.paperwork} href={routes.papers(detail?.id?.toString())} onClick={startNavigation}>
          <span className={styles.paperworkCount}>{String(paperwork?.documents?.length).padStart(2, '0')}</span>
          <span className={styles.paperworkText}>
            <b>Documents to read</b>
            <span>{paperwork?.summary}</span>
          </span>
          <ChevronRight size={20} />
        </Link>

        {units?.length || isLoading ? (
          <Box width="100%" ref={unitsContainerRef}>
            <h2 className={`label ${styles.sectionLabel}`}>Available units</h2>
            <Stack gap="24px">
              <List className={styles.units}>
                {units?.map((unit) => (
                  <ListItem key={unit.id}>
                    <Link
                      className={styles.unit}
                      onClick={startNavigation}
                      href={routes.plot(detail?.id?.toString(), unit.id?.toString())}
                      aria-label={`${unit.unit_size}${!/[a-z]/i.test(unit.unit_size) ? ' sqm' : ''} ${unit?.unit_title.toLowerCase()}, ${currencyShort(Number(unit?.price), unit?.project?.currency)} outright${unit?.payment_plan_available ? ', payment plan available' : ''}`}
                    >
                      <span>
                        <span className={styles.unitSize}>
                          <b>{`${unit.unit_size?.replace(/[^0-9]/gi, '') || 'N/A'}`}</b>
                          <span>sqm</span>
                        </span>
                        <span
                          className={unit?.unit_title ? styles.unitUseCommercial : styles.unitUse}
                          style={{ textTransform: 'capitalize' }}
                        >
                          {unit?.unit_title}
                        </span>
                      </span>
                      <span className={styles.unitRight}>
                        <span className={styles.unitPrice}>
                          {currencyShort(Number(unit.price), unit?.project?.currency)} <span>outright</span>
                        </span>
                        {unit?.payment_plan_available && <span className={styles.unitPlan}>Payment plan available</span>}
                      </span>
                    </Link>
                  </ListItem>
                ))}
              </List>
              {isFetchingNextPage && <Spinner />}
            </Stack>
          </Box>
        ) : null}

        <FaqSection listing={detail} faq={faq} />
      </div>

      {toast}
      {photo !== null && (
        <PhotoViewer
          photos={photos}
          listingName={detail?.name}
          listingLocation={detail?.address}
          index={photo}
          onIndex={setPhoto}
          onClose={() => setPhoto(null)}
        />
      )}
    </div>
  );
});
