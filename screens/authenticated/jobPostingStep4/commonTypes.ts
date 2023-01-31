/* eslint-disable import/no-cycle */
/* eslint-disable camelcase */
import { OrgOfficesListType } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';

export interface PricingPlansInfoType {
  lowerRange: number;
  unitCost: number;
  id: number;
}

export interface OrgPricingStatsType {
  remainingFreeCredits: number;
  remainingJPCredits: number;
}

export interface Offering {
  id: number;
  code: string;
  name: string;
  limit: number,
  price_per_unit: number;
  status: string;
  validity: number;
  is_unlimited: boolean;
}

export interface PricingPlanType {
  offering_subscription?: any;
  id: number;
  name: string;
  plan_type: string;
  offerings: Array<Offering>;
  unit_cost: number | null;
  validity_days: number;
  display_name: string;
  expiry_date: string;
  auto_renew: boolean;
  subscription_status: string;
  start_date: string;
}

export interface PricingPlansType {
  MONETIZATION_PLANS: Array<PricingPlanType>;
}

export interface JobPostingStep4StateType {
  pricingPlansInfo: Array<PricingPlanType>;
  selectedPlan: number;
  showPricingPlansPage: boolean;
  orgLocations: Array<OrgOfficesListType>;
  showActivePlans: boolean;
  upgraded: boolean;
  showAddOns: boolean;
  showUpgradeFeatureJob: boolean;
  showUpgradeJP: boolean;
  title?: string;
  description?: string;
}
export interface TotalPricingStat {
  bought: number;
  remaining: number;
}

export type TatalPricingStats = {
  FJ?: TotalPricingStat;
  JP?: TotalPricingStat;
  APP_UL?: TotalPricingStat
  DB_UL?: TotalPricingStat
}

export interface PricingStats {
  plan_wise_pricing_stats: Array<PricingPlanType>;
  total_pricing_stats: TatalPricingStats
}

export interface PricingStatsType {
  pricing_stats: PricingStats
}

export type TitleType = {
  title: string;
  description: string | null;
}
