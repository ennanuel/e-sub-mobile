import type { Metadata } from 'next';
import { cache } from 'react';
import { api } from './api';
import authAxios from '@/api/utils/axios';
import { BaseURL_ONE, BaseURL_TWO, getStoreName } from '@/constants/routes';
import {
  BaseUser,
  BundlePaymentPlanResponse,
  PaperworkResponse,
  ProjectBundle,
  ProjectBundleResponse,
  ProjectDetailResponse,
  ProjectDetails,
} from '@/types';
import { getESubDetails } from '@/api/equity';
import { AxiosError } from 'axios';

export const getUnitDetails = async (listingId: string, unitId: string) => {
  let unitDetails: ProjectBundle | null = null;
  let page = 1;
  let isCheckingMoreUnits = false;

  do {
    const unitsResponse = await loadProjectUnits(listingId, { page });
    const units = unitsResponse.results;
    const foundUnit = units?.find((u) => u.id?.toString() === unitId);

    if (foundUnit) {
      unitDetails = foundUnit;
      isCheckingMoreUnits = false;
    } else if (unitsResponse.next) {
      isCheckingMoreUnits = true;
      page = Number(unitsResponse.next.match(/page=\d+/)?.[0]?.replace('page=', ''));
    }
  } while (isCheckingMoreUnits);

  return unitDetails;
};

export const getPaymentPlanDetails = async (bundleId: number, paymentPlanId: number) => {
  const paymentPlansData = await loadUnitPaymentPaymentPlans(bundleId);
  return paymentPlansData.results.find((p) => p.id === paymentPlanId);
};

export const loadDevelopment = async (listingId = ''): Promise<ProjectDetailResponse> => {
  return getESubDetails();
  // return getProjectDetails(listingId)
};

export type ReferralRealtor = {
  id: number;
  agent_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar: string | null;
  phone: string;
  ref_id: string;
  country_code: string;
};

type ReferralInfoResponse = {
  message: 'Agent retrieved successfully';
  status: true;
  data: ReferralRealtor;
};

export const fetchRealtorByReferralId = async (refId: string): Promise<ReferralInfoResponse> => {
  const response = await authAxios.get(`${BaseURL_ONE}/user/agent/referral/${refId}`);
  return response.data;
};

export const getProjectDetails = async (listingId: string): Promise<ProjectDetails> => {
  const storeName = getStoreName();

  const url = `${BaseURL_ONE}/investment/project/${listingId}?store_name=${storeName}`;
  const response = await authAxios.get(url);
  return response.data?.project;
};

export const loadProjectUnits = async (listingId: string, options?: { page?: number }): Promise<ProjectBundleResponse> => {
  const { page = 1 } = options ?? {};
  const url = `${BaseURL_TWO}/investment/project-bundles/?project_id=${listingId}&page=${page}`;
  const response = await authAxios.get(url);
  return response.data;
};

export const loadUnitPaymentPaymentPlans = async (bundleId: number): Promise<BundlePaymentPlanResponse> => {
  const response = await authAxios.get(`${BaseURL_TWO}/investment/bundle-paymentplans/?bundle_id=${bundleId}`);
  return response.data;
};

export const loadListingPaperwork = async (listingId: string): Promise<PaperworkResponse | null> => {
  if (!listingId) return null;
  return {
    paperwork: {
      summary: 'C of O, survey plan, offer of statutory right of occupancy',
      documents: [
        { id: 'rofo', label: 'FEDERAL CAPITAL TERRITORY', title: 'Right of Occupancy' },
        { id: 'survey', label: 'SURVEY PLAN', title: 'Plot boundaries' },
        { id: 'cofo', label: 'CERTIFICATE OF OCCUPANCY', title: 'C of O' },
      ],
    },
  };
};

export const loadFaq = cache((slug: string) => api.getFaq(slug));
export const loadTerms = cache((slug: string) => api.getTerms(slug));

type SlugParams = { params: Promise<{ slug: string }> };

/** generateMetadata for a page: "<label> · <development name>". */
export function titled(label: string) {
  return async function generateMetadata({ params }: SlugParams): Promise<Metadata> {
    const { slug } = await params;
    const res = await loadDevelopment(slug);
    const project = res?.project ?? ({} as ProjectDetails);
    return { title: `${label ?? ''} · ${project?.name ?? ''}` };
  };
}
